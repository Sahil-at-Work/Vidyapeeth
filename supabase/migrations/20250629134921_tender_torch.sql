/*
  # Add DPP (Daily Practice Problems) to Subject Materials

  1. Database Changes
    - Add `dpp_materials` column to existing `subject_materials` table
    - Store DPP data as JSON format with title and links
    - Add sample DPP data for MH-HSC Class XI Chemistry

  2. Structure
    - JSON format: [{"title": "DPP Title", "link": "URL"}, ...]
    - Multiple DPPs can be stored for each subject
    - Only accessible to users with completed profiles
*/

-- Add dpp_materials column to subject_materials table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subject_materials' AND column_name = 'dpp_materials'
  ) THEN
    ALTER TABLE subject_materials ADD COLUMN dpp_materials jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add sample DPP materials for MH-HSC Class XI Chemistry
UPDATE subject_materials 
SET dpp_materials = jsonb_build_array(
  jsonb_build_object(
    'title', 'DPP-01: Atomic Structure and Periodic Table',
    'link', 'https://drive.google.com/file/d/sample-dpp-01-atomic-structure/view'
  ),
  jsonb_build_object(
    'title', 'DPP-02: Chemical Bonding and Molecular Structure',
    'link', 'https://drive.google.com/file/d/sample-dpp-02-chemical-bonding/view'
  ),
  jsonb_build_object(
    'title', 'DPP-03: States of Matter and Thermodynamics',
    'link', 'https://drive.google.com/file/d/sample-dpp-03-states-matter/view'
  ),
  jsonb_build_object(
    'title', 'DPP-04: Chemical Equilibrium and Redox Reactions',
    'link', 'https://drive.google.com/file/d/sample-dpp-04-equilibrium-redox/view'
  ),
  jsonb_build_object(
    'title', 'DPP-05: Hydrogen and s-Block Elements',
    'link', 'https://drive.google.com/file/d/sample-dpp-05-hydrogen-s-block/view'
  ),
  jsonb_build_object(
    'title', 'DPP-06: Organic Chemistry Fundamentals',
    'link', 'https://drive.google.com/file/d/sample-dpp-06-organic-fundamentals/view'
  ),
  jsonb_build_object(
    'title', 'DPP-07: Hydrocarbons and Environmental Chemistry',
    'link', 'https://drive.google.com/file/d/sample-dpp-07-hydrocarbons-environment/view'
  )
),
updated_at = now()
WHERE subject_id = (
  SELECT s.id 
  FROM subjects s 
  JOIN semesters sem ON s.semester_id = sem.id 
  JOIN departments d ON sem.department_id = d.id 
  JOIN universities u ON d.university_id = u.id 
  WHERE s.code = 'MH-XI-CHE' 
  AND u.short_name = 'MH-HSC'
  LIMIT 1
);

-- Create index for better performance on dpp_materials queries
CREATE INDEX IF NOT EXISTS idx_subject_materials_dpp ON subject_materials USING GIN (dpp_materials);

-- Add helpful comment
COMMENT ON COLUMN subject_materials.dpp_materials IS 'JSON array of Daily Practice Problems with title and link for each DPP';