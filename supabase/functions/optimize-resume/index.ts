import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate Gemini API key
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set')
      throw new Error('GEMINI_API_KEY is not configured')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { resumePath, jobDescription } = await req.json()
    console.log('Processing request with resumePath:', resumePath, 'and job description length:', jobDescription?.length)

    if (!resumePath || !jobDescription) {
      throw new Error('Missing required parameters')
    }

    // Download the resume file
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('resumes')
      .download(resumePath)

    if (downloadError) {
      console.error('Error downloading resume:', downloadError)
      throw new Error('Failed to download resume')
    }

    const resumeText = await fileData.text()
    console.log('Resume text length:', resumeText.length)

    const generateWithGemini = async (prompt: string) => {
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Gemini API error:', errorData);
          
          // Handle quota exceeded error specifically
          if (errorData.error?.code === 429) {
            throw new Error('API quota exceeded. Please try again later.');
          }
          
          throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Invalid response format from Gemini API');
        }

        return data.candidates[0].content.parts[0].text;
      } catch (error) {
        console.error('Error in Gemini API call:', error);
        throw error;
      }
    };

    try {
      // Generate optimized resume
      const optimizedResume = await generateWithGemini(
        `Optimize this resume for the following job description. Keep the original structure but enhance relevant skills and experience. Resume: ${resumeText}\n\nJob Description: ${jobDescription}`
      );

      // Generate cover letter
      const coverLetter = await generateWithGemini(
        `Create a professional cover letter based on this resume and job description. Resume: ${resumeText}\n\nJob Description: ${jobDescription}`
      );

      // Generate cold email
      const coldEmail = await generateWithGemini(
        `Write a concise cold email based on this resume and job description. Keep it professional and highlight key qualifications. Resume: ${resumeText}\n\nJob Description: ${jobDescription}`
      );

      return new Response(
        JSON.stringify({ optimizedResume, coverLetter, coldEmail }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error in Gemini API calls:', error);
      // Pass through the specific error message for quota exceeded
      if (error.message.includes('quota exceeded')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in optimize-resume function:', error);
    return new Response(
      JSON.stringify({ error: `Failed to generate optimized resume: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});