/*
  # Add Daily Progress Tracking

  1. Database Changes
    - Add index on last_activity for better performance
    - Update user_progress table to support daily tracking
    - Add function to check if activity is on same day

  2. Functions
    - Function to determine if last activity was today
    - Function to calculate XP based on daily activity
*/

-- Add index for better performance on last_activity queries
CREATE INDEX IF NOT EXISTS idx_user_progress_last_activity ON user_progress(last_activity);

-- Function to check if last activity was today
CREATE OR REPLACE FUNCTION is_same_day_activity(last_activity_date timestamptz)
RETURNS boolean AS $$
BEGIN
  -- Check if the last activity was today (same date)
  RETURN DATE(last_activity_date) = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate XP based on daily activity pattern
CREATE OR REPLACE FUNCTION calculate_daily_xp(
  p_user_id text,
  p_subject_id uuid,
  p_last_activity timestamptz
)
RETURNS integer AS $$
DECLARE
  is_new_day boolean;
  xp_gain integer;
BEGIN
  -- Check if this is a new day or same day activity
  IF p_last_activity IS NULL THEN
    is_new_day := true;
  ELSE
    is_new_day := NOT is_same_day_activity(p_last_activity);
  END IF;
  
  -- Award XP based on whether it's a new day or same day
  IF is_new_day THEN
    xp_gain := 10; -- New day bonus
  ELSE
    xp_gain := 1;  -- Same day continuation
  END IF;
  
  RETURN xp_gain;
END;
$$ LANGUAGE plpgsql;

-- Update the existing XP calculation function to use daily tracking
CREATE OR REPLACE FUNCTION update_user_progress_xp()
RETURNS TRIGGER AS $$
DECLARE
  xp_gain integer;
  is_new_day boolean;
BEGIN
  -- Determine if this is a new day activity
  IF OLD.last_activity IS NULL THEN
    is_new_day := true;
  ELSE
    is_new_day := NOT is_same_day_activity(OLD.last_activity);
  END IF;
  
  -- Calculate XP gain based on daily pattern
  IF is_new_day THEN
    xp_gain := 10; -- New day: 10 XP
    -- Increment streak for new day
    NEW.study_streak := OLD.study_streak + 1;
  ELSE
    xp_gain := 1;  -- Same day: 1 XP
    -- Keep same streak for same day
    NEW.study_streak := OLD.study_streak;
  END IF;
  
  -- Add XP gain to existing points
  NEW.xp_points := OLD.xp_points + xp_gain;
  
  -- Update last activity timestamp
  NEW.last_activity := now();
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS calculate_xp_on_progress_update ON user_progress;
CREATE TRIGGER calculate_xp_on_progress_update
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_user_progress_xp();

-- Add helpful comments
COMMENT ON FUNCTION is_same_day_activity(timestamptz) IS 'Checks if the given timestamp is from the same day as today';
COMMENT ON FUNCTION calculate_daily_xp(text, uuid, timestamptz) IS 'Calculates XP gain based on daily activity pattern: 10 XP for new day, 1 XP for same day';
COMMENT ON FUNCTION update_user_progress_xp() IS 'Trigger function that automatically calculates XP and streak based on daily activity pattern';