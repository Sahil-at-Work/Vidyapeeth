/*
  # Enhanced Gamified Learning System

  1. New Tables
    - `subject_materials` - Store syllabus, drive links, and GATE questions for each subject
    - `user_progress` - Track user progress, XP, streaks, and completion status
    - `leaderboard_competitors` - AI competitors for gamification
    - `user_achievements` - Achievement system for milestones

  2. Enums
    - `subject_status` - Progress status (not_started, in_progress, completed)
    - `achievement_type` - Types of achievements users can earn

  3. Functions
    - XP calculation based on progress and streaks
    - Achievement checking and awarding
    - AI competitor XP updates

  4. Security
    - Enable RLS on all new tables
    - Appropriate policies for data access
*/

-- Create enum for subject progress status
CREATE TYPE subject_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Create enum for achievement types
CREATE TYPE achievement_type AS ENUM ('first_subject', 'streak_7', 'streak_30', 'top_performer', 'gate_master');

-- Create subject_materials table
CREATE TABLE IF NOT EXISTS subject_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  syllabus text,
  drive_link text,
  gate_questions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  status subject_status DEFAULT 'not_started',
  xp_points integer DEFAULT 0,
  study_streak integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subject_id)
);

-- Create leaderboard_competitors table (AI competitors)
CREATE TABLE IF NOT EXISTS leaderboard_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text,
  total_xp integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  is_ai boolean DEFAULT true,
  personality_type text DEFAULT 'balanced', -- balanced, aggressive, steady
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type achievement_type NOT NULL,
  title text NOT NULL,
  description text,
  xp_reward integer DEFAULT 0,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Enable RLS on all tables
