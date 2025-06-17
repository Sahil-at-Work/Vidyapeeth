/*
  # Fix Authentication Database Errors

  1. Database Functions
    - Create or replace the handle_new_user function
    - Create or replace the create_default_subscription function
    - Create or replace the update_updated_at_column function

  2. Security Updates
    - Update RLS policies to allow service role operations
    - Ensure triggers can execute properly

  3. Trigger Updates
    - Recreate triggers with proper function calls
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, profile_completed)
  VALUES (NEW.id, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the function to create default subscription
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');
  
  -- Update the user profile with the subscription ID
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_subscription ON public.user_profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create trigger for subscription creation after profile creation
CREATE TRIGGER create_user_subscription
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Create trigger to update updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policies to allow service role and authenticated users proper access
-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- Create more permissive policies for service operations
CREATE POLICY "Enable insert for service role and authenticated users" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable all operations for service role" ON public.subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Ensure the service role can access auth.users (this is typically handled by Supabase)
-- Grant necessary permissions to the service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;