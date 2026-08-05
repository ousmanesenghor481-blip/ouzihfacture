-- ==============================================================================
-- OuzihFacture — SCRIPT SQL COMPLET À COPIER/COLLER DANS L'ÉDITEUR SQL SUPABASE
-- ==============================================================================

-- 1. S'assurer que la table tenants existe
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Mon Entreprise',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. S'assurer que la colonne tenant_id existe dans profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 3. Attribuer un tenant_id à tous les comptes existants qui n'en ont pas
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

-- 4. Activer RLS et autoriser l'accès sans bloquer l'insertion automatique
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated on tenants" ON public.tenants;
CREATE POLICY "Allow all for authenticated on tenants" ON public.tenants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated on profiles" ON public.profiles;
CREATE POLICY "Allow all for authenticated on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 5. Créer la fonction PL/pgSQL avec SECURITY DEFINER (exécute en SuperUser sans blocage RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_tenant_id UUID;
  v_company_name TEXT;
  v_full_name TEXT;
BEGIN
  v_tenant_id := NEW.id;
  v_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mon Entreprise');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  -- Étape A : Insérer dans la table tenants
  INSERT INTO public.tenants (id, name)
  VALUES (v_tenant_id, v_company_name)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Étape B : Insérer dans la table profiles avec tenant_id OBLIGATOIRE
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

  -- Étape C : Insérer dans company_settings
  INSERT INTO public.company_settings (user_id, company_name, company_email)
  VALUES (
    NEW.id,
    v_company_name,
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Étape D : Insérer dans tenant_quotas
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
$$;

-- 6. Lier le trigger sur la table auth.users (AFTER INSERT)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
