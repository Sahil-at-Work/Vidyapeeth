/*
  # Update DPP Materials to Chapter-wise Structure

  1. Database Changes
    - Update existing DPP materials to use chapter-wise structure
    - New JSON format: [{"chapter": "Chapter Name", "dpps": [{"title": "DPP Title", "link": "URL"}]}]
    - Update sample data for MH-HSC Class XI Chemistry

  2. Structure
    - Organized by chapters for better navigation
    - Multiple DPPs per chapter
    - Maintains existing functionality
*/

-- Update the DPP materials structure for MH-HSC Class XI Chemistry to be chapter-wise
UPDATE subject_materials 
SET dpp_materials = jsonb_build_array(
  jsonb_build_object(
    'chapter', 'Chapter 1: Some Basic Concepts of Chemistry',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-01: Matter and Measurement',
        'link', 'https://drive.google.com/file/d/sample-dpp-01-matter-measurement/view'
      ),
      jsonb_build_object(
        'title', 'DPP-02: Atomic and Molecular Masses',
        'link', 'https://drive.google.com/file/d/sample-dpp-02-atomic-molecular-masses/view'
      ),
      jsonb_build_object(
        'title', 'DPP-03: Mole Concept and Stoichiometry',
        'link', 'https://drive.google.com/file/d/sample-dpp-03-mole-concept/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 2: Structure of Atom',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-04: Discovery of Subatomic Particles',
        'link', 'https://drive.google.com/file/d/sample-dpp-04-subatomic-particles/view'
      ),
      jsonb_build_object(
        'title', 'DPP-05: Atomic Models',
        'link', 'https://drive.google.com/file/d/sample-dpp-05-atomic-models/view'
      ),
      jsonb_build_object(
        'title', 'DPP-06: Quantum Numbers and Electronic Configuration',
        'link', 'https://drive.google.com/file/d/sample-dpp-06-quantum-numbers/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 3: Classification of Elements and Periodicity',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-07: Modern Periodic Law',
        'link', 'https://drive.google.com/file/d/sample-dpp-07-periodic-law/view'
      ),
      jsonb_build_object(
        'title', 'DPP-08: Periodic Trends',
        'link', 'https://drive.google.com/file/d/sample-dpp-08-periodic-trends/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 4: Chemical Bonding and Molecular Structure',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-09: Ionic and Covalent Bonding',
        'link', 'https://drive.google.com/file/d/sample-dpp-09-ionic-covalent/view'
      ),
      jsonb_build_object(
        'title', 'DPP-10: VSEPR Theory and Hybridization',
        'link', 'https://drive.google.com/file/d/sample-dpp-10-vsepr-hybridization/view'
      ),
      jsonb_build_object(
        'title', 'DPP-11: Molecular Orbital Theory',
        'link', 'https://drive.google.com/file/d/sample-dpp-11-molecular-orbital/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 5: States of Matter',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-12: Gaseous State and Gas Laws',
        'link', 'https://drive.google.com/file/d/sample-dpp-12-gas-laws/view'
      ),
      jsonb_build_object(
        'title', 'DPP-13: Kinetic Theory of Gases',
        'link', 'https://drive.google.com/file/d/sample-dpp-13-kinetic-theory/view'
      ),
      jsonb_build_object(
        'title', 'DPP-14: Liquid State Properties',
        'link', 'https://drive.google.com/file/d/sample-dpp-14-liquid-state/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 6: Thermodynamics',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-15: First Law of Thermodynamics',
        'link', 'https://drive.google.com/file/d/sample-dpp-15-first-law/view'
      ),
      jsonb_build_object(
        'title', 'DPP-16: Enthalpy and Hess Law',
        'link', 'https://drive.google.com/file/d/sample-dpp-16-enthalpy-hess/view'
      ),
      jsonb_build_object(
        'title', 'DPP-17: Second Law and Entropy',
        'link', 'https://drive.google.com/file/d/sample-dpp-17-entropy/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 7: Equilibrium',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-18: Chemical Equilibrium',
        'link', 'https://drive.google.com/file/d/sample-dpp-18-chemical-equilibrium/view'
      ),
      jsonb_build_object(
        'title', 'DPP-19: Ionic Equilibrium and pH',
        'link', 'https://drive.google.com/file/d/sample-dpp-19-ionic-equilibrium/view'
      ),
      jsonb_build_object(
        'title', 'DPP-20: Buffer Solutions',
        'link', 'https://drive.google.com/file/d/sample-dpp-20-buffer-solutions/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 8: Redox Reactions',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-21: Oxidation and Reduction',
        'link', 'https://drive.google.com/file/d/sample-dpp-21-oxidation-reduction/view'
      ),
      jsonb_build_object(
        'title', 'DPP-22: Balancing Redox Equations',
        'link', 'https://drive.google.com/file/d/sample-dpp-22-balancing-redox/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 9: Hydrogen',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-23: Properties of Hydrogen',
        'link', 'https://drive.google.com/file/d/sample-dpp-23-hydrogen-properties/view'
      ),
      jsonb_build_object(
        'title', 'DPP-24: Water and Hydrogen Peroxide',
        'link', 'https://drive.google.com/file/d/sample-dpp-24-water-h2o2/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 10: s-Block Elements',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-25: Alkali Metals',
        'link', 'https://drive.google.com/file/d/sample-dpp-25-alkali-metals/view'
      ),
      jsonb_build_object(
        'title', 'DPP-26: Alkaline Earth Metals',
        'link', 'https://drive.google.com/file/d/sample-dpp-26-alkaline-earth/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 11: p-Block Elements',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-27: Group 13 Elements',
        'link', 'https://drive.google.com/file/d/sample-dpp-27-group-13/view'
      ),
      jsonb_build_object(
        'title', 'DPP-28: Group 14 Elements',
        'link', 'https://drive.google.com/file/d/sample-dpp-28-group-14/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 12: Organic Chemistry - Basic Principles',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-29: IUPAC Nomenclature',
        'link', 'https://drive.google.com/file/d/sample-dpp-29-nomenclature/view'
      ),
      jsonb_build_object(
        'title', 'DPP-30: Isomerism',
        'link', 'https://drive.google.com/file/d/sample-dpp-30-isomerism/view'
      ),
      jsonb_build_object(
        'title', 'DPP-31: Reaction Mechanisms',
        'link', 'https://drive.google.com/file/d/sample-dpp-31-mechanisms/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 13: Hydrocarbons',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-32: Alkanes and Cycloalkanes',
        'link', 'https://drive.google.com/file/d/sample-dpp-32-alkanes/view'
      ),
      jsonb_build_object(
        'title', 'DPP-33: Alkenes and Alkynes',
        'link', 'https://drive.google.com/file/d/sample-dpp-33-alkenes-alkynes/view'
      ),
      jsonb_build_object(
        'title', 'DPP-34: Aromatic Hydrocarbons',
        'link', 'https://drive.google.com/file/d/sample-dpp-34-aromatic/view'
      )
    )
  ),
  jsonb_build_object(
    'chapter', 'Chapter 14: Environmental Chemistry',
    'dpps', jsonb_build_array(
      jsonb_build_object(
        'title', 'DPP-35: Environmental Pollution',
        'link', 'https://drive.google.com/file/d/sample-dpp-35-pollution/view'
      ),
      jsonb_build_object(
        'title', 'DPP-36: Green Chemistry',
        'link', 'https://drive.google.com/file/d/sample-dpp-36-green-chemistry/view'
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
  WHERE s.code = 'MH-XI-CHE' 
  AND u.short_name = 'MH-HSC'
  LIMIT 1
);

-- Update comment to reflect new structure
COMMENT ON COLUMN subject_materials.dpp_materials IS 'JSON array of chapters with DPPs: [{"chapter": "Chapter Name", "dpps": [{"title": "DPP Title", "link": "URL"}]}]';