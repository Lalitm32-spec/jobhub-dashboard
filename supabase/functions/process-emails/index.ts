
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to extract company name
function extractCompanyName(sender: string, content: string): string | null {
  const domainMatch = sender.match(/@(.*?)\./);
  if (domainMatch) {
    return domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
  }
  return null;
}

// Helper function to extract position
function extractPosition(subject: string, content: string): string | null {
  // Look for common job title patterns in subject
  const positionRegex = /(?:regarding|re:|for)\s*(.*?)\s*(?:position|role|opportunity|opening)/i;
  const match = subject.match(positionRegex);
  if (match) {
    return match[1].trim();
  }
  return null;
}

// Helper function to extract job reference ID
function extractJobReferenceId(content: string): string | null {
  const idRegex = /(Application|Job|Requisition|Reference)\s*(ID|Number|Code)?[:\s]*([a-zA-Z0-9-]+)/i;
  const match = content.match(idRegex);
  if (match) {
    return match[3]; // The captured ID
  }
  return null;
}

// Email categorization helper functions
const isInterviewInvitation = (emailContent: string) => {
  const interviewRegex = /(interview|schedule|next steps|zoom|meet|calendar|discuss your application)/i;
  return interviewRegex.test(emailContent);
};

const isRejection = (emailContent: string) => {
  const rejectionRegex = /(regret to inform|not selected|another candidate|moved forward with other applicants|not moving forward|position has been filled)/i;
  return rejectionRegex.test(emailContent);
};

const isOffer = (emailContent: string) => {
  const offerRegex = /(job offer|pleased to offer|congratulations on|formal offer|offer letter)/i;
  return offerRegex.test(emailContent);
};

const isApplicationConfirmation = (emailContent: string) => {
  const confirmationRegex = /(application.*received|thank you for applying|application.*confirmation|successfully.*submitted)/i;
  return confirmationRegex.test(emailContent);
};

// Main categorization function
function categorizeEmail(subject: string, content: string): string | null {
  const lowerCaseContent = content.toLowerCase();
  const lowerCaseSubject = subject.toLowerCase();
  const combinedText = `${lowerCaseSubject} ${lowerCaseContent}`;

  if (isInterviewInvitation(combinedText)) {
    return "interview";
  }
  if (isRejection(combinedText)) {
    return "rejected";
  }
  if (isOffer(combinedText)) {
    return "offer";
  }
  if (isApplicationConfirmation(combinedText)) {
    return "application_confirmation";
  }
  return "other";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails)) {
      return new Response(
        JSON.stringify({ error: "Invalid input: emails must be an array" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const results = [];
    console.log(`Processing ${emails.length} emails`);

    for (const email of emails) {
      const { email_id, subject, sender, received_at, email_content, user_id } = email;
      console.log(`Processing email ${email_id} from ${sender}`);

      // Extract information
      const companyName = extractCompanyName(sender, email_content);
      const position = extractPosition(subject, email_content);
      const jobReferenceId = extractJobReferenceId(email_content);
      const category = categorizeEmail(subject, email_content);

      // Match email to job
      let matchedJob = null;
      if (jobReferenceId) {
        // Try matching by reference ID first
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("user_id", user_id)
          .eq("job_reference_id", jobReferenceId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching job by ID:", error);
          results.push({ email_id, status: "error", error: error.message });
          continue;
        }
        matchedJob = data;
      }

      if (!matchedJob && companyName && position) {
        // Fallback: Match by company and position
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("user_id", user_id)
          .ilike("company", `%${companyName}%`)
          .ilike("position", `%${position}%`)
          .maybeSingle();

        if (error) {
          console.error("Error fetching job by company/position:", error);
          results.push({ email_id, status: "error", error: error.message });
          continue;
        }
        matchedJob = data;
      }

      // Update job status if matched and category indicates a status change
      let newStatus = matchedJob?.status;
      if (matchedJob && category) {
        switch (category) {
          case "interview":
            newStatus = "INTERVIEW";
            break;
          case "rejected":
            newStatus = "REJECTED";
            break;
          case "offer":
            newStatus = "OFFER";
            break;
        }

        if (newStatus && newStatus !== matchedJob.status) {
          const { error: updateError } = await supabase
            .from("jobs")
            .update({ 
              status: newStatus, 
              updated_at: new Date().toISOString() 
            })
            .eq("id", matchedJob.id);

          if (updateError) {
            console.error("Error updating job status:", updateError);
            results.push({ email_id, status: "error", error: updateError.message });
            continue;
          }
        }
      }

      // Log the processed email
      const { error: insertError } = await supabase
        .from('job_emails')
        .insert({
          email_id,
          subject,
          sender,
          received_at,
          email_content,
          category,
          company_name: companyName,
          position,
          job_id: matchedJob?.id,
          user_id,
        });

      if (insertError) {
        console.error("Error logging processed email:", insertError);
        results.push({ email_id, status: "error", error: insertError.message });
        continue;
      }

      // Add processing result
      results.push({
        email_id,
        status: matchedJob ? "matched" : "unmatched",
        matchedJobId: matchedJob?.id,
        newStatus: matchedJob ? (matchedJob.status === newStatus ? "unchanged" : newStatus) : null,
        category,
        companyName,
        position,
      });
    }

    return new Response(
      JSON.stringify({ success: true, results }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? "Internal server error" }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
