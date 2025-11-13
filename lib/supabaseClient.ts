
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cheryyyuptjbjdltfvph.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoZXJ5eXl1cHRqYmpkbHRmdnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjU0NDksImV4cCI6MjA3ODYwMTQ0OX0.4rnbd5EzusLL0Tf0QP_d5sG3HakDjsODQ0vQOcB84yc';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);