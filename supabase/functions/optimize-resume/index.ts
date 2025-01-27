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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { resumePath, jobDescription } = await req.json()

    // Download the resume file
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('resumes')
      .download(resumePath)

    if (downloadError) {
      throw new Error('Failed to download resume')
    }

    // Convert file to text
    const resumeText = await fileData.text()

    // Generate optimized resume using Gemini
    const resumeResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Optimize this resume for the following job description. Keep the original structure but enhance relevant skills and experience. Resume: ${resumeText}\n\nJob Description: ${jobDescription}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    const resumeData = await resumeResponse.json()
    const optimizedResume = resumeData.candidates[0].content.parts[0].text

    // Generate cover letter using Gemini
    const coverLetterResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a professional cover letter based on this resume and job description. Resume: ${resumeText}\n\nJob Description: ${jobDescription}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    const coverLetterData = await coverLetterResponse.json()
    const coverLetter = coverLetterData.candidates[0].content.parts[0].text

    // Generate cold email using Gemini
    const coldEmailResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Write a concise cold email based on this resume and job description. Keep it professional and highlight key qualifications. Resume: ${resumeText}\n\nJob Description: ${jobDescription}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    const coldEmailData = await coldEmailResponse.json()
    const coldEmail = coldEmailData.candidates[0].content.parts[0].text

    return new Response(
      JSON.stringify({ optimizedResume, coverLetter, coldEmail }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in optimize-resume function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})