ALTER TABLE subject_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subject_materials
CREATE POLICY "Subject materials are publicly readable"
  ON subject_materials
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage subject materials"
  ON subject_materials
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_progress
CREATE POLICY "Users can manage own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for leaderboard_competitors
CREATE POLICY "Competitors are publicly readable"
  ON leaderboard_competitors
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage competitors"
  ON leaderboard_competitors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subject_materials_subject_id ON subject_materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_subject_id ON user_progress(subject_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_competitors_total_xp ON leaderboard_competitors(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Function to calculate XP for subject progress
CREATE OR REPLACE FUNCTION calculate_subject_xp(
  p_status subject_status,
  p_completion_percentage integer,
  p_streak integer
)
RETURNS integer AS $$
DECLARE
  base_xp integer := 0;
  streak_bonus integer := 0;
BEGIN
  -- Base XP calculation
  CASE p_status
    WHEN 'not_started' THEN base_xp := 0;
    WHEN 'in_progress' THEN base_xp := p_completion_percentage * 2; -- 2 XP per percentage
    WHEN 'completed' THEN base_xp := 200; -- 200 XP for completion
  END CASE;
  
  -- Streak bonus (5 XP per day in streak)
  streak_bonus := p_streak * 5;
  
  RETURN base_xp + streak_bonus;
END;
$$ LANGUAGE plpgsql;

-- Function to update user progress and calculate XP
CREATE OR REPLACE FUNCTION update_user_progress_xp()
RETURNS TRIGGER AS $$
DECLARE
  new_xp integer;
BEGIN
  -- Calculate new XP
  new_xp := calculate_subject_xp(NEW.status, NEW.completion_percentage, NEW.study_streak);
  NEW.xp_points := new_xp;
  
  -- Update last activity
  NEW.last_activity := now();
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's total XP
CREATE OR REPLACE FUNCTION get_user_total_xp(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  total_xp integer;
BEGIN
  SELECT COALESCE(SUM(xp_points), 0) INTO total_xp
  FROM user_progress
  WHERE user_id = p_user_id;
  
  RETURN total_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update AI competitors XP (called periodically)
CREATE OR REPLACE FUNCTION update_ai_competitors_xp()
RETURNS void AS $$
DECLARE
  competitor RECORD;
  xp_increase integer;
  streak_change integer;
BEGIN
  FOR competitor IN SELECT * FROM leaderboard_competitors WHERE is_ai = true LOOP
    -- Calculate XP increase based on personality
    CASE competitor.personality_type
      WHEN 'aggressive' THEN 
        xp_increase := 15 + (random() * 25)::integer; -- 15-40 XP
        streak_change := CASE WHEN random() > 0.3 THEN 1 ELSE -1 END;
      WHEN 'steady' THEN 
        xp_increase := 10 + (random() * 15)::integer; -- 10-25 XP
        streak_change := CASE WHEN random() > 0.2 THEN 1 ELSE 0 END;
      ELSE -- balanced
        xp_increase := 12 + (random() * 20)::integer; -- 12-32 XP
        streak_change := CASE WHEN random() > 0.25 THEN 1 ELSE -1 END;
    END CASE;
    
    -- Update competitor
    UPDATE leaderboard_competitors
    SET 
      total_xp = total_xp + xp_increase,
      current_streak = GREATEST(0, current_streak + streak_change),
      updated_at = now()
    WHERE id = competitor.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id uuid)
RETURNS void AS $$
DECLARE
  completed_subjects integer;
  current_streak integer;
  total_xp integer;
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO completed_subjects
  FROM user_progress
  WHERE user_id = p_user_id AND status = 'completed';
  
  SELECT COALESCE(MAX(study_streak), 0) INTO current_streak
  FROM user_progress
  WHERE user_id = p_user_id;
  
  SELECT get_user_total_xp(p_user_id) INTO total_xp;
  
  -- Award first subject completion
  IF completed_subjects >= 1 THEN
    INSERT INTO user_achievements (user_id, achievement_type, title, description, xp_reward)
    VALUES (p_user_id, 'first_subject', 'First Steps', 'Completed your first subject!', 50)
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
  
  -- Award 7-day streak
  IF current_streak >= 7 THEN
    INSERT INTO user_achievements (user_id, achievement_type, title, description, xp_reward)
    VALUES (p_user_id, 'streak_7', 'Week Warrior', 'Maintained a 7-day study streak!', 100)
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
  
  -- Award 30-day streak
  IF current_streak >= 30 THEN
    INSERT INTO user_achievements (user_id, achievement_type, title, description, xp_reward)
    VALUES (p_user_id, 'streak_30', 'Month Master', 'Maintained a 30-day study streak!', 300)
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
  
  -- Award top performer (1000+ XP)
  IF total_xp >= 1000 THEN
    INSERT INTO user_achievements (user_id, achievement_type, title, description, xp_reward)
    VALUES (p_user_id, 'top_performer', 'Top Performer', 'Earned over 1000 XP!', 200)
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to trigger achievement check
CREATE OR REPLACE FUNCTION trigger_achievement_check()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_achievements(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_subject_materials_updated_at
  BEFORE UPDATE ON subject_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_competitors_updated_at
  BEFORE UPDATE ON leaderboard_competitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for XP calculation
CREATE TRIGGER calculate_xp_on_progress_update
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_user_progress_xp();

-- Create trigger to check achievements when progress is updated
CREATE TRIGGER check_achievements_on_progress_update
  AFTER UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION trigger_achievement_check();

-- Insert sample AI competitors
INSERT INTO leaderboard_competitors (name, avatar_url, total_xp, current_streak, personality_type) VALUES
  ('Alex Chen', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 1250, 12, 'aggressive'),
  ('Priya Sharma', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 980, 8, 'steady')
ON CONFLICT DO NOTHING;

-- Insert sample subject materials for common subjects
INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions)
SELECT 
  s.id,
  'Complete syllabus covering fundamental concepts, advanced topics, and practical applications. Topics include: ' || s.name || ' fundamentals, problem-solving techniques, and real-world applications.',
  'https://drive.google.com/drive/folders/sample-' || lower(replace(s.name, ' ', '-')),
  jsonb_build_array(
    jsonb_build_object(
      'question', 'What is the primary concept in ' || s.name || '?',
      'options', jsonb_build_array('Option A', 'Option B', 'Option C', 'Option D'),
      'correct_answer', 0,
      'explanation', 'This is a fundamental concept in ' || s.name || '.',
      'difficulty', 'medium',
      'year', 2023
    ),
    jsonb_build_object(
      'question', 'Which of the following is most important in ' || s.name || '?',
      'options', jsonb_build_array('Theory', 'Practice', 'Both', 'Neither'),
      'correct_answer', 2,
      'explanation', 'Both theory and practice are essential for mastering ' || s.name || '.',
      'difficulty', 'easy',
      'year', 2022
    )
  )
FROM subjects s
WHERE NOT EXISTS (
  SELECT 1 FROM subject_materials sm WHERE sm.subject_id = s.id
)
LIMIT 20; -- Limit to avoid too many inserts