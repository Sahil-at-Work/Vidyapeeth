/*
  # Fix RLS policy for users table

  1. Security Changes
    - Update RLS policy to allow authenticated users to insert their own records
    - This is needed for Clerk integration where users need to sync their data
    - The policy ensures users can only insert records with their own auth.uid()

  2. Changes Made
    - Drop existing restrictive INSERT policy if it exists
    - Create new INSERT policy that allows authenticated users to insert their own records
    - Maintain existing security for other operations
*/

-- Drop existing INSERT policy for authenticated users if it exists
DROP POLICY IF EXISTS "Users can insert own record" ON users;

-- Create a new INSERT policy that allows authenticated users to insert their own records
-- This is essential for Clerk integration where users need to sync their data to Supabase
CREATE POLICY "Allow authenticated users to insert their own user record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

-- Ensure the existing SELECT and UPDATE policies remain intact
-- (These should already exist based on the schema, but we'll recreate them to be safe)

-- Drop and recreate SELECT policy
DROP POLICY IF EXISTS "Users can read own record" ON users;
CREATE POLICY "Users can read own record"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

-- Drop and recreate UPDATE policy  
DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);