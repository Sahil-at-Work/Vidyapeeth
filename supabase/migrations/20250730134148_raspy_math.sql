/*
  # Add Practice Tests Column to Subject Materials

  1. New Column
    - `practice_tests` (jsonb) - Stores array of practice test objects
    
  2. Structure
    - Each test contains title, description, duration, and questions array
    - Questions have image URLs, options array, correct answer index, and explanations
    
  3. Index
    - GIN index for efficient JSON queries on practice_tests column
*/

-- Add practice_tests column to subject_materials table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subject_materials' AND column_name = 'practice_tests'
  ) THEN
    ALTER TABLE subject_materials 
    ADD COLUMN practice_tests jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add GIN index for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_subject_materials_practice_tests 
ON subject_materials USING gin (practice_tests);

-- Add comment for documentation
COMMENT ON COLUMN subject_materials.practice_tests IS 'JSON array of practice tests with image-based questions, options, correct answers, and explanations';