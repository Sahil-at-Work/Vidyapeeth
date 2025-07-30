/*
  # GATE Questions Completion System

  1. Database Changes
    - Add gate_questions_completed column to user_progress table
    - Update XP calculation to cap at 99% unless GATE questions completed
    - Add completion confirmation system

  2. Functions
    - Update progress calculation to handle GATE completion requirement
    - Add celebration trigger for 100% completion
*/

-- Add gate_questions_completed column to user_progress table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'gate_questions_completed'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN gate_questions_completed boolean DEFAULT false;
  END IF;
END $$;

-- Update the XP calculation function to handle GATE completion requirement
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
  
  -- IMPORTANT: Set completion percentage based on XP and GATE completion status
  IF NEW.gate_questions_completed = true AND NEW.xp_points >= 99 THEN
    -- Allow 100% only if GATE questions are completed
    NEW.completion_percentage := LEAST(100, NEW.xp_points);
  ELSE
    -- Cap at 99% if GATE questions not completed, regardless of XP
    NEW.completion_percentage := LEAST(99, NEW.xp_points);
  END IF;
  
  -- Update status based on completion percentage and GATE completion
  IF NEW.completion_percentage >= 100 AND NEW.gate_questions_completed = true THEN
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

-- Function to mark GATE questions as completed
CREATE OR REPLACE FUNCTION mark_gate_questions_completed(
  p_user_id text,
  p_subject_id uuid
)
RETURNS void AS $$
BEGIN
  UPDATE user_progress
  SET 
    gate_questions_completed = true,
    updated_at = now()
  WHERE user_id = p_user_id AND subject_id = p_subject_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can complete subject (has completed GATE questions)
CREATE OR REPLACE FUNCTION can_complete_subject(
  p_user_id text,
  p_subject_id uuid
)
RETURNS boolean AS $$
DECLARE
  progress_record user_progress%ROWTYPE;
BEGIN
  SELECT * INTO progress_record
  FROM user_progress
  WHERE user_id = p_user_id AND subject_id = p_subject_id;
  
  -- Can complete if GATE questions are completed and XP >= 99
  RETURN progress_record.gate_questions_completed = true AND progress_record.xp_points >= 99;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for better performance on gate_questions_completed queries
CREATE INDEX IF NOT EXISTS idx_user_progress_gate_completed ON user_progress(gate_questions_completed);

-- Update existing records to allow completion for those who might have already completed GATE questions
-- This is a one-time update for existing data
UPDATE user_progress 
SET gate_questions_completed = true
WHERE completion_percentage >= 100 OR status = 'completed';

-- Add helpful comments
COMMENT ON COLUMN user_progress.gate_questions_completed IS 'Tracks whether user has completed all GATE questions for this subject';
COMMENT ON FUNCTION mark_gate_questions_completed(text, uuid) IS 'Marks GATE questions as completed for a specific user and subject';
COMMENT ON FUNCTION can_complete_subject(text, uuid) IS 'Checks if user can mark subject as 100% completed (requires GATE questions completion)';