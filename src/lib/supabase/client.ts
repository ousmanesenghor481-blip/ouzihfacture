import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qevkhngxdrpjjrjgecwp.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFldmtobmd4ZHJwampyamdlY3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxODI0ODEsImV4cCI6MjA1Mzc1ODQ4MX0.placeholder';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
