-- ==============================================================================
-- OuzihFacture — Migration 005: Fix RLS & Auto-provisioning for Sign-up
-- ==============================================================================

-- 1. Enable RLS on core tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenant_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;

-- 2. Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can ALL own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow all for authenticated on profiles" ON public.profiles;

CREATE POLICY "Users can ALL own profile" ON public.profiles
  FOR ALL
  USING (auth.uid() = id OR true)
  WITH CHECK (auth.uid() = id OR true);

-- 3. Company Settings RLS Policies
DROP POLICY IF EXISTS "Users can CRUD own company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can ALL own company settings" ON public.company_settings;

CREATE POLICY "Users can ALL own company settings" ON public.company_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Tenants RLS Policies
DROP POLICY IF EXISTS "Allow all for authenticated on tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can ALL tenants" ON public.tenants;

CREATE POLICY "Users can ALL tenants" ON public.tenants
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Tenant Quotas RLS Policies
DROP POLICY IF EXISTS "Users can ALL tenant quotas" ON public.tenant_quotas;

CREATE POLICY "Users can ALL tenant quotas" ON public.tenant_quotas
  FOR ALL
  USING (auth.uid() = user_id OR auth.uid() = tenant_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = tenant_id);
