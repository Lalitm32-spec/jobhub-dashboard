import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    // Convert file to text (this is a simplified version - you'd need proper PDF/DOCX parsing)
    const resumeText = await fileData.text()

    // Use GPT-4 to optimize the resume
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume optimizer. Analyze the resume and job description to provide optimized content that highlights relevant skills and experience.'
          },
          {
            role: 'user',
            content: `Resume: ${resumeText}\n\nJob Description: ${jobDescription}\n\nPlease optimize this resume for the job description, keeping the original structure but enhancing relevant skills and experience. Also generate a cover letter and cold email.`
          }
        ],
      }),
    })

    const optimizationResult = await response.json()
    
    // Parse the optimization result
    const { optimizedResume, coverLetter, coldEmail } = JSON.parse(optimizationResult.choices[0].message.content)

    return new Response(
      JSON.stringify({ optimizedResume, coverLetter, coldEmail }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})