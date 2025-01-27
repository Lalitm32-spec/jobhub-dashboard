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

    // Convert file to text
    const resumeText = await fileData.text()
    console.log('Resume text length:', resumeText.length)

    try {
      // Generate optimized resume using Gemini
      const resumeResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
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

      if (!resumeResponse.ok) {
        const errorText = await resumeResponse.text()
        console.error('Gemini API error:', errorText)
        throw new Error(`Failed to generate optimized resume: ${errorText}`)
      }

      const resumeData = await resumeResponse.json()
      console.log('Resume generation response:', JSON.stringify(resumeData))

      if (!resumeData.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API')
      }

      const optimizedResume = resumeData.candidates[0].content.parts[0].text

      // Generate cover letter using Gemini
      const coverLetterResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
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

      if (!coverLetterResponse.ok) {
        const errorText = await coverLetterResponse.text()
        console.error('Gemini API error for cover letter:', errorText)
        throw new Error(`Failed to generate cover letter: ${errorText}`)
      }

      const coverLetterData = await coverLetterResponse.json()
      if (!coverLetterData.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API for cover letter')
      }

      const coverLetter = coverLetterData.candidates[0].content.parts[0].text

      // Generate cold email using Gemini
      const coldEmailResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
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

      if (!coldEmailResponse.ok) {
        const errorText = await coldEmailResponse.text()
        console.error('Gemini API error for cold email:', errorText)
        throw new Error(`Failed to generate cold email: ${errorText}`)
      }

      const coldEmailData = await coldEmailResponse.json()
      if (!coldEmailData.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API for cold email')
      }

      const coldEmail = coldEmailData.candidates[0].content.parts[0].text

      return new Response(
        JSON.stringify({ optimizedResume, coverLetter, coldEmail }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Error in Gemini API calls:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in optimize-resume function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})