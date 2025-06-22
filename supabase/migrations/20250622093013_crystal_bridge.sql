/*
  # Fix User Profiles RLS Policies

  1. Security Updates
    - Drop existing problematic RLS policies on user_profiles table
    - Create new, properly functioning RLS policies
    - Ensure authenticated users can manage their own profile data
    - Use auth.uid() function correctly for user identification

  2. Policy Changes
    - Enable SELECT for users to read their own profile
    - Enable INSERT for users to create their own profile
    - Enable UPDATE for users to update their own profile
    - Enable DELETE for users to delete their own profile
    - Maintain service role access for administrative operations
    - Keep anon access for initial profile creation during signup
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow anon to insert new user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow anon to read user profiles" ON user_profiles;

-- Create new, properly functioning RLS policies
CREATE POLICY "Enable read access for own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Enable insert access for own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Enable update access for own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Enable delete access for own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = id);

-- Allow anon users to insert profiles during signup process
CREATE POLICY "Allow anon to insert new profiles"
  ON user_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anon users to read profiles (needed for profile completion check)
CREATE POLICY "Allow anon to read profiles"
  ON user_profiles
  FOR SELECT
  TO anon
  USING (true);

-- Ensure service role maintains full access
CREATE POLICY "Service role full access"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);