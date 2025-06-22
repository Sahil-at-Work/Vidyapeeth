/*
  # Fix Users Table RLS Policies

  1. Security Changes
    - Remove duplicate and conflicting RLS policies on users table
    - Create clean, consistent policies that allow proper user creation
    - Ensure authenticated users can insert their own records
    - Maintain security while allowing user sync from authentication

  2. Policy Updates
    - Allow authenticated users to insert their own user record
    - Allow authenticated users to read their own user record  
    - Allow authenticated users to update their own user record
    - Allow anon users to check user existence (for registration flow)
    - Maintain service role access for admin operations
*/

-- Drop all existing policies on users table to start clean
DROP POLICY IF EXISTS "Allow anon to check user existence" ON users;
DROP POLICY IF EXISTS "Allow anon to insert new users" ON users;
DROP POLICY IF EXISTS "Enable all operations for service role on users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users on users" ON users;
DROP POLICY IF EXISTS "Enable read for authenticated users on users" ON users;
DROP POLICY IF EXISTS "Enable update for authenticated users on users" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Users can insert own user entry" ON users;
DROP POLICY IF EXISTS "Users can read own user entry" ON users;
DROP POLICY IF EXISTS "Users can update own user entry" ON users;

-- Create clean, consistent policies
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

CREATE POLICY "Allow anon to check user existence"
  ON users
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert new users"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);