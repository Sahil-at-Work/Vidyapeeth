/*
  # Create Student Doubts System

  1. New Tables
    - `student_doubts`
      - `id` (uuid, primary key)
      - `user_id` (text, foreign key to users)
      - `subject_id` (uuid, foreign key to subjects)
      - `title` (text)
      - `description` (text)
      - `tags` (text array)
      - `upvotes` (integer, default 0)
      - `views` (integer, default 0)
      - `replies_count` (integer, default 0)
      - `is_resolved` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `doubt_replies`
      - `id` (uuid, primary key)
      - `doubt_id` (uuid, foreign key to student_doubts)
      - `user_id` (text, foreign key to users)
      - `content` (text)
      - `upvotes` (integer, default 0)
      - `is_best_answer` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `doubt_upvotes`
      - `id` (uuid, primary key)
      - `user_id` (text, foreign key to users)
      - `doubt_id` (uuid, foreign key to student_doubts, nullable)
      - `reply_id` (uuid, foreign key to doubt_replies, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own content
    - Add policies for public read access to doubts and replies

  3. Functions
    - `upvote_doubt` - Handle doubt upvoting with duplicate prevention
    - `upvote_reply` - Handle reply upvoting with duplicate prevention
    - `increment_doubt_views` - Increment view count for doubts
    - `update_replies_count` - Trigger to update reply count on doubts
*/

-- Create student_doubts table
CREATE TABLE IF NOT EXISTS student_doubts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  tags text[] DEFAULT '{}',
  upvotes integer DEFAULT 0,
  views integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create doubt_replies table
CREATE TABLE IF NOT EXISTS doubt_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id uuid NOT NULL REFERENCES student_doubts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  upvotes integer DEFAULT 0,
  is_best_answer boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create doubt_upvotes table
CREATE TABLE IF NOT EXISTS doubt_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doubt_id uuid REFERENCES student_doubts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES doubt_replies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT check_upvote_target CHECK (
    (doubt_id IS NOT NULL AND reply_id IS NULL) OR 
    (doubt_id IS NULL AND reply_id IS NOT NULL)
  ),
  UNIQUE(user_id, doubt_id),
  UNIQUE(user_id, reply_id)
);

-- Enable RLS
ALTER TABLE student_doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubt_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubt_upvotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_doubts
CREATE POLICY "Anyone can read doubts"
  ON student_doubts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create doubts"
  ON student_doubts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own doubts"
  ON student_doubts
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own doubts"
  ON student_doubts
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- RLS Policies for doubt_replies
CREATE POLICY "Anyone can read replies"
  ON doubt_replies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON doubt_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own replies"
  ON doubt_replies
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own replies"
  ON doubt_replies
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- RLS Policies for doubt_upvotes
CREATE POLICY "Users can manage own upvotes"
  ON doubt_upvotes
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_doubts_user_id ON student_doubts(user_id);
CREATE INDEX IF NOT EXISTS idx_student_doubts_subject_id ON student_doubts(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_doubts_created_at ON student_doubts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_doubts_upvotes ON student_doubts(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_student_doubts_views ON student_doubts(views DESC);
CREATE INDEX IF NOT EXISTS idx_student_doubts_tags ON student_doubts USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_doubt_replies_doubt_id ON doubt_replies(doubt_id);
CREATE INDEX IF NOT EXISTS idx_doubt_replies_user_id ON doubt_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_doubt_replies_created_at ON doubt_replies(created_at);

CREATE INDEX IF NOT EXISTS idx_doubt_upvotes_user_doubt ON doubt_upvotes(user_id, doubt_id);
CREATE INDEX IF NOT EXISTS idx_doubt_upvotes_user_reply ON doubt_upvotes(user_id, reply_id);

-- Function to upvote a doubt
CREATE OR REPLACE FUNCTION upvote_doubt(doubt_id uuid, user_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user already upvoted this doubt
  IF EXISTS (
    SELECT 1 FROM doubt_upvotes 
    WHERE doubt_upvotes.user_id = upvote_doubt.user_id 
    AND doubt_upvotes.doubt_id = upvote_doubt.doubt_id
  ) THEN
    -- Remove upvote
    DELETE FROM doubt_upvotes 
    WHERE doubt_upvotes.user_id = upvote_doubt.user_id 
    AND doubt_upvotes.doubt_id = upvote_doubt.doubt_id;
    
    -- Decrement upvote count
    UPDATE student_doubts 
    SET upvotes = upvotes - 1 
    WHERE id = upvote_doubt.doubt_id;
  ELSE
    -- Add upvote
    INSERT INTO doubt_upvotes (user_id, doubt_id) 
    VALUES (upvote_doubt.user_id, upvote_doubt.doubt_id);
    
    -- Increment upvote count
    UPDATE student_doubts 
    SET upvotes = upvotes + 1 
    WHERE id = upvote_doubt.doubt_id;
  END IF;
END;
$$;

-- Function to upvote a reply
CREATE OR REPLACE FUNCTION upvote_reply(reply_id uuid, user_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user already upvoted this reply
  IF EXISTS (
    SELECT 1 FROM doubt_upvotes 
    WHERE doubt_upvotes.user_id = upvote_reply.user_id 
    AND doubt_upvotes.reply_id = upvote_reply.reply_id
  ) THEN
    -- Remove upvote
    DELETE FROM doubt_upvotes 
    WHERE doubt_upvotes.user_id = upvote_reply.user_id 
    AND doubt_upvotes.reply_id = upvote_reply.reply_id;
    
    -- Decrement upvote count
    UPDATE doubt_replies 
    SET upvotes = upvotes - 1 
    WHERE id = upvote_reply.reply_id;
  ELSE
    -- Add upvote
    INSERT INTO doubt_upvotes (user_id, reply_id) 
    VALUES (upvote_reply.user_id, upvote_reply.reply_id);
    
    -- Increment upvote count
    UPDATE doubt_replies 
    SET upvotes = upvotes + 1 
    WHERE id = upvote_reply.reply_id;
  END IF;
END;
$$;

-- Function to increment doubt views
CREATE OR REPLACE FUNCTION increment_doubt_views(doubt_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE student_doubts 
  SET views = views + 1 
  WHERE id = increment_doubt_views.doubt_id;
END;
$$;

-- Function to update replies count
CREATE OR REPLACE FUNCTION update_replies_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE student_doubts 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.doubt_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE student_doubts 
    SET replies_count = replies_count - 1 
    WHERE id = OLD.doubt_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger to update replies count
CREATE TRIGGER update_doubt_replies_count
  AFTER INSERT OR DELETE ON doubt_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_replies_count();

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_student_doubts_updated_at
  BEFORE UPDATE ON student_doubts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doubt_replies_updated_at
  BEFORE UPDATE ON doubt_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();