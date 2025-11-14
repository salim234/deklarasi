
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tujpjgyuiauanvlvsygb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1anBqZ3l1aWF1YW52bHZzeWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTQzODYsImV4cCI6MjA3ODYzMDM4Nn0.s8ZeBBE9TOqHB4FKtK_Ucc643y2ocXNZhAWVWha_85I';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
