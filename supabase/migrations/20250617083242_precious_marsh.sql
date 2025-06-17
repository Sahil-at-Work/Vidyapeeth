/*
  # Fix user_profiles RLS policies

  1. Security Changes
    - Drop existing conflicting INSERT policies on user_profiles table
    - Create a single, clear INSERT policy for authenticated users
    - Ensure users can only create profiles for their own user ID

  2. Policy Details
    - Remove the overly permissive service role policy
    - Keep the user-specific INSERT policy with proper auth.uid() check
    - Maintain existing SELECT, UPDATE, DELETE policies
*/

-- Drop the conflicting INSERT policies
DROP POLICY IF EXISTS "Enable insert for service role and authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;

-- Create a single, clear INSERT policy for authenticated users
CREATE POLICY "Users can create own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the table has RLS enabled (should already be enabled)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;