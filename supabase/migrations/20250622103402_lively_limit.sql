-- Update the handle_profile_display_name function to preserve user input names
CREATE OR REPLACE FUNCTION handle_profile_display_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign random name if display_name is completely null or empty
  -- This preserves names that come from user signup
  IF NEW.display_name IS NULL OR trim(NEW.display_name) = '' THEN
    NEW.display_name := assign_random_display_name();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the assign_random_display_name function to generate better names
CREATE OR REPLACE FUNCTION assign_random_display_name()
RETURNS text AS $$
DECLARE
  adjectives text[] := ARRAY['Smart', 'Bright', 'Quick', 'Clever', 'Wise', 'Bold', 'Swift', 'Keen'];
  nouns text[] := ARRAY['Student', 'Learner', 'Scholar', 'Thinker', 'Explorer', 'Seeker', 'Master'];
  random_number integer;
BEGIN
  random_number := floor(random() * 999) + 1;
  RETURN adjectives[floor(random() * array_length(adjectives, 1)) + 1] || 
         nouns[floor(random() * array_length(nouns, 1)) + 1] || 
         random_number::text;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS set_display_name_trigger ON user_profiles;
CREATE TRIGGER set_display_name_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_display_name();