-- IMPORTANT: Is script mein 'admin-email@example.com' ki jagah apna actual admin email address dalein aur copy-paste karke Supabase SQL Editor mein run karein!
DO $$
DECLARE
  v_user_id UUID;
  v_email VARCHAR := 'admin-email@example.com'; -- APNA ADMIN EMAIL YAHA LI KHEIN
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NOT NULL THEN
    -- 1. Update auth.users app_metadata to set admin role
    UPDATE auth.users 
    SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
    WHERE id = v_user_id;
    
    -- 2. Upsert public.users profile to set admin role
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (v_user_id, v_email, 'Administrator', 'admin'::user_role)
    ON CONFLICT (id) DO UPDATE 
    SET role = 'admin'::user_role;
  END IF;
END $$;
