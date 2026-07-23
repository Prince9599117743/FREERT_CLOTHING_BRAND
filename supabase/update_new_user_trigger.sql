-- Trigger function to copy phone during signup update karein
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.phone, new.raw_user_meta_data->>'phone', ''),
    COALESCE((new.raw_app_meta_data->>'role')::user_role, 'customer'::user_role)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      phone = COALESCE(EXCLUDED.phone, users.phone, '');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW; -- Safeguard to prevent Auth signup/OAuth login failures
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
