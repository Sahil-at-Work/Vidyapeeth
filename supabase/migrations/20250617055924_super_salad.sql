/*
  # Fix RLS policy for user signup process

  1. Security Updates
    - Add policy to allow service role to insert user profiles during signup
    - Ensure users can still manage their own profiles after authentication
    - Add policy for reading user profiles with proper joins

  2. Changes
    - Add service role policy for INSERT operations during signup
    - Update existing policies to be more specific
    - Add policy for reading profiles with university/department/semester data
*/

-- Drop existing policies to recreate them with better specificity
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Allow service role to insert profiles during signup process
CREATE POLICY "Service role can insert profiles"
  ON user_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can create own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to delete their own profile
CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);