
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: {
      name: string;
      value: string;
    }[];
  };
}

// Common patterns for different email categories
const EMAIL_PATTERNS = {
  application: [
    /application (received|confirmed|submitted)/i,
    /thank you for applying/i,
    /we(\'ve| have) received your application/i
  ],
  interview: [
    /interview invitation/i,
    /schedule.*interview/i,
    /interview.*schedule/i,
    /phone screen/i,
    /technical assessment/i
  ],
  rejection: [
    /thank you for your interest/i,
    /we regret to inform/i,
    /we have decided to move forward/i,
    /we will not be moving forward/i,
    /position has been filled/i
  ],
  offer: [
    /job offer/i,
    /offer letter/i,
    /congratulations/i,
    /welcome to the team/i
  ]
};

function categorizeEmail(subject: string, content: string): string {
  const textToCheck = `${subject} ${content}`.toLowerCase();
  
  for (const [category, patterns] of Object.entries(EMAIL_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(textToCheck))) {
      return category;
    }
  }
  
  return 'other';
}

async function refreshGmailToken(refreshToken: string): Promise<string | null> {
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token refresh failed:', await tokenResponse.text());
      return null;
    }

    const data = await tokenResponse.json();
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data: integrations, error: integrationsError } = await supabase
      .from('gmail_integrations')
      .select('*');

    if (integrationsError) throw integrationsError;

    for (const integration of integrations) {
      try {
        if (!integration.gmail_token || !integration.refresh_token) {
          console.error(`Missing tokens for user ${integration.user_id}`);
          continue;
        }

        let currentToken = integration.gmail_token;
        let response = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20',
          {
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 401) {
          console.log(`Refreshing token for user ${integration.user_id}`);
          const newToken = await refreshGmailToken(integration.refresh_token);
          
          if (!newToken) {
            console.error(`Failed to refresh token for user ${integration.user_id}`);
            continue;
          }

          const { error: updateError } = await supabase
            .from('gmail_integrations')
            .update({ gmail_token: newToken })
            .eq('user_id', integration.user_id);

          if (updateError) {
            console.error(`Failed to update token for user ${integration.user_id}:`, updateError);
            continue;
          }

          currentToken = newToken;
          response = await fetch(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20',
            {
              headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
        }

        if (!response.ok) {
          console.error(`Error fetching emails for user ${integration.user_id}:`, await response.text());
          continue;
        }

        const { messages } = await response.json();
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', integration.user_id);

        for (const message of messages) {
          const emailResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!emailResponse.ok) {
            console.error(`Error fetching email ${message.id}:`, await emailResponse.text());
            continue;
          }

          const emailData: GmailMessage = await emailResponse.json();
          const subject = emailData.payload.headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
          const from = emailData.payload.headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
          
          for (const job of jobs) {
            const companyPattern = new RegExp(job.company, 'i');
            const positionPattern = new RegExp(job.position, 'i');
            
            if (companyPattern.test(subject) || companyPattern.test(from)) {
              const category = categorizeEmail(subject, emailData.snippet);
              
              const { error: emailError } = await supabase
                .from('job_emails')
                .upsert({
                  user_id: integration.user_id,
                  job_id: job.id,
                  email_id: message.id,
                  subject,
                  sender: from,
                  email_content: emailData.snippet,
                  received_at: new Date().toISOString(),
                  category
                });

              if (emailError) {
                console.error(`Error storing email for job ${job.id}:`, emailError);
                continue;
              }

              // Update job status based on email category if needed
              if (category === 'rejection') {
                await supabase
                  .from('jobs')
                  .update({ status: 'rejected' })
                  .eq('id', job.id)
                  .eq('user_id', integration.user_id);
              } else if (category === 'interview') {
                await supabase
                  .from('jobs')
                  .update({ status: 'interviewing' })
                  .eq('id', job.id)
                  .eq('user_id', integration.user_id);
              } else if (category === 'offer') {
                await supabase
                  .from('jobs')
                  .update({ status: 'offered' })
                  .eq('id', job.id)
                  .eq('user_id', integration.user_id);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing integration for user ${integration.user_id}:`, error);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in sync-gmail function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
