/*
  # Add subscription system with Free, Trial, and Pro tiers

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `plan_type` (enum: free, trial, pro)
      - `status` (enum: active, expired, cancelled)
      - `trial_start_date` (timestamp)
      - `trial_end_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updates to existing tables
    - Add `subscription_id` to `user_profiles` table

  3. Security
    - Enable RLS on `subscriptions` table
    - Add policies for users to read/update their own subscription data

  4. Functions
    - Function to automatically expire trial subscriptions
    - Trigger to update subscription status
*/

-- Create enum types
CREATE TYPE subscription_plan AS ENUM ('free', 'trial', 'pro');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');

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

-- Add subscription_id to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_id uuid REFERENCES subscriptions(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
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

CREATE POLICY "Users can insert own subscription"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to check and update expired trials
CREATE OR REPLACE FUNCTION check_trial_expiration()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'expired'
  WHERE plan_type = 'trial'
    AND status = 'active'
    AND trial_end_date < now();
END;
$$;

-- Function to create default subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_subscription_id uuid;
BEGIN
  -- Create a free subscription for new user
  INSERT INTO subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active')
  RETURNING id INTO new_subscription_id;
  
  -- Update user profile with subscription_id if profile exists
  UPDATE user_profiles 
  SET subscription_id = new_subscription_id
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user subscription
DROP TRIGGER IF EXISTS create_user_subscription_trigger ON auth.users;
CREATE TRIGGER create_user_subscription_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Function to start trial subscription
CREATE OR REPLACE FUNCTION start_trial_subscription(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Update subscription to trial
  UPDATE subscriptions
  SET 
    plan_type = 'trial',
    status = 'active',
    trial_start_date = now(),
    trial_end_date = now() + interval '7 days',
    updated_at = now()
  WHERE user_id = user_uuid
    AND plan_type = 'free';
  
  -- Return updated subscription
  SELECT json_build_object(
    'success', true,
    'message', 'Trial started successfully',
    'trial_end_date', trial_end_date
  ) INTO result
  FROM subscriptions
  WHERE user_id = user_uuid;
  
  RETURN result;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions(trial_end_date) WHERE plan_type = 'trial';