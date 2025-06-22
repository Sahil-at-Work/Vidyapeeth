-- Step 1: Drop all RLS policies that depend on the id columns
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Enable all operations for service role" ON subscriptions;

DROP POLICY IF EXISTS "Users can manage own progress" ON user_progress;

DROP POLICY IF EXISTS "Users can read own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;

-- Step 2: Drop foreign key constraints that reference auth.users
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;
ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;

-- Step 3: Drop triggers that depend on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Change column types from uuid to text
ALTER TABLE users ALTER COLUMN id TYPE text;
ALTER TABLE user_profiles ALTER COLUMN id TYPE text;
ALTER TABLE subscriptions ALTER COLUMN user_id TYPE text;
ALTER TABLE user_progress ALTER COLUMN user_id TYPE text;
ALTER TABLE user_achievements ALTER COLUMN user_id TYPE text;

-- Step 5: Handle existing data - populate users table with missing records
INSERT INTO users (id, email, created_at, updated_at)
SELECT 
  up.id,
  COALESCE(au.email, 'unknown@example.com'),
  COALESCE(up.created_at, now()),
  COALESCE(up.updated_at, now())
FROM user_profiles up
LEFT JOIN auth.users au ON up.id::text = au.id::text
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = up.id
)
ON CONFLICT (id) DO NOTHING;

-- Also handle any orphaned subscription records
INSERT INTO users (id, email, created_at, updated_at)
SELECT 
  s.user_id,
  'unknown@example.com',
  COALESCE(s.created_at, now()),
  COALESCE(s.updated_at, now())
FROM subscriptions s
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = s.user_id
)
ON CONFLICT (id) DO NOTHING;

-- Handle any orphaned progress records
INSERT INTO users (id, email, created_at, updated_at)
SELECT 
  up.user_id,
  'unknown@example.com',
  COALESCE(up.created_at, now()),
  COALESCE(up.updated_at, now())
FROM user_progress up
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = up.user_id
)
ON CONFLICT (id) DO NOTHING;

-- Handle any orphaned achievement records
INSERT INTO users (id, email, created_at, updated_at)
SELECT 
  ua.user_id,
  'unknown@example.com',
  now(),
  now()
FROM user_achievements ua
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = ua.user_id
)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Create internal foreign key constraints (not referencing auth.users)
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_progress 
ADD CONSTRAINT user_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_achievements 
ADD CONSTRAINT user_achievements_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 7: Create a function to get current user ID from JWT
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text AS $$
BEGIN
  -- Extract user ID from JWT token
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Recreate RLS policies using the new function
-- Users table policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (get_current_user_id() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_id() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (get_current_user_id() = id)
  WITH CHECK (get_current_user_id() = id);

-- User profiles policies
CREATE POLICY "Users can create own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_id() = id);

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (get_current_user_id() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (get_current_user_id() = id)
  WITH CHECK (get_current_user_id() = id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (get_current_user_id() = id);

-- Subscriptions policies
CREATE POLICY "Users can insert own subscription"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_id() = user_id);

CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (get_current_user_id() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (get_current_user_id() = user_id)
  WITH CHECK (get_current_user_id() = user_id);

CREATE POLICY "Enable all operations for service role"
  ON subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User progress policies
CREATE POLICY "Users can manage own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (get_current_user_id() = user_id)
  WITH CHECK (get_current_user_id() = user_id);

-- User achievements policies
CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (get_current_user_id() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_id() = user_id);

-- Step 9: Update functions to work with text IDs
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, profile_completed)
    VALUES (NEW.id, false);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
    new_subscription_id UUID;
BEGIN
    -- Create a new subscription for the user
    INSERT INTO public.subscriptions (user_id, plan_type, status)
    VALUES (NEW.id, 'free', 'active')
    RETURNING id INTO new_subscription_id;
    
    -- Update the user profile with the subscription ID
    UPDATE public.user_profiles 
    SET subscription_id = new_subscription_id
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create trigger on users table instead of auth.users
DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 11: Add service role policies for easier management
CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage profiles"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);