// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dflvfgkqecwqpcfwkbqa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbHZmZ2txZWN3cXBjZndrYnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3NDE4OTgsImV4cCI6MjA1MzMxNzg5OH0.Je3eDbmTgXOOdp6I6c53theqP1wA4t2QureMEJ-qFx0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);