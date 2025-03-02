
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      throw new Error("Missing code or state parameter");
    }

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const SITE_URL = Deno.env.get("SITE_URL")!;
    const REDIRECT_URI = `${SITE_URL}/auth/callback`;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Verify state parameter
    const { data: stateData, error: stateError } = await supabaseClient
      .from('states')
      .select('user_id')
      .eq('state', state)
      .single();

    if (stateError || !stateData) {
      throw new Error("Invalid state parameter");
    }

    const oauth2Client = new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUri: "https://oauth2.googleapis.com/token",
      redirectUri: REDIRECT_URI,
    });

    // Exchange code for tokens
    const tokens = await oauth2Client.code.getToken(code);

    // Store tokens in database
    const { error: integrationError } = await supabaseClient
      .from('gmail_integrations')
      .upsert({
        user_id: stateData.user_id,
        gmail_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

    if (integrationError) throw integrationError;

    // Clean up state
    await supabaseClient
      .from('states')
      .delete()
      .eq('state', state);

    // Redirect back to the settings page
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: `${SITE_URL}/settings`,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
