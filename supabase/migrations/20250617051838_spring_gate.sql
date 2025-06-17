/*
  # Create subscription system

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `plan_type` (enum: free, trial, pro)
      - `status` (enum: active, expired, cancelled)
      - `trial_start_date` (timestamptz, nullable)
      - `trial_end_date` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policies for authenticated users to manage their own subscriptions

  3. Functions
    - `start_trial_subscription()` - Function to start 7-day trial
    - `create_default_subscription()` - Trigger function for new users

  4. Changes
    - Add foreign key constraint from user_profiles to subscriptions
    - Create trigger to auto-create free subscription for new users
*/

-- Create subscription plan enum (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
    CREATE TYPE subscription_plan AS ENUM ('free', 'trial', 'pro');
  END IF;
END $$;

-- Create subscription status enum (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');
  END IF;
END $$;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  trial_start_date timestamptz,
  trial_end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

-- Create policies
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions(trial_end_date) WHERE plan_type = 'trial';

-- Create function to start trial subscription
CREATE OR REPLACE FUNCTION start_trial_subscription(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_subscription subscriptions%ROWTYPE;
  trial_start timestamptz;
  trial_end timestamptz;
  result json;
BEGIN
  -- Check if user already has a subscription
  SELECT * INTO existing_subscription
  FROM subscriptions
  WHERE user_id = user_uuid;

  -- If no subscription exists, create a free one first
  IF existing_subscription IS NULL THEN
    INSERT INTO subscriptions (user_id, plan_type, status)
    VALUES (user_uuid, 'free', 'active')
    RETURNING * INTO existing_subscription;
  END IF;

  -- Only allow trial if currently on free plan
  IF existing_subscription.plan_type != 'free' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Trial can only be started from free plan'
    );
  END IF;

  -- Set trial dates
  trial_start := now();
  trial_end := trial_start + interval '7 days';

  -- Update subscription to trial
  UPDATE subscriptions
  SET 
    plan_type = 'trial',
    status = 'active',
    trial_start_date = trial_start,
    trial_end_date = trial_end,
    updated_at = now()
  WHERE id = existing_subscription.id
  RETURNING * INTO existing_subscription;

  RETURN json_build_object(
    'success', true,
    'subscription', row_to_json(existing_subscription)
  );
END;
$$;

-- Create trigger function to automatically create subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create subscription when user signs up
DROP TRIGGER IF EXISTS create_subscription_on_signup ON auth.users;
CREATE TRIGGER create_subscription_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Update user_profiles foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_subscription_id_fkey'
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_subscription_id_fkey 
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);
  END IF;
END $$;