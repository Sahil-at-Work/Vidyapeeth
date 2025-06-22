/*
  # Fix User Profiles RLS Policies

  1. Security Updates
    - Drop existing problematic RLS policies on user_profiles table
    - Create new RLS policies that properly use auth.uid() for user identification
    - Ensure authenticated users can insert, select, update, and delete their own profiles
    - Maintain service role access for administrative operations

  2. Policy Changes
    - Replace `(uid())::text = id` with `auth.uid()::text = id` for proper authentication
    - Add proper INSERT policy with correct WITH CHECK clause
    - Update SELECT, UPDATE, and DELETE policies with consistent auth.uid() usage
*/

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Enable all operations for service role on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for authenticated users on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read for authenticated users on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON user_profiles;

-- Create new policies with correct auth.uid() usage
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = id);

-- Service role policy for administrative access
CREATE POLICY "Service role can manage all profiles"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);