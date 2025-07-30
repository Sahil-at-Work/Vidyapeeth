/*
  # Create Campus Connect (Placement Records) System

  1. New Tables
    - `placement_records`
      - `id` (uuid, primary key)
      - `company_name` (text, required)
      - `job_title` (text, required)
      - `job_description` (text, required)
      - `job_type` (enum: internship, placement, both)
      - `posting_date` (timestamp, required)
      - `deadline` (timestamp, required)
      - `salary_range` (text, optional)
      - `location` (text, optional)
      - `requirements` (text, optional)
      - `application_link` (text, optional)
      - `contact_email` (text, optional)
      - `is_official` (boolean, default true)
      - `posted_by` (text, foreign key to users)
      - `views` (integer, default 0)
      - `applications_count` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `placement_comments`
      - `id` (uuid, primary key)
      - `placement_id` (uuid, foreign key to placement_records)
      - `user_id` (text, foreign key to users)
      - `content` (text, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read all records
    - Add policies for authenticated users to create/update their own records
    - Add policies for authenticated users to create comments
*/

-- Create enum for job types
CREATE TYPE job_type AS ENUM ('internship', 'placement', 'both');

-- Create placement_records table
CREATE TABLE IF NOT EXISTS placement_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  job_title text NOT NULL,
  job_description text NOT NULL,
  job_type job_type NOT NULL DEFAULT 'placement',
  posting_date timestamptz NOT NULL DEFAULT now(),
  deadline timestamptz NOT NULL,
  salary_range text,
  location text,
  requirements text,
  application_link text,
  contact_email text,
  is_official boolean DEFAULT true,
  posted_by text NOT NULL,
  views integer DEFAULT 0,
  applications_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create placement_comments table
CREATE TABLE IF NOT EXISTS placement_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id uuid NOT NULL,
  user_id text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE placement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_comments ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraints
ALTER TABLE placement_records ADD CONSTRAINT placement_records_posted_by_fkey 
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE placement_comments ADD CONSTRAINT placement_comments_placement_id_fkey 
  FOREIGN KEY (placement_id) REFERENCES placement_records(id) ON DELETE CASCADE;

ALTER TABLE placement_comments ADD CONSTRAINT placement_comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_placement_records_deadline ON placement_records(deadline);
CREATE INDEX IF NOT EXISTS idx_placement_records_posting_date ON placement_records(posting_date DESC);
CREATE INDEX IF NOT EXISTS idx_placement_records_company ON placement_records(company_name);
CREATE INDEX IF NOT EXISTS idx_placement_records_job_type ON placement_records(job_type);
CREATE INDEX IF NOT EXISTS idx_placement_records_is_active ON placement_records(is_active);
CREATE INDEX IF NOT EXISTS idx_placement_comments_placement_id ON placement_comments(placement_id);
CREATE INDEX IF NOT EXISTS idx_placement_comments_user_id ON placement_comments(user_id);

-- RLS Policies for placement_records
CREATE POLICY "Anyone can read active placement records"
  ON placement_records
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can create placement records"
  ON placement_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = posted_by);

CREATE POLICY "Users can update own placement records"
  ON placement_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = posted_by)
  WITH CHECK (auth.uid()::text = posted_by);

CREATE POLICY "Users can delete own placement records"
  ON placement_records
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = posted_by);

-- RLS Policies for placement_comments
CREATE POLICY "Anyone can read placement comments"
  ON placement_comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON placement_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own comments"
  ON placement_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own comments"
  ON placement_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_placement_records_updated_at
  BEFORE UPDATE ON placement_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_placement_comments_updated_at
  BEFORE UPDATE ON placement_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_placement_views(placement_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE placement_records 
  SET views = views + 1 
  WHERE id = placement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;