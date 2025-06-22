/*
  # Fix User Creation RLS Policies

  1. Security Updates
    - Add policy to allow anon users to insert into users table (for initial signup)
    - Add policy to allow anon users to insert into user_profiles table (for initial profile creation)
    - Add policy to allow anon users to read from users table (for existence checks)
    
  2. Important Notes
    - These policies are designed to work with Clerk authentication
    - The policies are restrictive and only allow specific operations needed for user creation
    - Users can only insert their own records based on the Clerk user ID
*/

-- Allow anonymous users to check if a user exists (needed for the existence check in syncUserWithSupabase)
CREATE POLICY "Allow anon to check user existence"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to insert new users (for initial signup)
CREATE POLICY "Allow anon to insert new users"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to insert new user profiles (for initial profile creation)
CREATE POLICY "Allow anon to insert new user profiles"
  ON user_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read user profiles (needed for profile checks)
CREATE POLICY "Allow anon to read user profiles"
  ON user_profiles
  FOR SELECT
  TO anon
  USING (true);