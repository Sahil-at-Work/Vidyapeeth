/*
  # Add premium_resources column to subject_materials table

  1. New Column
    - `premium_resources` (jsonb) - Stores premium study materials including Google Drive links and PDF files
  
  2. Index
    - GIN index on premium_resources for efficient JSON queries
  
  3. Default Value
    - Empty JSON object `{}`
*/

-- Add premium_resources column to subject_materials table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subject_materials' AND column_name = 'premium_resources'
  ) THEN
    ALTER TABLE subject_materials 
    ADD COLUMN premium_resources jsonb DEFAULT '{}' NOT NULL;
  END IF;
END $$;

-- Add GIN index for efficient JSON queries on premium_resources
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'subject_materials' AND indexname = 'idx_subject_materials_premium_resources'
  ) THEN
    CREATE INDEX idx_subject_materials_premium_resources 
    ON subject_materials USING gin (premium_resources);
  END IF;
END $$;

-- Add comment to the column
COMMENT ON COLUMN subject_materials.premium_resources IS 'JSON object containing premium study materials including Google Drive links and PDF files for authenticated users';