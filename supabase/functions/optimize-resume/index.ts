
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OptimizeRequest {
  jobDescription: string;
  resumeText: string | null;
  resumePath: string | null;
  tone: string;
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
    const requestData: OptimizeRequest = await req.json();
    const { jobDescription, resumeText, resumePath, tone } = requestData;

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

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Construct prompt
    const prompt = `
    As an AI resume optimization assistant, please analyze and optimize the following resume to better match the given job description.
    
    The tone should be: ${tone || 'professional'}.
    
    Please provide an optimized version of the resume that:
    1. Highlights relevant skills and experiences that match the job requirements
    2. Includes important keywords from the job description
    3. Removes irrelevant information
    4. Improves phrasing and clarity
    5. Maintains a professional structure
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    ORIGINAL RESUME:
    ${resumeContent}
    
    Please provide the complete optimized resume below:
    `;

    console.log('Sending request to Gemini API');
    
    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const optimizedResume = response.text();

    // Track usage in the ai_usage table
    const { error: usageError } = await supabase
      .from('ai_usage')
      .insert({
        user_id: userId,
        tokens: Math.ceil((prompt.length + optimizedResume.length) / 4), // Rough estimate of tokens
        provider: 'gemini'
      });

    if (usageError) {
      console.error('Error tracking AI usage:', usageError);
    }

    // Store the optimized resume in the resume_optimizations table
    const { error: optimizationError } = await supabase
      .from('resume_optimizations')
      .insert({
        user_id: userId,
        job_description: jobDescription,
        original_resume_path: resumePath,
        optimized_resume_path: null, // We're not storing the file, just the text
        cover_letter: null,
        cold_email: null
      });

    if (optimizationError) {
      console.error('Error storing optimization record:', optimizationError);
    }

    console.log('Successfully generated optimized resume');

    return new Response(
      JSON.stringify({ 
        optimizedResume,
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
    console.error('Error in optimize-resume function:', error);
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
