
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";

function generateStateParam() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  try {
    const { user } = await req.json();
    
    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const SITE_URL = Deno.env.get("SITE_URL")!;
    const REDIRECT_URI = `${SITE_URL}/auth/callback`;

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
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Store state in database
    const { error: stateError } = await supabaseClient
      .from('states')
      .insert({ user_id: user.id, state });

    if (stateError) throw stateError;

    const authorizeUrl = await oauth2Client.code.getAuthorizationUri({
      state,
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    });

    return new Response(
      JSON.stringify({ url: authorizeUrl.toString() }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
