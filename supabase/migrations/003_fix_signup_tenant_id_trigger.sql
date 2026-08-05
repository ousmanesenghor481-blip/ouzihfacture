-- ========================================================
-- OuzihFacture — Migration 003: Automate tenant_id assignment on user registration
-- ========================================================

-- 1. Create tenants table if not exists
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Mon Entreprise',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
CREATE POLICY "Users can view own tenant" ON public.tenants FOR SELECT
  USING (
    id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR id = auth.uid()
  );

-- 2. Ensure tenant_id column exists on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 3. Fix existing orphan profiles (assign tenant_id = id or generate new tenant)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id, full_name, email FROM public.profiles WHERE tenant_id IS NULL LOOP
    INSERT INTO public.tenants (id, name)
    VALUES (rec.id, COALESCE(rec.full_name, 'Entreprise'))
    ON CONFLICT (id) DO NOTHING;

    UPDATE public.profiles
    SET tenant_id = rec.id
    WHERE id = rec.id AND tenant_id IS NULL;
  END LOOP;
END $$;

-- 4. Create/Replace atomic SQL Trigger Function for new user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_company_name TEXT;
  v_full_name TEXT;
BEGIN
  v_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mon Entreprise');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  -- Use user's UUID as primary tenant ID for 1-to-1 tenant ownership on signup
  v_tenant_id := NEW.id;

  -- Step A: Insert into tenants table
  INSERT INTO public.tenants (id, name)
  VALUES (v_tenant_id, v_company_name)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Step B: Insert mandatory profile with tenant_id
  INSERT INTO public.profiles (id, full_name, email, role, tenant_id)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.email,
    'owner',
    v_tenant_id
  )
  ON CONFLICT (id) DO UPDATE
  SET tenant_id = EXCLUDED.tenant_id,
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;

  -- Step C: Insert company_settings
  INSERT INTO public.company_settings (user_id, company_name, company_email)
  VALUES (
    NEW.id,
    v_company_name,
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Step D: Initialize tenant_quotas entry
  INSERT INTO public.tenant_quotas (user_id, tenant_id, max_invoices, invoices_used)
  VALUES (
    NEW.id,
    v_tenant_id,
    5,
    0
  )
  ON CONFLICT (user_id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
