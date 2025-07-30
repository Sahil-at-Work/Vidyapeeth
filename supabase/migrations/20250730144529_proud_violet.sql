/*
  # Add Doubts Scoring System

  1. New Tables
    - `doubt_scores` - Track user scores from doubt activities
    - `doubt_score_transactions` - Log all scoring activities
    
  2. New Columns
    - Add `score_points` to `student_doubts` table
    - Add `score_points` to `doubt_replies` table
    - Add `total_doubt_score` to `user_profiles` table
    
  3. Scoring Logic
    - Ask doubt: +5 points
    - Answer doubt: +10 points
    - Get upvote on doubt: +2 points
    - Get upvote on answer: +3 points
    - Best answer selected: +15 points
    - Quality bonus for detailed answers: +5 points
    
  4. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Add scoring columns to existing tables
ALTER TABLE student_doubts ADD COLUMN IF NOT EXISTS score_points INTEGER DEFAULT 5;
ALTER TABLE doubt_replies ADD COLUMN IF NOT EXISTS score_points INTEGER DEFAULT 10;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_doubt_score INTEGER DEFAULT 0;

-- Create doubt_scores table to track user scores
CREATE TABLE IF NOT EXISTS doubt_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  doubts_asked INTEGER DEFAULT 0,
  doubts_answered INTEGER DEFAULT 0,
  upvotes_received INTEGER DEFAULT 0,
  best_answers INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create doubt_score_transactions table to log all scoring activities
CREATE TABLE IF NOT EXISTS doubt_score_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doubt_id UUID REFERENCES student_doubts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES doubt_replies(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'ask_doubt', 'answer_doubt', 'doubt_upvote', 'reply_upvote', 
    'best_answer', 'quality_bonus', 'streak_bonus'
  )),
  points_earned INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE doubt_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubt_score_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doubt_scores
CREATE POLICY "Users can view own doubt scores"
  ON doubt_scores
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own doubt scores"
  ON doubt_scores
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own doubt scores"
  ON doubt_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Public can view doubt scores for leaderboard"
  ON doubt_scores
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for doubt_score_transactions
CREATE POLICY "Users can view own score transactions"
  ON doubt_score_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "System can insert score transactions"
  ON doubt_score_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doubt_scores_user_id ON doubt_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_doubt_scores_total_score ON doubt_scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_doubt_score_transactions_user_id ON doubt_score_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_doubt_score_transactions_type ON doubt_score_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_doubt_score_transactions_created_at ON doubt_score_transactions(created_at DESC);

-- Function to update doubt scores
CREATE OR REPLACE FUNCTION update_doubt_score(
  p_user_id TEXT,
  p_transaction_type TEXT,
  p_points INTEGER,
  p_doubt_id UUID DEFAULT NULL,
  p_reply_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Insert or update doubt_scores
  INSERT INTO doubt_scores (user_id, total_score, created_at, updated_at)
  VALUES (p_user_id, p_points, now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_score = doubt_scores.total_score + p_points,
    doubts_asked = CASE WHEN p_transaction_type = 'ask_doubt' THEN doubt_scores.doubts_asked + 1 ELSE doubt_scores.doubts_asked END,
    doubts_answered = CASE WHEN p_transaction_type = 'answer_doubt' THEN doubt_scores.doubts_answered + 1 ELSE doubt_scores.doubts_answered END,
    upvotes_received = CASE WHEN p_transaction_type IN ('doubt_upvote', 'reply_upvote') THEN doubt_scores.upvotes_received + 1 ELSE doubt_scores.upvotes_received END,
    best_answers = CASE WHEN p_transaction_type = 'best_answer' THEN doubt_scores.best_answers + 1 ELSE doubt_scores.best_answers END,
    last_activity_date = CURRENT_DATE,
    updated_at = now();

  -- Log the transaction
  INSERT INTO doubt_score_transactions (
    user_id, doubt_id, reply_id, transaction_type, points_earned, description
  ) VALUES (
    p_user_id, p_doubt_id, p_reply_id, p_transaction_type, p_points, p_description
  );

  -- Update user_profiles total_doubt_score
  UPDATE user_profiles 
  SET total_doubt_score = (
    SELECT COALESCE(total_score, 0) 
    FROM doubt_scores 
    WHERE user_id = p_user_id
  )
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for new doubts
CREATE OR REPLACE FUNCTION award_points_for_new_doubt() RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_doubt_score(
    NEW.user_id,
    'ask_doubt',
    5,
    NEW.id,
    NULL,
    'Points for asking a new doubt: ' || NEW.title
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for new replies
CREATE OR REPLACE FUNCTION award_points_for_new_reply() RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_doubt_score(
    NEW.user_id,
    'answer_doubt',
    10,
    NEW.doubt_id,
    NEW.id,
    'Points for answering a doubt'
  );
  
  -- Quality bonus for detailed answers (>100 characters)
  IF LENGTH(NEW.content) > 100 THEN
    PERFORM update_doubt_score(
      NEW.user_id,
      'quality_bonus',
      5,
      NEW.doubt_id,
      NEW.id,
      'Quality bonus for detailed answer'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for upvotes
CREATE OR REPLACE FUNCTION award_points_for_upvote() RETURNS TRIGGER AS $$
DECLARE
  target_user_id TEXT;
  points_to_award INTEGER;
  transaction_type TEXT;
  description_text TEXT;
BEGIN
  IF NEW.doubt_id IS NOT NULL THEN
    -- Upvote on doubt
    SELECT user_id INTO target_user_id FROM student_doubts WHERE id = NEW.doubt_id;
    points_to_award := 2;
    transaction_type := 'doubt_upvote';
    description_text := 'Points for receiving upvote on doubt';
  ELSIF NEW.reply_id IS NOT NULL THEN
    -- Upvote on reply
    SELECT user_id INTO target_user_id FROM doubt_replies WHERE id = NEW.reply_id;
    points_to_award := 3;
    transaction_type := 'reply_upvote';
    description_text := 'Points for receiving upvote on answer';
  END IF;
  
  IF target_user_id IS NOT NULL THEN
    PERFORM update_doubt_score(
      target_user_id,
      transaction_type,
      points_to_award,
      NEW.doubt_id,
      NEW.reply_id,
      description_text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for best answers
CREATE OR REPLACE FUNCTION award_points_for_best_answer() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_best_answer = true AND (OLD.is_best_answer IS NULL OR OLD.is_best_answer = false) THEN
    PERFORM update_doubt_score(
      NEW.user_id,
      'best_answer',
      15,
      NEW.doubt_id,
      NEW.id,
      'Points for best answer selection'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_award_points_new_doubt ON student_doubts;
CREATE TRIGGER trigger_award_points_new_doubt
  AFTER INSERT ON student_doubts
  FOR EACH ROW EXECUTE FUNCTION award_points_for_new_doubt();

DROP TRIGGER IF EXISTS trigger_award_points_new_reply ON doubt_replies;
CREATE TRIGGER trigger_award_points_new_reply
  AFTER INSERT ON doubt_replies
  FOR EACH ROW EXECUTE FUNCTION award_points_for_new_reply();

DROP TRIGGER IF EXISTS trigger_award_points_upvote ON doubt_upvotes;
CREATE TRIGGER trigger_award_points_upvote
  AFTER INSERT ON doubt_upvotes
  FOR EACH ROW EXECUTE FUNCTION award_points_for_upvote();

DROP TRIGGER IF EXISTS trigger_award_points_best_answer ON doubt_replies;
CREATE TRIGGER trigger_award_points_best_answer
  AFTER UPDATE ON doubt_replies
  FOR EACH ROW EXECUTE FUNCTION award_points_for_best_answer();

-- Create updated_at trigger for doubt_scores
CREATE TRIGGER update_doubt_scores_updated_at
  BEFORE UPDATE ON doubt_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();