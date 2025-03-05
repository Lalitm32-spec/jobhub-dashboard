
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
    console.log("Gmail callback function called");
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    console.log("Received callback with code:", code ? "Present" : "Missing");
    console.log("Received callback with state:", state);

    if (!code || !state) {
      console.error("Missing code or state parameter");
      return new Response(
        JSON.stringify({ error: "Missing code or state parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get environment variables
    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const SITE_URL = Deno.env.get("SITE_URL") || "https://preview--jobhub-dashboard.lovable.app";
    const REDIRECT_URI = `${SITE_URL}/auth/callback`;

    console.log("Environment variables:", {
      "GOOGLE_CLIENT_ID exists": !!GOOGLE_CLIENT_ID,
      "GOOGLE_CLIENT_SECRET exists": !!GOOGLE_CLIENT_SECRET,
      "SITE_URL": SITE_URL,
      "REDIRECT_URI": REDIRECT_URI
    });

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Google client credentials are missing");
      return new Response(
        JSON.stringify({ error: "Google client credentials are missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials are missing");
      return new Response(
        JSON.stringify({ error: "Supabase credentials are missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log("Initialized Supabase client");

    // Verify state parameter
    try {
      const { data: stateData, error: stateError } = await supabaseClient
        .from('states')
        .select('user_id')
        .eq('state', state)
        .single();

      if (stateError || !stateData) {
        console.error("State verification error:", stateError);
        return new Response(
          JSON.stringify({ error: "Invalid state parameter" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("State verified, user_id:", stateData.user_id);

      // Initialize OAuth2 client
      const oauth2Client = new OAuth2Client({
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUri: "https://oauth2.googleapis.com/token",
        redirectUri: REDIRECT_URI,
      });

      // Exchange code for tokens
      try {
        console.log("Exchanging code for tokens...");
        const tokens = await oauth2Client.code.getToken(code);

        console.log("Tokens received:", JSON.stringify({
          accessToken: tokens.accessToken ? "Received" : "Missing",
          refreshToken: tokens.refreshToken ? "Received" : "Missing"
        }));

        if (!tokens.accessToken) {
          console.error("Access token missing in response");
          return new Response(
            JSON.stringify({ error: "Access token missing in response" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Store tokens in database
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
          return new Response(
            JSON.stringify({ error: `Failed to store tokens: ${integrationError.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
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
        return new Response(
          JSON.stringify({ error: `Failed to exchange code for tokens: ${tokenError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (dbError) {
      console.error("Database error verifying state:", dbError);
      return new Response(
        JSON.stringify({ error: `Database error: ${dbError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unhandled error in gmail-callback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
