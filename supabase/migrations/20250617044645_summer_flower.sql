/*
  # University Management System Schema

  1. New Tables
    - `universities`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `short_name` (text) - abbreviation like 'PU', 'MU'
      - `location` (text)
      - `created_at` (timestamp)
    
    - `departments`
      - `id` (uuid, primary key)  
      - `name` (text, not null)
      - `code` (text) - department code like 'CS', 'IT'
      - `university_id` (uuid, foreign key to universities)
      - `created_at` (timestamp)
    
    - `semesters`
      - `id` (uuid, primary key)
      - `number` (integer, 1-8)
      - `department_id` (uuid, foreign key to departments)
      - `created_at` (timestamp)
    
    - `subjects`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `code` (text) - subject code like 'CS101'
      - `credits` (integer)
      - `semester_id` (uuid, foreign key to semesters)
      - `created_at` (timestamp)
    
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `university_id` (uuid, foreign key to universities)
      - `department_id` (uuid, foreign key to departments) 
      - `semester_id` (uuid, foreign key to semesters)
      - `profile_completed` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Public read access for universities, departments, semesters, subjects
    - Users can only access their own profile data
    - Authenticated users can create/update their profile

  3. Initial Data
    - Sample universities, departments, semesters, and subjects
*/

-- Create universities table
CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  short_name text,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  university_id uuid REFERENCES universities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(code, university_id)
);

-- Create semesters table
CREATE TABLE IF NOT EXISTS semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL CHECK (number >= 1 AND number <= 8),
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(number, department_id)
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  credits integer DEFAULT 3,
  semester_id uuid REFERENCES semesters(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(code, semester_id)
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id uuid REFERENCES universities(id),
  department_id uuid REFERENCES departments(id),
  semester_id uuid REFERENCES semesters(id),
  profile_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Universities are publicly readable"
  ON universities
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Departments are publicly readable"
  ON departments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Semesters are publicly readable"
  ON semesters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Subjects are publicly readable"
  ON subjects
  FOR SELECT
  TO public
  USING (true);

-- Create policies for user profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();