-- RLS policy to allow users to insert/upsert their own profile row
CREATE POLICY "Allow users insert own profiles" ON public.users 
FOR INSERT WITH CHECK (auth.uid() = id);
