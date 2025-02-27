
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  jobDescription: string;
  resumeText: string | null;
  resumePath: string | null;
  type: 'cover-letter' | 'cold-email';
  tone: string;
  recipientName: string | null;
  companyName: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user ID from auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Invalid user token');
    }
    
    const userId = userData.user.id;
    console.log('Processing request for user:', userId);

    // Parse request body
    const requestData: GenerateRequest = await req.json();
    const { 
      jobDescription, 
      resumeText, 
      resumePath, 
      type, 
      tone, 
      recipientName, 
      companyName 
    } = requestData;

    if (!jobDescription) {
      throw new Error('Job description is required');
    }

    // Get resume content - either from text or from file
    let resumeContent = resumeText;
    
    if (!resumeContent && resumePath) {
      console.log('Fetching resume from path:', resumePath);
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('resumes')
        .download(resumePath);

      if (downloadError) {
        console.error('Error downloading resume:', downloadError);
        throw new Error('Failed to download resume');
      }

      resumeContent = await fileData.text();
    }

    if (!resumeContent) {
      throw new Error('Resume content is required');
    }

    console.log('Resume content length:', resumeContent.length);
    console.log('Job description length:', jobDescription.length);
    console.log('Content type:', type);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    let prompt;
    if (type === 'cover-letter') {
      // Cover letter prompt
      prompt = `
      Write a professional cover letter for the following job description, using the provided resume as context.
      
      The tone should be: ${tone || 'professional'}.
      ${recipientName ? `Address the letter to: ${recipientName}` : 'Use a generic salutation if no recipient is specified.'}
      ${companyName ? `The company name is: ${companyName}` : ''}
      
      Focus on:
      1. Key skills and experiences from the resume that align with the job requirements
      2. Why you're a good fit for the role
      3. What you can bring to the company
      4. Express enthusiasm for the position
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      RESUME:
      ${resumeContent}
      
      Please write a complete, well-structured cover letter:
      `;
    } else {
      // Cold email prompt
      prompt = `
      Write a concise and professional cold email to express interest in the following job description.
      
      The tone should be: ${tone || 'professional'}.
      ${recipientName ? `Address the email to: ${recipientName}` : 'Use a generic salutation if no recipient is specified.'}
      ${companyName ? `The company name is: ${companyName}` : ''}
      
      Your email should:
      1. Have a clear and specific subject line
      2. Be brief (no more than 200 words)
      3. Include a brief introduction
      4. Highlight 1-2 key skills/experiences relevant to the job
      5. Include a call to action (requesting an interview or conversation)
      6. End with a professional sign-off
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      RESUME (for reference):
      ${resumeContent}
      
      Please write a complete, well-structured cold email:
      `;
    }

    console.log('Sending request to Gemini API');
    
    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    // Track usage in the ai_usage table
    const { error: usageError } = await supabase
      .from('ai_usage')
      .insert({
        user_id: userId,
        tokens: Math.ceil((prompt.length + generatedText.length) / 4), // Rough estimate of tokens
        provider: 'gemini'
      });

    if (usageError) {
      console.error('Error tracking AI usage:', usageError);
    }

    // Update the resume_optimizations table with the generated content
    const { data: existingOptimization } = await supabase
      .from('resume_optimizations')
      .select('id')
      .eq('user_id', userId)
      .eq('job_description', jobDescription)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingOptimization && existingOptimization.length > 0) {
      const updateData = type === 'cover-letter' 
        ? { cover_letter: generatedText } 
        : { cold_email: generatedText };
      
      const { error: updateError } = await supabase
        .from('resume_optimizations')
        .update(updateData)
        .eq('id', existingOptimization[0].id);

      if (updateError) {
        console.error('Error updating optimization record:', updateError);
      }
    } else {
      // Create a new record if none exists
      const insertData = {
        user_id: userId,
        job_description: jobDescription,
        original_resume_path: resumePath,
        optimized_resume_path: null,
        cover_letter: type === 'cover-letter' ? generatedText : null,
        cold_email: type === 'cold-email' ? generatedText : null
      };
      
      const { error: insertError } = await supabase
        .from('resume_optimizations')
        .insert(insertData);

      if (insertError) {
        console.error('Error creating optimization record:', insertError);
      }
    }

    console.log(`Successfully generated ${type}`);

    return new Response(
      JSON.stringify({ 
        generatedText,
        success: true 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unknown error occurred',
        success: false
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    );
  }
});
