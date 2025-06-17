/*
  # Update User Profile Creation with Display Name Support

  1. Changes
    - Modify the handle_new_user function to support display names from auth metadata
    - Update the assign_random_name_on_insert function to check for existing display names
    - Ensure proper handling of display names during signup

  2. Security
    - Maintain existing RLS policies
    - Ensure users can only update their own profiles
*/

-- Update the handle_new_user function to support display names from auth metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_display_name TEXT;
BEGIN
    -- Extract display name from user metadata if available
    user_display_name := NEW.raw_user_meta_data->>'display_name';
    
    -- Create user profile with display name if provided
    INSERT INTO public.user_profiles (id, display_name, profile_completed)
    VALUES (
        NEW.id, 
        user_display_name,
        false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the assign_random_name_on_insert function to only assign if no name is provided
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
    -- Only assign random name if no display name is provided
    IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
        random_number := floor(random() * 9999) + 1;
        random_name := random_adjectives[floor(random() * array_length(random_adjectives, 1)) + 1] || 
                      random_names[floor(random() * array_length(random_names, 1)) + 1] || 
                      random_number::TEXT;
        NEW.display_name := random_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the triggers to ensure they use the updated functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS assign_random_name_trigger ON public.user_profiles;
CREATE TRIGGER assign_random_name_trigger
    BEFORE INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION assign_random_name_on_insert();