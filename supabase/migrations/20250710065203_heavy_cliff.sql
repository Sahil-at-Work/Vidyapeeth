/*
  # Update Syllabus to JSON Format

  1. Database Changes
    - Add new `syllabus_json` column to subject_materials table
    - Convert existing markdown syllabus to structured JSON format
    - Add sample JSON syllabus data for better structure

  2. JSON Structure
    - sections: array of syllabus sections
    - Each section has: title, description, topics
    - Each topic has: title, description, subtopics, importance_level
    - Additional metadata: duration, difficulty, prerequisites
*/

-- Add syllabus_json column to subject_materials table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subject_materials' AND column_name = 'syllabus_json'
  ) THEN
    ALTER TABLE subject_materials ADD COLUMN syllabus_json jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update Maharashtra Board Class XI Chemistry with structured JSON syllabus
UPDATE subject_materials 
SET syllabus_json = jsonb_build_object(
  'subject_info', jsonb_build_object(
    'name', 'Chemistry',
    'code', 'MH-XI-CHE',
    'level', 'Class XI',
    'board', 'Maharashtra Board',
    'total_duration', '180 hours',
    'exam_pattern', 'Theory (70 marks) + Practical (30 marks)'
  ),
  'sections', jsonb_build_array(
    jsonb_build_object(
      'section_number', 1,
      'title', 'Some Basic Concepts of Chemistry',
      'description', 'Foundation concepts including matter, measurement, and chemical calculations',
      'duration', '20 hours',
      'importance', 'high',
      'topics', jsonb_build_array(
        jsonb_build_object(
          'title', 'Matter and its Nature',
          'description', 'Physical and chemical properties of matter',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Physical and chemical properties',
            'Measurement and significant figures',
            'SI units and dimensional analysis',
            'Laws of chemical combination'
          )
        ),
        jsonb_build_object(
          'title', 'Atomic and Molecular Masses',
          'description', 'Understanding atomic mass, molecular mass and mole concept',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Atomic and molecular masses',
            'Mole concept and molar mass',
            'Percentage composition',
            'Empirical and molecular formula'
          )
        )
      )
    ),
    jsonb_build_object(
      'section_number', 2,
      'title', 'Structure of Atom',
      'description', 'Atomic structure, electronic configuration and quantum mechanics',
      'duration', '25 hours',
      'importance', 'high',
      'topics', jsonb_build_array(
        jsonb_build_object(
          'title', 'Discovery of Subatomic Particles',
          'description', 'Historical development of atomic theory',
          'importance_level', 'medium',
          'subtopics', jsonb_build_array(
            'Discovery of electron, proton and neutron',
            'Thomson and Rutherford atomic models',
            'Limitations of classical models'
          )
        ),
        jsonb_build_object(
          'title', 'Quantum Mechanical Model',
          'description', 'Modern understanding of atomic structure',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Bohr model of hydrogen atom',
            'Quantum mechanical model',
            'Quantum numbers and electronic configuration',
            'Aufbau principle, Pauli exclusion principle, Hund rule'
          )
        )
      )
    ),
    jsonb_build_object(
      'section_number', 3,
      'title', 'Classification of Elements and Periodicity',
      'description', 'Periodic table and periodic properties of elements',
      'duration', '18 hours',
      'importance', 'high',
      'topics', jsonb_build_array(
        jsonb_build_object(
          'title', 'Modern Periodic Law',
          'description', 'Development and significance of periodic table',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Modern periodic law',
            'Present form of periodic table',
            'Electronic configuration of elements',
            'Nomenclature of elements with atomic number > 100'
          )
        ),
        jsonb_build_object(
          'title', 'Periodic Trends',
          'description', 'Variation of properties across periods and groups',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Atomic radius and ionic radius',
            'Ionization enthalpy',
            'Electron gain enthalpy',
            'Electronegativity and valency'
          )
        )
      )
    ),
    jsonb_build_object(
      'section_number', 4,
      'title', 'Chemical Bonding and Molecular Structure',
      'description', 'Types of chemical bonds and molecular geometry',
      'duration', '22 hours',
      'importance', 'high',
      'topics', jsonb_build_array(
        jsonb_build_object(
          'title', 'Ionic and Covalent Bonding',
          'description', 'Formation and properties of ionic and covalent bonds',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Kossel-Lewis approach to chemical bonding',
            'Ionic bond formation and factors affecting',
            'Lattice enthalpy and Born-Haber cycle',
            'Covalent bond and Lewis structures'
          )
        ),
        jsonb_build_object(
          'title', 'Molecular Geometry',
          'description', 'Shape and structure of molecules',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Valence bond theory',
            'Hybridization of atomic orbitals',
            'VSEPR theory',
            'Molecular orbital theory basics'
          )
        )
      )
    ),
    jsonb_build_object(
      'section_number', 5,
      'title', 'States of Matter',
      'description', 'Gaseous and liquid states of matter',
      'duration', '20 hours',
      'importance', 'medium',
      'topics', jsonb_build_array(
        jsonb_build_object(
          'title', 'Gaseous State',
          'description', 'Properties and behavior of gases',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Intermolecular forces and thermal energy',
            'Gas laws: Boyle, Charles, Gay-Lussac',
            'Ideal gas equation and kinetic theory',
            'Real gases and deviations'
          )
        ),
        jsonb_build_object(
          'title', 'Liquid State',
          'description', 'Properties of liquids',
          'importance_level', 'medium',
          'subtopics', jsonb_build_array(
            'Properties of liquids',
            'Vapour pressure',
            'Surface tension and viscosity'
          )
        )
      )
    ),
    jsonb_build_object(
      'section_number', 6,
      'title', 'Thermodynamics',
      'description', 'Energy changes in chemical reactions',
      'duration', '25 hours',
      'importance', 'high',
      'topics', jsonb_build_array(
        jsonb_build_object(
          'title', 'First Law of Thermodynamics',
          'description', 'Energy conservation in chemical systems',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'System and surroundings',
            'State functions and path functions',
            'First law of thermodynamics',
            'Internal energy and enthalpy'
          )
        ),
        jsonb_build_object(
          'title', 'Thermochemistry',
          'description', 'Heat changes in chemical reactions',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Measurement of ΔU and ΔH',
            'Hess law of constant heat summation',
            'Enthalpies of formation, combustion, fusion',
            'Bond dissociation enthalpy'
          )
        )
      )
    )
  ),
  'practical_work', jsonb_build_array(
    'Salt analysis (qualitative analysis)',
    'Volumetric analysis (quantitative analysis)',
    'Preparation of inorganic compounds',
    'Study of pH using indicators',
    'Crystallization techniques'
  ),
  'assessment_pattern', jsonb_build_object(
    'theory_exam', jsonb_build_object(
      'duration', '3 hours',
      'total_marks', 70,
      'question_types', jsonb_build_array('MCQ', 'Short Answer', 'Long Answer', 'Numerical Problems')
    ),
    'practical_exam', jsonb_build_object(
      'duration', '3 hours',
      'total_marks', 30,
      'components', jsonb_build_array('Salt Analysis', 'Volumetric Analysis', 'Viva Voce')
    )
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

-- Update Maharashtra Board Class XI Physics with structured JSON syllabus
UPDATE subject_materials 
SET syllabus_json = jsonb_build_object(
  'subject_info', jsonb_build_object(
    'name', 'Physics',
    'code', 'MH-XI-PHY',
    'level', 'Class XI',
    'board', 'Maharashtra Board',
    'total_duration', '180 hours',
    'exam_pattern', 'Theory (70 marks) + Practical (30 marks)'
  ),
  'sections', jsonb_build_array(
    jsonb_build_object(
      'section_number', 1,
      'title', 'Measurements and Motion in a Plane',
      'description', 'Fundamental concepts of measurement and two-dimensional motion',
      'duration', '25 hours',
      'importance', 'high',
      'topics', jsonb_build_array(
        jsonb_build_object(
          'title', 'Physical World and Measurement',
          'description', 'Scope of physics and measurement techniques',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Physics scope and excitement',
            'Units of measurement and systems',
            'Fundamental and derived units',
            'Errors in measurement and significant figures',
            'Dimensional analysis and applications'
          )
        ),
        jsonb_build_object(
          'title', 'Motion in a Plane',
          'description', 'Vector analysis of motion in two dimensions',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Scalar and vector quantities',
            'Position and displacement vectors',
            'Velocity and acceleration vectors',
            'Projectile motion',
            'Uniform circular motion'
          )
        )
      )
    ),
    jsonb_build_object(
      'section_number', 2,
      'title', 'Laws of Motion',
      'description', 'Newton laws and their applications',
      'duration', '20 hours',
      'importance', 'high',
      'topics', jsonb_build_array(
        jsonb_build_object(
          'title', 'Newton Laws of Motion',
          'description', 'Fundamental laws governing motion',
          'importance_level', 'high',
          'subtopics', jsonb_build_array(
            'Intuitive concept of force',
            'Newton first law and inertia',
            'Newton second law and momentum',
            'Newton third law of motion',
            'Conservation of linear momentum'
          )
        ),
        jsonb_build_object(
          'title', 'Friction',
          'description', 'Types and applications of friction',
          'importance_level', 'medium',
          'subtopics', jsonb_build_array(
            'Static and kinetic friction',
            'Rolling friction',
            'Applications of friction'
          )
        )
      )
    )
  )
),
updated_at = now()
WHERE subject_id = (
  SELECT s.id 
  FROM subjects s 
  JOIN semesters sem ON s.semester_id = sem.id 
  JOIN departments d ON sem.department_id = d.id 
  JOIN universities u ON d.university_id = u.id 
  WHERE s.code = 'MH-XI-PHY' 
  AND u.short_name = 'MH-HSC'
  LIMIT 1
);

-- Create index for better performance on syllabus_json queries
CREATE INDEX IF NOT EXISTS idx_subject_materials_syllabus_json ON subject_materials USING GIN (syllabus_json);

-- Add helpful comment
COMMENT ON COLUMN subject_materials.syllabus_json IS 'Structured JSON syllabus with sections, topics, subtopics, importance levels, and metadata';