
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";

function generateStateParam() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

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
    console.log("Connect Gmail function called");

    // Parse the request body
    let body;
    try {
      body = await req.json();
      console.log("Request body:", JSON.stringify(body));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate user data
    const { user } = body;
    if (!user?.id) {
      console.error("Missing or invalid user data:", user);
      return new Response(
        JSON.stringify({ error: "User data is missing or invalid" }),
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
        JSON.stringify({ error: "Google client credentials are missing. Please check environment variables." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize OAuth2 client
    const oauth2Client = new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUri: "https://oauth2.googleapis.com/token",
      redirectUri: REDIRECT_URI,
      defaults: {
        scope: ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"],
      },
    });

    // Generate state parameter
    const state = generateStateParam();
    console.log("Generated state parameter:", state);
    
    // Initialize Supabase client
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials are missing");
      return new Response(
        JSON.stringify({ error: "Supabase credentials are missing. Please check environment variables." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log("Initialized Supabase client");

    // Store state in database
    try {
      const { error: stateError } = await supabaseClient
        .from('states')
        .insert({ 
          user_id: user.id, 
          state 
        });

      if (stateError) {
        console.error("Error storing state:", stateError);
        return new Response(
          JSON.stringify({ error: `Failed to store state: ${stateError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("State stored in database successfully");
    } catch (dbError) {
      console.error("Database error storing state:", dbError);
      return new Response(
        JSON.stringify({ error: `Database error: ${dbError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate the authorization URL
    try {
      console.log("Generating authorization URL...");
      const authUri = await oauth2Client.code.getAuthorizationUri({
        state,
        scope: ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"],
        access_type: "offline",
        prompt: "consent"
      });
      
      // Explicitly get the URL as a string
      const authUriString = authUri.toString();
      
      console.log("Generated authorization URL:", authUriString);
      
      // Verify URL is valid
      if (!authUriString || typeof authUriString !== 'string' || !authUriString.startsWith('https://')) {
        console.error(`Invalid authorization URL: ${authUriString}`);
        return new Response(
          JSON.stringify({ error: `Invalid authorization URL generated` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ url: authUriString }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    } catch (urlError) {
      console.error("Error generating authorization URL:", urlError);
      return new Response(
        JSON.stringify({ error: `Failed to generate authorization URL: ${urlError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unhandled error in connect-gmail function:", error);
    return new Response(
      JSON.stringify({ error: `Unhandled error: ${error.message}` }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
