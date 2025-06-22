/*
  # Fix Authentication Flow and Data Storage

  1. Database Functions
    - Create comprehensive user creation function
    - Ensure proper data storage for new users
    - Handle profile and subscription creation

  2. Security
    - Update RLS policies for proper authentication flow
    - Ensure users can create and manage their own data

  3. Triggers
    - Create trigger for automatic user data creation
    - Ensure all required data is created on signup
*/

-- Drop existing functions and triggers to start clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON public.users;
DROP TRIGGER IF EXISTS create_user_subscription ON public.user_profiles;
DROP TRIGGER IF EXISTS set_display_name_trigger ON public.user_profiles;

-- Create comprehensive function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_subscription_id uuid;
BEGIN
    -- Insert user into public.users table
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = EXCLUDED.updated_at;

    -- Create user profile
    INSERT INTO public.user_profiles (
        id, 
        display_name, 
        profile_completed,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name'),
        false,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
        updated_at = EXCLUDED.updated_at;

    -- Create default subscription
    INSERT INTO public.subscriptions (user_id, plan_type, status, created_at, updated_at)
    VALUES (NEW.id, 'free', 'active', NEW.created_at, NEW.updated_at)
    ON CONFLICT (user_id) DO UPDATE SET
        updated_at = EXCLUDED.updated_at
    RETURNING id INTO new_subscription_id;

    -- Update user profile with subscription_id
    UPDATE public.user_profiles 
    SET subscription_id = new_subscription_id
    WHERE id = NEW.id;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users for automatic user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to assign random display name if none provided
CREATE OR REPLACE FUNCTION handle_profile_display_name()
RETURNS TRIGGER AS $$
DECLARE
    adjectives text[] := ARRAY['Smart', 'Bright', 'Quick', 'Clever', 'Wise', 'Bold', 'Swift', 'Keen'];
    nouns text[] := ARRAY['Student', 'Learner', 'Scholar', 'Thinker', 'Explorer', 'Seeker', 'Master'];
    random_number integer;
BEGIN
    -- Only assign random name if display_name is null or empty
    IF NEW.display_name IS NULL OR trim(NEW.display_name) = '' THEN
        random_number := floor(random() * 999) + 1;
        NEW.display_name := adjectives[floor(random() * array_length(adjectives, 1)) + 1] || 
                           nouns[floor(random() * array_length(nouns, 1)) + 1] || 
                           random_number::text;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for display name assignment
CREATE TRIGGER set_display_name_trigger
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_profile_display_name();

-- Ensure proper RLS policies exist
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "Users can read own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Users can upsert own record" ON users;
DROP POLICY IF EXISTS "Allow anon to check user existence" ON users;
DROP POLICY IF EXISTS "Allow anon to insert new users" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;

-- Create clean policies for users table
CREATE POLICY "Users can manage own record"
    ON users
    FOR ALL
    TO authenticated
    USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Service role full access on users"
    ON users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Drop existing policies for user_profiles
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow anon to insert new profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow anon to read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow anon profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Allow anon profile update during signup" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;

-- Create clean policies for user_profiles table
CREATE POLICY "Users can manage own profile"
    ON user_profiles
    FOR ALL
    TO authenticated
    USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Service role full access on user_profiles"
    ON user_profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Drop existing policies for subscriptions
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Enable all operations for service role" ON subscriptions;
DROP POLICY IF EXISTS "Allow anon subscription creation" ON subscriptions;

-- Create clean policies for subscriptions table
CREATE POLICY "Users can manage own subscription"
    ON subscriptions
    FOR ALL
    TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Service role full access on subscriptions"
    ON subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Ensure all tables have proper indexes
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;