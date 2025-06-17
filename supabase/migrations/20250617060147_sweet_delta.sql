/*
  # Fix Authentication and Database Triggers

  1. Database Functions
    - Create `update_updated_at_column()` function for updating timestamps
    - Create `create_default_subscription()` function for creating user subscriptions
  
  2. Security
    - Ensure proper RLS policies are in place
    - Fix any missing constraints or references

  This migration fixes the database errors preventing user sign-up by ensuring
  all required functions and triggers are properly configured.
*/

-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the create_default_subscription function
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a default subscription for the new user
    INSERT INTO public.subscriptions (user_id, plan_type, status)
    VALUES (NEW.id, 'free', 'active');
    
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
END;
$$ language 'plpgsql';

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (id, profile_completed)
    VALUES (NEW.id, false);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the update trigger exists on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure the subscription creation trigger exists on user_profiles
DROP TRIGGER IF EXISTS create_user_subscription ON public.user_profiles;
CREATE TRIGGER create_user_subscription
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Add missing RLS policies for subscriptions if they don't exist
DO $$
BEGIN
    -- Check if service_role policy exists for subscriptions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Service role can manage subscriptions'
    ) THEN
        CREATE POLICY "Service role can manage subscriptions"
            ON subscriptions
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;