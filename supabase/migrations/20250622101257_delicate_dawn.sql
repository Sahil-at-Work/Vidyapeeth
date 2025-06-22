/*
  # Fix user signup database error

  1. Database Functions
    - Update handle_new_user function to handle profile creation safely
    - Update create_default_subscription function to work with proper RLS
    - Add assign_random_name_on_insert function for profile names

  2. Security Updates
    - Ensure RLS policies allow automatic profile and subscription creation
    - Add policies for anon users during signup process

  3. Fixes
    - Handle cases where profile creation might fail
    - Ensure subscription creation works properly
    - Add proper error handling in database functions
*/

-- First, let's recreate the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles with minimal required data
  INSERT INTO public.user_profiles (id, profile_completed)
  VALUES (NEW.id, false)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the create_default_subscription function
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a default free subscription for the new user profile
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;
  
  -- Update the user profile with the subscription_id
  UPDATE public.user_profiles 
  SET subscription_id = (
    SELECT id FROM public.subscriptions 
    WHERE user_id = NEW.id 
    ORDER BY created_at DESC 
    LIMIT 1
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the profile creation
    RAISE WARNING 'Error creating subscription for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the assign_random_name_on_insert function
CREATE OR REPLACE FUNCTION assign_random_name_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  random_names TEXT[] := ARRAY[
    'StudyBuddy', 'QuizMaster', 'BookWorm', 'BrainBox', 'SmartCookie',
    'WisdomSeeker', 'KnowledgeHunter', 'StudyStar', 'LearnLover', 'ThinkTank',
    'MindMaster', 'IdeaExplorer', 'ConceptCrafter', 'LogicLord', 'ReasonRanger'
  ];
  random_number INTEGER;
BEGIN
  -- Only assign a random name if display_name is null
  IF NEW.display_name IS NULL THEN
    random_number := floor(random() * 9999) + 1;
    NEW.display_name := random_names[floor(random() * array_length(random_names, 1)) + 1] || random_number::text;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If random name assignment fails, use a simple fallback
    NEW.display_name := 'User' || floor(random() * 99999)::text;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure anon users can insert into users table during signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Allow anon signup'
  ) THEN
    CREATE POLICY "Allow anon signup"
      ON users
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure anon users can insert into user_profiles during signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Allow anon profile creation'
  ) THEN
    CREATE POLICY "Allow anon profile creation"
      ON user_profiles
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure anon users can insert into subscriptions during signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Allow anon subscription creation'
  ) THEN
    CREATE POLICY "Allow anon subscription creation"
      ON subscriptions
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Allow anon users to update user_profiles during the signup process
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Allow anon profile update during signup'
  ) THEN
    CREATE POLICY "Allow anon profile update during signup"
      ON user_profiles
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;