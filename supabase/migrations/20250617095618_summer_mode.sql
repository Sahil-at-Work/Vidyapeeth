/*
  # Fix User Signup Database Functions

  This migration creates the missing database functions and triggers that are required
  for proper user signup functionality.

  ## Functions Created
  1. `update_updated_at_column()` - Updates the updated_at timestamp
  2. `handle_new_user()` - Creates user profile when new user signs up
  3. `assign_random_name_on_insert()` - Assigns random display name to new profiles
  4. `create_default_subscription()` - Creates default subscription for new users
  5. `update_user_progress_xp()` - Updates XP points based on progress
  6. `trigger_achievement_check()` - Checks for new achievements

  ## Triggers
  - Automatic user profile creation on auth.users insert
  - Random name assignment on user_profiles insert
  - Default subscription creation on user_profiles insert
*/

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, profile_completed)
    VALUES (NEW.id, false);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign random name on profile insert
CREATE OR REPLACE FUNCTION assign_random_name_on_insert()
RETURNS TRIGGER AS $$
DECLARE
    random_names TEXT[] := ARRAY[
        'StudyBuddy', 'BookWorm', 'Scholar', 'Learner', 'Student', 'Genius', 
        'Thinker', 'Explorer', 'Seeker', 'Achiever', 'Champion', 'Master',
        'Wizard', 'Sage', 'Expert', 'Pro', 'Star', 'Hero', 'Legend', 'Elite'
    ];
    random_adjectives TEXT[] := ARRAY[
        'Smart', 'Bright', 'Quick', 'Sharp', 'Clever', 'Wise', 'Bold',
        'Swift', 'Keen', 'Alert', 'Agile', 'Fast', 'Strong', 'Brave'
    ];
    random_name TEXT;
    random_number INTEGER;
BEGIN
    IF NEW.display_name IS NULL THEN
        random_number := floor(random() * 9999) + 1;
        random_name := random_adjectives[floor(random() * array_length(random_adjectives, 1)) + 1] || 
                      random_names[floor(random() * array_length(random_names, 1)) + 1] || 
                      random_number::TEXT;
        NEW.display_name := random_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create default subscription
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

-- Function to update user progress XP
CREATE OR REPLACE FUNCTION update_user_progress_xp()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate XP based on completion percentage
    IF NEW.completion_percentage > OLD.completion_percentage THEN
        NEW.xp_points := OLD.xp_points + (NEW.completion_percentage - OLD.completion_percentage) * 10;
    END IF;
    
    -- Update last activity
    NEW.last_activity := now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check achievements
CREATE OR REPLACE FUNCTION trigger_achievement_check()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for first subject completion
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO public.user_achievements (user_id, achievement_type, title, description, xp_reward)
        VALUES (NEW.user_id, 'first_subject', 'First Subject Completed!', 'Congratulations on completing your first subject!', 100)
        ON CONFLICT (user_id, achievement_type) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup (this is the most important one)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure all existing triggers are properly set up
DROP TRIGGER IF EXISTS assign_random_name_trigger ON public.user_profiles;
CREATE TRIGGER assign_random_name_trigger
    BEFORE INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION assign_random_name_on_insert();

DROP TRIGGER IF EXISTS create_user_subscription ON public.user_profiles;
CREATE TRIGGER create_user_subscription
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Update triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subject_materials_updated_at ON public.subject_materials;
CREATE TRIGGER update_subject_materials_updated_at
    BEFORE UPDATE ON public.subject_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS calculate_xp_on_progress_update ON public.user_progress;
CREATE TRIGGER calculate_xp_on_progress_update
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_user_progress_xp();

DROP TRIGGER IF EXISTS check_achievements_on_progress_update ON public.user_progress;
CREATE TRIGGER check_achievements_on_progress_update
    AFTER UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION trigger_achievement_check();

DROP TRIGGER IF EXISTS update_leaderboard_competitors_updated_at ON public.leaderboard_competitors;
CREATE TRIGGER update_leaderboard_competitors_updated_at
    BEFORE UPDATE ON public.leaderboard_competitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();