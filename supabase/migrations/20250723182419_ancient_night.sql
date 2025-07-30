/*
  # Add syllabus progress tracking

  1. New Table
    - `syllabus_progress`
      - `id` (uuid, primary key)
      - `user_id` (text, foreign key to users)
      - `subject_id` (uuid, foreign key to subjects)
      - `section_index` (integer)
      - `topic_index` (integer, nullable)
      - `subtopic_index` (integer, nullable)
      - `completed` (boolean)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `syllabus_progress` table
    - Add policy for users to manage their own progress

  3. Indexes
    - Add indexes for efficient querying
*/

CREATE TABLE IF NOT EXISTS syllabus_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  section_index integer NOT NULL,
  topic_index integer,
  subtopic_index integer,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, subject_id, section_index, topic_index, subtopic_index)
);

ALTER TABLE syllabus_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own syllabus progress"
  ON syllabus_progress
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_syllabus_progress_user_subject 
  ON syllabus_progress(user_id, subject_id);

CREATE INDEX IF NOT EXISTS idx_syllabus_progress_completed 
  ON syllabus_progress(completed);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_syllabus_progress_updated_at
  BEFORE UPDATE ON syllabus_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();