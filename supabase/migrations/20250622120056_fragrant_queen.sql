-- Drop existing triggers and functions to start clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- First, handle foreign key constraint by updating user_profiles to reference the subscription we'll keep
-- Update user_profiles to point to the subscription we want to keep (most recent one)
UPDATE user_profiles 
SET subscription_id = (
    SELECT s.id 
    FROM subscriptions s 
    WHERE s.user_id = user_profiles.id 
    ORDER BY s.created_at DESC 
    LIMIT 1
)
WHERE subscription_id IS NOT NULL;

-- Now clean up duplicate subscriptions, keeping only the most recent one for each user
DELETE FROM subscriptions 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM subscriptions 
    ORDER BY user_id, created_at DESC
);

-- Create comprehensive function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_subscription_id uuid;
    display_name_value text;
    existing_subscription_id uuid;
BEGIN
    -- Extract display name from metadata
    display_name_value := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        'User' || floor(random() * 99999)::text
    );

    -- Step 1: Insert into users table first (this is the referenced table)
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (NEW.id::text, NEW.email, NEW.created_at, NEW.updated_at)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = EXCLUDED.updated_at;

    -- Step 2: Check if subscription already exists
    SELECT id INTO existing_subscription_id
    FROM public.subscriptions
    WHERE user_id = NEW.id::text
    LIMIT 1;

    -- Only create subscription if one doesn't exist
    IF existing_subscription_id IS NULL THEN
        INSERT INTO public.subscriptions (user_id, plan_type, status, created_at, updated_at)
        VALUES (NEW.id::text, 'free', 'active', NEW.created_at, NEW.updated_at)
        RETURNING id INTO new_subscription_id;
    ELSE
        new_subscription_id := existing_subscription_id;
    END IF;

    -- Step 3: Insert into user_profiles table (this references users table)
    INSERT INTO public.user_profiles (
        id, 
        display_name, 
        profile_completed,
        subscription_id,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id::text,
        display_name_value,
        false,
        new_subscription_id,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
        subscription_id = COALESCE(EXCLUDED.subscription_id, user_profiles.subscription_id),
        updated_at = EXCLUDED.updated_at;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        
        -- Try to ensure at least the basic user record exists
        INSERT INTO public.users (id, email, created_at, updated_at)
        VALUES (NEW.id::text, NEW.email, NEW.created_at, NEW.updated_at)
        ON CONFLICT (id) DO NOTHING;
        
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users for automatic user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to manually sync existing auth users to users table
CREATE OR REPLACE FUNCTION sync_auth_users_to_users_table()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
    existing_subscription_id uuid;
    new_subscription_id uuid;
    user_id_text text;
BEGIN
    -- Loop through all auth.users and ensure they exist in public.users
    FOR auth_user IN 
        SELECT id, email, created_at, updated_at, raw_user_meta_data
        FROM auth.users
    LOOP
        -- Convert UUID to text for consistency
        user_id_text := auth_user.id::text;
        
        -- Insert into users table if not exists
        INSERT INTO public.users (id, email, created_at, updated_at)
        VALUES (user_id_text, auth_user.email, auth_user.created_at, auth_user.updated_at)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = EXCLUDED.updated_at;

        -- Check if user already has a subscription
        SELECT id INTO existing_subscription_id
        FROM public.subscriptions
        WHERE user_id = user_id_text
        LIMIT 1;

        -- Only create subscription if one doesn't exist
        IF existing_subscription_id IS NULL THEN
            INSERT INTO public.subscriptions (user_id, plan_type, status, created_at, updated_at)
            VALUES (user_id_text, 'free', 'active', auth_user.created_at, auth_user.updated_at)
            ON CONFLICT DO NOTHING
            RETURNING id INTO new_subscription_id;
            
            existing_subscription_id := new_subscription_id;
        END IF;
            
        -- Insert into user_profiles if not exists
        INSERT INTO public.user_profiles (
            id, 
            display_name, 
            profile_completed,
            subscription_id,
            created_at,
            updated_at
        )
        VALUES (
            user_id_text,
            COALESCE(
                auth_user.raw_user_meta_data->>'display_name',
                auth_user.raw_user_meta_data->>'full_name',
                'User' || floor(random() * 99999)::text
            ),
            false,
            existing_subscription_id,
            auth_user.created_at,
            auth_user.updated_at
        )
        ON CONFLICT (id) DO UPDATE SET
            subscription_id = COALESCE(EXCLUDED.subscription_id, user_profiles.subscription_id),
            updated_at = EXCLUDED.updated_at;
    END LOOP;
    
    RAISE NOTICE 'Synced % auth users to users table', (SELECT COUNT(*) FROM auth.users);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function to fix any existing users
SELECT sync_auth_users_to_users_table();

-- Now add the unique constraint after cleaning up duplicates and fixing references
DO $$
BEGIN
    -- Add unique constraint on subscriptions.user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscriptions_user_id_key'
        AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        -- If there are still duplicates, this shouldn't happen after our cleanup
        RAISE WARNING 'Unexpected duplicate subscriptions found after cleanup';
    WHEN others THEN
        RAISE WARNING 'Error adding unique constraint: %', SQLERRM;
END $$;

-- Drop existing service role policies to avoid conflicts
DROP POLICY IF EXISTS "Service role can do everything on users" ON users;
DROP POLICY IF EXISTS "Service role can do everything on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can do everything on subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access on subscriptions" ON subscriptions;

-- Update RLS policies to be more permissive during user creation
-- Allow service_role to perform all operations (needed for triggers)
CREATE POLICY "Service role can do everything on users"
    ON users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on user_profiles"
    ON user_profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on subscriptions"
    ON subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);