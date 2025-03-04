
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
    const { user } = await req.json();
    
    if (!user?.id) {
      throw new Error('User data is missing or invalid');
    }

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:5173";
    const REDIRECT_URI = `${SITE_URL}/auth/callback`;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error("Google client credentials are missing. Please check environment variables.");
    }
    
    const oauth2Client = new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUri: "https://oauth2.googleapis.com/token",
      redirectUri: REDIRECT_URI,
      defaults: {
        scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      },
    });

    const state = generateStateParam();
    
    // Initialize Supabase client with service role for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Store state in database with service role permissions
    const { error: stateError } = await supabaseClient
      .from('states')
      .insert({ 
        user_id: user.id, 
        state 
      });

    if (stateError) {
      console.error("Error storing state:", stateError);
      throw new Error(`Failed to store state: ${stateError.message}`);
    }

    const authorizeUrl = await oauth2Client.code.getAuthorizationUri({
      state,
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      access_type: "offline", // Request a refresh token
      prompt: "consent" // Force showing the consent screen
    });

    return new Response(
      JSON.stringify({ url: authorizeUrl.toString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in connect-gmail function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
