/*
  # Fix signup flow for Supabase Auth

  1. Security Updates
    - Ensure proper RLS policies for signup flow
    - Allow authenticated users to create their own records
    - Remove dependency on external triggers

  2. Functions
    - Simplify user creation process
    - Remove complex trigger dependencies
*/

-- Drop existing triggers that might interfere
DROP TRIGGER IF EXISTS on_user_created ON public.users;
DROP TRIGGER IF EXISTS create_user_subscription ON public.user_profiles;
DROP TRIGGER IF EXISTS assign_random_name_trigger ON public.user_profiles;

-- Ensure users table has proper policies
DROP POLICY IF EXISTS "Allow authenticated users to insert their own user record" ON users;
DROP POLICY IF EXISTS "Users can read own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;

CREATE POLICY "Users can insert own record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can read own record"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own record"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Allow upsert operations for users
CREATE POLICY "Users can upsert own record"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Ensure user_profiles table has proper policies for upsert
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Create a simple function to assign random names if needed
CREATE OR REPLACE FUNCTION assign_random_display_name()
RETURNS text AS $$
DECLARE
  names text[] := ARRAY['StudyBuddy', 'QuizMaster', 'BookWorm', 'BrainBox', 'SmartCookie'];
  random_number integer;
BEGIN
  random_number := floor(random() * 9999) + 1;
  RETURN names[floor(random() * array_length(names, 1)) + 1] || random_number::text;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to assign random name if display_name is null
CREATE OR REPLACE FUNCTION handle_profile_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
    NEW.display_name := assign_random_display_name();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_display_name_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_display_name();