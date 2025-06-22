/*
  # Fix RLS policies for user authentication

  1. Security Updates
    - Update RLS policies to allow proper user creation and profile management
    - Ensure authenticated users can manage their own data
    - Allow service role to manage all operations

  2. Changes
    - Update users table policies
    - Update user_profiles table policies
    - Ensure proper user creation flow
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Create new policies for users table
CREATE POLICY "Enable all operations for service role on users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users on users"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Enable insert for authenticated users on users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Enable update for authenticated users on users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Create new policies for user_profiles table
CREATE POLICY "Enable all operations for service role on user_profiles"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users on user_profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Enable insert for authenticated users on user_profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Enable update for authenticated users on user_profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Enable delete for authenticated users on user_profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = id);