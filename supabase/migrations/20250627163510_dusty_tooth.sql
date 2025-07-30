/*
  # Sync Progress Percentage with XP Points

  1. Database Updates
    - Update existing user_progress records to sync completion_percentage with xp_points
    - Modify the XP calculation function to keep percentage and XP in sync
    - Ensure completion percentage never exceeds 100%

  2. Function Updates
    - Update trigger function to maintain percentage = XP relationship
    - Cap completion percentage at 100% regardless of XP
*/

-- Update existing records to sync completion_percentage with xp_points (capped at 100%)
UPDATE user_progress 
SET completion_percentage = LEAST(100, xp_points)
WHERE completion_percentage != LEAST(100, xp_points);

-- Update the XP calculation function to maintain percentage = XP sync
CREATE OR REPLACE FUNCTION update_user_progress_xp()
RETURNS TRIGGER AS $$
DECLARE
  xp_gain integer;
  is_new_day boolean;
  new_completion_percentage integer;
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
  
  -- IMPORTANT: Set completion percentage equal to XP points (capped at 100%)
  NEW.completion_percentage := LEAST(100, NEW.xp_points);
  
  -- Update status based on completion percentage
  IF NEW.completion_percentage >= 100 THEN
    NEW.status := 'completed';
  ELSIF NEW.completion_percentage > 0 THEN
    NEW.status := 'in_progress';
  ELSE
    NEW.status := 'not_started';
  END IF;
  
  -- Update last activity timestamp
  NEW.last_activity := now();
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add a constraint to ensure completion_percentage never exceeds 100
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_progress_completion_percentage_check'
    AND table_name = 'user_progress'
  ) THEN
    ALTER TABLE user_progress DROP CONSTRAINT user_progress_completion_percentage_check;
  END IF;
  
  -- Add new constraint
  ALTER TABLE user_progress ADD CONSTRAINT user_progress_completion_percentage_check 
    CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
END $$;

-- Update comment for the function
COMMENT ON FUNCTION update_user_progress_xp() IS 'Trigger function that automatically calculates XP and streak based on daily activity pattern. Keeps completion_percentage synced with xp_points (capped at 100%).';