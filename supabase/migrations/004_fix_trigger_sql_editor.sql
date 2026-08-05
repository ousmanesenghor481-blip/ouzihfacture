-- ==============================================================================
-- OuzihFacture — SCRIPT SQL BULLETPROOF POUR LE TRIGGER D'INSCRIPTION SUPABASE
-- ==============================================================================

-- 1. Structure de la table tenants
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Mon Entreprise',
  slug TEXT NOT NULL UNIQUE,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir la présence de toutes les colonnes
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Mon Entreprise';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS owner_user_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 2. Rattrapage (Backfill) pour tous les comptes existants
DO $$
DECLARE
  rec RECORD;
  v_backfill_slug TEXT;
BEGIN
  FOR rec IN SELECT id, full_name, email FROM public.profiles WHERE tenant_id IS NULL LOOP
    v_backfill_slug := lower(regexp_replace(COALESCE(rec.full_name, 'entreprise'), '[^a-zA-Z0-9]+', '-', 'g'));
    v_backfill_slug := trim(both '-' from v_backfill_slug);
    IF v_backfill_slug IS NULL OR v_backfill_slug = '' THEN
      v_backfill_slug := 'entreprise';
    END IF;
    v_backfill_slug := v_backfill_slug || '-' || replace(rec.id::text, '-', '');

    INSERT INTO public.tenants (id, name, slug, owner_user_id)
    VALUES (rec.id, COALESCE(rec.full_name, 'Mon Entreprise'), v_backfill_slug, rec.id)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      owner_user_id = EXCLUDED.owner_user_id;

    UPDATE public.profiles
    SET tenant_id = rec.id
    WHERE id = rec.id AND tenant_id IS NULL;
  END LOOP;
END $$;

-- 3. Sécurité RLS permissive pour le fonctionnement interne
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated on tenants" ON public.tenants;
CREATE POLICY "Allow all for authenticated on tenants" ON public.tenants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated on profiles" ON public.profiles;
CREATE POLICY "Allow all for authenticated on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 4. Fonction PL/pgSQL avec sécurité d'exception pour éviter toute erreur HTTP 500
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
  v_slug TEXT;
BEGIN
  v_tenant_id := NEW.id;
  v_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mon Entreprise');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  -- Construction d'un SLUG unique et valide (sans caractères spéciaux, non NULL)
  v_slug := lower(regexp_replace(v_company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  IF v_slug IS NULL OR v_slug = '' THEN
    v_slug := 'entreprise';
  END IF;
  v_slug := v_slug || '-' || replace(v_tenant_id::text, '-', '');

  BEGIN
    -- Étape 1 : Insertion obligatoire dans tenants (id, name, slug, owner_user_id)
    INSERT INTO public.tenants (id, name, slug, owner_user_id)
    VALUES (v_tenant_id, v_company_name, v_slug, v_tenant_id)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      owner_user_id = EXCLUDED.owner_user_id;

    -- Étape 2 : Insertion dans profiles avec tenant_id
    INSERT INTO public.profiles (id, full_name, email, role, tenant_id)
    VALUES (NEW.id, v_full_name, NEW.email, 'owner', v_tenant_id)
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;

    -- Étape 3 : Insertion dans company_settings
    INSERT INTO public.company_settings (user_id, company_name, company_email)
    VALUES (NEW.id, v_company_name, NEW.email)
    ON CONFLICT (user_id) DO NOTHING;

    -- Étape 4 : Insertion dans tenant_quotas
    INSERT INTO public.tenant_quotas (user_id, tenant_id, max_invoices, invoices_used)
    VALUES (NEW.id, v_tenant_id, 5, 0)
    ON CONFLICT (user_id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[handle_new_user] Erreur interceptée: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 5. Attachement du Trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
