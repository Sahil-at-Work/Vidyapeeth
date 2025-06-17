/*
  # Fix Authentication and RLS Policies

  1. Functions
    - Create trigger function for updating timestamps
    - Create function for default subscription creation
  
  2. Security Updates
    - Update RLS policies for user_profiles table
    - Update RLS policies for subscriptions table
    - Add trigger for automatic subscription creation

  3. Important Notes
    - Uses auth.uid() to reference authenticated user
    - Ensures proper permissions for user operations
    - Handles automatic subscription creation on user signup
*/

-- Create or replace the trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or replace function to create default subscription
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure user_profiles table has correct RLS policies
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create comprehensive RLS policies for user_profiles
CREATE POLICY "Users can create own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure subscriptions table has correct RLS policies
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

CREATE POLICY "Users can insert own subscription"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger on user_profiles to automatically create subscription
-- This trigger will fire when a user_profiles record is created
DROP TRIGGER IF EXISTS create_user_subscription ON user_profiles;
CREATE TRIGGER create_user_subscription
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();