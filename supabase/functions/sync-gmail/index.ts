
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    // Get all active Gmail integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('gmail_integrations')
      .select('*');

    if (integrationsError) throw integrationsError;

    for (const integration of integrations) {
      try {
        // Get user's jobs to match against emails
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', integration.user_id);

        // Fetch recent emails from Gmail API
        const response = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20',
          {
            headers: {
              'Authorization': `Bearer ${integration.gmail_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error(`Error fetching emails for user ${integration.user_id}:`, await response.text());
          continue;
        }

        const { messages } = await response.json();

        // Process each email
        for (const message of messages) {
          const emailResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: {
                'Authorization': `Bearer ${integration.gmail_token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!emailResponse.ok) {
            console.error(`Error fetching email ${message.id}:`, await emailResponse.text());
            continue;
          }

          const emailData: GmailMessage = await emailResponse.json();
          
          // Extract email subject and sender
          const subject = emailData.payload.headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
          const from = emailData.payload.headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
          
          // Check if this email matches any job applications
          for (const job of jobs) {
            const companyPattern = new RegExp(job.company, 'i');
            const positionPattern = new RegExp(job.position, 'i');
            
            if (companyPattern.test(subject) || companyPattern.test(from)) {
              // Store the email in job_emails table
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
                });

              if (emailError) {
                console.error(`Error storing email for job ${job.id}:`, emailError);
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
