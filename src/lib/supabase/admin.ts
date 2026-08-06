import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qevkhngxdrpjjrjgecwp.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Supabase service_role keys MUST be valid JWT tokens starting with 'eyJ'
  if (!serviceRoleKey || !serviceRoleKey.startsWith('eyJ')) {
    console.warn('[Admin Client] SUPABASE_SERVICE_ROLE_KEY is absent or not a valid JWT token starting with "eyJ". Admin client disabled; falling back to standard client.');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
