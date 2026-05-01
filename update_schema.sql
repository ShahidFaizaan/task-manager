-- Run this entirely in the Supabase SQL Editor

-- 1. Create a profiles table linked to auth.users for Role Based Access Control
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Allow public access to profiles for the MVP interview (or you can use RLS if needed)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on profiles" ON profiles FOR UPDATE USING (true);

-- 3. Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'admin'); -- Defaulting everyone to admin for MVP interview ease
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists before creating to prevent errors
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END
$$;

-- 4. Update Projects Table (Add board_type)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS board_type TEXT DEFAULT 'kanban' CHECK (board_type IN ('kanban', 'scrum'));

-- 5. Update Tasks Table (Add due_date and assigned_to)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;
