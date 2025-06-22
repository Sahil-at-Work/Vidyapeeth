/*
  # Fix user_profiles RLS policies for Clerk authentication

  1. Security Updates
    - Remove conflicting RLS policies that use auth.uid()
    - Ensure policies work with Clerk authentication using get_current_user_id()
    - Add proper policies for upsert operations

  2. Policy Changes
    - Update INSERT policy to work with upsert operations
    - Ensure UPDATE policy handles profile completion
    - Maintain security while allowing proper user profile management
*/

-- Drop existing conflicting policies that might use auth.uid()
DROP POLICY IF EXISTS "Enable insert access for own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable update access for own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete access for own profile" ON user_profiles;

-- Create comprehensive policies that work with Clerk authentication
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_id() = id);

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (get_current_user_id() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (get_current_user_id() = id)
  WITH CHECK (get_current_user_id() = id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (get_current_user_id() = id);

-- Ensure the get_current_user_id function exists and works properly
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.sub', true),
    auth.uid()::text
  );
$$;