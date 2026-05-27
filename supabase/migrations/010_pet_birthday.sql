-- ============================================================
-- 010_pet_birthday.sql
-- Agrega cumpleaños de mascota y consentimiento de email al perfil
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pet_birthday DATE,
  ADD COLUMN IF NOT EXISTS birthday_email_consent BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS birthday_discount_applied BOOLEAN NOT NULL DEFAULT FALSE;

-- Actualizar trigger para persistir los datos de birthday desde metadata
-- cuando el usuario confirma su email (la sesión se crea después del redirect)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, pet_birthday, birthday_email_consent)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'pet_birthday', '')::DATE,
    COALESCE((NEW.raw_user_meta_data->>'birthday_email_consent')::BOOLEAN, FALSE)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
