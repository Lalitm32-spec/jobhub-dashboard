import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  jobDescription: string;
  type: 'resume' | 'cover-letter' | 'cold-email';
  resumeContent?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, type, resumeContent } = await req.json() as GenerateRequest;

    let prompt = '';
    switch (type) {
      case 'resume':
        prompt = `Customize this resume according to this job description. The tone should be Spartan, and remove corporate jargon. Job Description: ${jobDescription}`;
        break;
      case 'cover-letter':
        prompt = `Create a cover letter based on this resume and job description. Use a Spartan tone - be concise yet impactful. Resume: ${resumeContent} Job Description: ${jobDescription}`;
        break;
      case 'cold-email':
        prompt = `Write a cold email based on this resume and job description. Keep the tone Spartan and professional. Resume: ${resumeContent} Job Description: ${jobDescription}`;
        break;
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY!,
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

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});