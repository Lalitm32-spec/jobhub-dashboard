
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

    console.log("Received callback with code:", code ? "Present" : "Missing");
    console.log("Received callback with state:", state);

    if (!code || !state) {
      throw new Error("Missing code or state parameter");
    }

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:5173";
    const REDIRECT_URI = `${SITE_URL}/auth/callback`;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error("Google client credentials are missing");
    }

    // Initialize Supabase client with service role for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify state parameter
    const { data: stateData, error: stateError } = await supabaseClient
      .from('states')
      .select('user_id')
      .eq('state', state)
      .single();

    if (stateError || !stateData) {
      console.error("State verification error:", stateError);
      throw new Error("Invalid state parameter");
    }

    console.log("State verified, user_id:", stateData.user_id);

    const oauth2Client = new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUri: "https://oauth2.googleapis.com/token",
      redirectUri: REDIRECT_URI,
    });

    // Exchange code for tokens
    try {
      const tokens = await oauth2Client.code.getToken(code);

      console.log("Tokens received:", JSON.stringify({
        accessToken: tokens.accessToken ? "Received" : "Missing",
        refreshToken: tokens.refreshToken ? "Received" : "Missing"
      }));

      // Store tokens in database with service role permissions
      const { error: integrationError } = await supabaseClient
        .from('gmail_integrations')
        .upsert({
          user_id: stateData.user_id,
          gmail_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          updated_at: new Date().toISOString()
        });

      if (integrationError) {
        console.error("Integration error:", integrationError);
        throw integrationError;
      }

      console.log("Tokens stored successfully");

      // Clean up state
      await supabaseClient
        .from('states')
        .delete()
        .eq('state', state);

      // Redirect back to the settings page
      const redirectUrl = `${SITE_URL}/settings`;
      console.log("Redirecting to:", redirectUrl);
      
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: redirectUrl,
        },
      });
    } catch (tokenError) {
      console.error("Error exchanging code for tokens:", tokenError);
      throw new Error(`Failed to exchange code for tokens: ${tokenError.message}`);
    }
  } catch (error) {
    console.error("Error in gmail-callback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
