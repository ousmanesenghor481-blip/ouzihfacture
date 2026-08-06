import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qevkhngxdrpjjrjgecwp.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const keyPrefix = serviceRoleKey ? serviceRoleKey.slice(0, 10) + '...' : 'NON_DEFINIE';
  console.log('[ENV CHECK] Supabase URL:', supabaseUrl);
  console.log('[ENV CHECK] SERVICE_ROLE_KEY (10 premiers caractères):', keyPrefix);

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('[Admin Client] URL Supabase ou SUPABASE_SERVICE_ROLE_KEY absente dans process.env.');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
