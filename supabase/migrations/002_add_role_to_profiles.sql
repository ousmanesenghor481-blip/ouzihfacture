-- Migration: Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'owner';

-- Ensure existing users have role = 'owner'
UPDATE public.profiles SET role = 'owner' WHERE role IS NULL OR role = '';

-- Update handle_new_user trigger to include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Ousmane Senghor'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner')
  )
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;

  INSERT INTO public.company_settings (user_id, company_name, company_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Ouzih Business'),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
