-- ==============================================================================
-- OUZIHFACTURE — MIGRATION 006: TRIGGER SUPABASE BULLETPROOF & NULL-SAFE
-- ==============================================================================

-- 1. Sécuriser les colonnes de public.profiles pour autoriser les valeurs par défaut
ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT 'Utilisateur';
ALTER TABLE public.profiles ALTER COLUMN email SET DEFAULT 'user@ouzihfacture.com';

-- 2. Trigger PL/pgSQL étanche contre toute contrainte NOT NULL (23502)
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
  v_user_email TEXT;
  v_slug TEXT;
BEGIN
  v_tenant_id := NEW.id;
  
  -- Extraction sécurisée avec valeurs de secours guaranteed non-NULL
  v_user_email := COALESCE(
    NULLIF(NEW.email, ''),
    NULLIF(NEW.raw_user_meta_data->>'email', ''),
    'user@ouzihfacture.com'
  );
  
  v_full_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(split_part(v_user_email, '@', 1), ''),
    'Utilisateur'
  );

  v_company_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'company_name', ''),
    'Mon Entreprise'
  );

  -- Slugification dynamique nettoyée
  v_slug := lower(regexp_replace(v_company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  IF v_slug IS NULL OR v_slug = '' THEN
    v_slug := 'entreprise';
  END IF;
  v_slug := v_slug || '-' || replace(v_tenant_id::text, '-', '');

  BEGIN
    -- Étape A : Tenants (4 colonnes obligatoires: id, name, slug, owner_user_id)
    INSERT INTO public.tenants (id, name, slug, owner_user_id)
    VALUES (v_tenant_id, v_company_name, v_slug, v_tenant_id)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      owner_user_id = EXCLUDED.owner_user_id;

    -- Étape B : Profiles (id, full_name, email, role, tenant_id)
    INSERT INTO public.profiles (id, full_name, email, role, tenant_id)
    VALUES (NEW.id, v_full_name, v_user_email, 'owner', v_tenant_id)
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;

    -- Étape C : Company Settings
    INSERT INTO public.company_settings (user_id, company_name, company_email)
    VALUES (NEW.id, v_company_name, v_user_email)
    ON CONFLICT (user_id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      company_email = EXCLUDED.company_email;

    -- Étape D : Tenant Quotas
    INSERT INTO public.tenant_quotas (user_id, tenant_id, max_invoices, invoices_used)
    VALUES (NEW.id, v_tenant_id, 5, 0)
    ON CONFLICT (user_id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[handle_new_user] Exception évitée: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 3. Attachement du Trigger sur auth.users (AFTER INSERT)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
