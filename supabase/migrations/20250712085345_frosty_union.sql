/*
  # Add Related Posts Column to Subject Materials

  1. New Column
    - `related_posts` (jsonb) - Stores related posts data in JSON format
    
  2. Sample Data
    - Add sample related posts for existing subjects
    
  3. Index
    - Add GIN index for efficient JSON queries
*/

-- Add related_posts column to subject_materials table
ALTER TABLE subject_materials 
ADD COLUMN related_posts jsonb DEFAULT '[]'::jsonb;

-- Add GIN index for efficient JSON queries on related_posts
CREATE INDEX idx_subject_materials_related_posts 
ON subject_materials USING gin (related_posts);

-- Add sample related posts data for Biology subjects
UPDATE subject_materials 
SET related_posts = '[
  {
    "title": "Cell Biology Fundamentals",
    "description": "Explore the basic unit of life and cellular processes",
    "category": "Biology",
    "difficulty": "intermediate",
    "estimated_time": "15 minutes",
    "slides": [
      {
        "title": "Cell Structure and Organization",
        "image": "https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Understanding cellular components, organelles, and their functions in maintaining life processes",
        "key_points": ["Cell membrane structure", "Nucleus and genetic material", "Mitochondria and energy production", "Endoplasmic reticulum functions"]
      },
      {
        "title": "Cell Division and Reproduction",
        "image": "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Mitosis and meiosis processes explained with detailed mechanisms and significance",
        "key_points": ["Mitosis phases", "Meiosis and genetic variation", "Cell cycle regulation", "Chromosome behavior"]
      },
      {
        "title": "Cellular Metabolism",
        "image": "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "How cells perform essential life processes including respiration and photosynthesis",
        "key_points": ["Cellular respiration", "ATP production", "Enzyme functions", "Metabolic pathways"]
      }
    ]
  },
  {
    "title": "Plant Physiology",
    "description": "How plants function, grow, and adapt to their environment",
    "category": "Botany",
    "difficulty": "advanced",
    "estimated_time": "20 minutes",
    "slides": [
      {
        "title": "Photosynthesis Process",
        "image": "https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "The process of converting light energy into chemical energy in plants",
        "key_points": ["Light reactions", "Calvin cycle", "Chloroplast structure", "Factors affecting photosynthesis"]
      },
      {
        "title": "Plant Transport Systems",
        "image": "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "How water, minerals, and nutrients move through plant tissues",
        "key_points": ["Xylem transport", "Phloem transport", "Transpiration", "Root absorption"]
      },
      {
        "title": "Plant Growth and Development",
        "image": "https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Factors affecting plant development and growth responses",
        "key_points": ["Plant hormones", "Tropisms", "Growth patterns", "Environmental factors"]
      }
    ]
  },
  {
    "title": "Human Anatomy Systems",
    "description": "Structure and function of major human body systems",
    "category": "Human Biology",
    "difficulty": "intermediate",
    "estimated_time": "25 minutes",
    "slides": [
      {
        "title": "Skeletal System",
        "image": "https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Bones, joints, and their functions in support and movement",
        "key_points": ["Bone structure", "Joint types", "Bone formation", "Calcium regulation"]
      },
      {
        "title": "Muscular System",
        "image": "https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Muscles and movement mechanisms in the human body",
        "key_points": ["Muscle types", "Contraction mechanism", "Muscle fatigue", "Exercise physiology"]
      },
      {
        "title": "Nervous System",
        "image": "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Brain, nerves, and neural pathways controlling body functions",
        "key_points": ["Neuron structure", "Nerve impulses", "Brain regions", "Reflex actions"]
      }
    ]
  }
]'::jsonb
WHERE subject_id IN (
  SELECT id FROM subjects 
  WHERE name ILIKE '%biology%' OR name ILIKE '%life%' OR name ILIKE '%science%'
);

-- Add sample related posts for Chemistry subjects
UPDATE subject_materials 
SET related_posts = '[
  {
    "title": "Chemical Bonding Concepts",
    "description": "Understanding how atoms combine to form molecules",
    "category": "Physical Chemistry",
    "difficulty": "intermediate",
    "estimated_time": "18 minutes",
    "slides": [
      {
        "title": "Ionic Bonding",
        "image": "https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Formation of ionic compounds through electron transfer",
        "key_points": ["Electron transfer", "Lattice energy", "Ionic properties", "Crystal structures"]
      },
      {
        "title": "Covalent Bonding",
        "image": "https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Sharing of electrons between atoms to form molecules",
        "key_points": ["Electron sharing", "Bond polarity", "Molecular geometry", "Hybridization"]
      },
      {
        "title": "Metallic Bonding",
        "image": "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Understanding metallic properties and electron sea model",
        "key_points": ["Electron sea", "Metallic properties", "Alloys", "Conductivity"]
      }
    ]
  },
  {
    "title": "Organic Chemistry Basics",
    "description": "Introduction to carbon compounds and their reactions",
    "category": "Organic Chemistry",
    "difficulty": "advanced",
    "estimated_time": "22 minutes",
    "slides": [
      {
        "title": "Hydrocarbons",
        "image": "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Alkanes, alkenes, and alkynes - structure and properties",
        "key_points": ["Saturated hydrocarbons", "Unsaturated hydrocarbons", "Isomerism", "Nomenclature"]
      },
      {
        "title": "Functional Groups",
        "image": "https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Common functional groups and their characteristic reactions",
        "key_points": ["Alcohols", "Aldehydes and ketones", "Carboxylic acids", "Esters"]
      },
      {
        "title": "Reaction Mechanisms",
        "image": "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Understanding how organic reactions proceed step by step",
        "key_points": ["Nucleophilic substitution", "Elimination reactions", "Addition reactions", "Rearrangements"]
      }
    ]
  }
]'::jsonb
WHERE subject_id IN (
  SELECT id FROM subjects 
  WHERE name ILIKE '%chemistry%' OR name ILIKE '%chemical%'
);

-- Add sample related posts for Physics subjects
UPDATE subject_materials 
SET related_posts = '[
  {
    "title": "Mechanics Fundamentals",
    "description": "Motion, forces, and energy in physical systems",
    "category": "Classical Physics",
    "difficulty": "intermediate",
    "estimated_time": "20 minutes",
    "slides": [
      {
        "title": "Laws of Motion",
        "image": "https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Newton''s three laws and their applications in real-world scenarios",
        "key_points": ["First law - Inertia", "Second law - F=ma", "Third law - Action-reaction", "Applications"]
      },
      {
        "title": "Energy and Work",
        "image": "https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Understanding energy transformations and conservation principles",
        "key_points": ["Kinetic energy", "Potential energy", "Work-energy theorem", "Conservation laws"]
      },
      {
        "title": "Circular Motion",
        "image": "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Motion in circular paths and centripetal forces",
        "key_points": ["Centripetal acceleration", "Banking of roads", "Satellites", "Vertical circles"]
      }
    ]
  }
]'::jsonb
WHERE subject_id IN (
  SELECT id FROM subjects 
  WHERE name ILIKE '%physics%' OR name ILIKE '%physical%'
);

-- Add sample related posts for Mathematics subjects
UPDATE subject_materials 
SET related_posts = '[
  {
    "title": "Calculus Applications",
    "description": "Real-world applications of differential and integral calculus",
    "category": "Applied Mathematics",
    "difficulty": "advanced",
    "estimated_time": "25 minutes",
    "slides": [
      {
        "title": "Derivatives in Physics",
        "image": "https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "How derivatives describe rates of change in physical phenomena",
        "key_points": ["Velocity and acceleration", "Optimization problems", "Related rates", "Physics applications"]
      },
      {
        "title": "Integration Techniques",
        "image": "https://images.pexels.com/photos/6238302/pexels-photo-6238302.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Various methods for solving complex integrals",
        "key_points": ["Substitution method", "Integration by parts", "Partial fractions", "Trigonometric integrals"]
      },
      {
        "title": "Differential Equations",
        "image": "https://images.pexels.com/photos/6238300/pexels-photo-6238300.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
        "description": "Solving equations involving derivatives and their applications",
        "key_points": ["First-order equations", "Second-order equations", "Applications in science", "Numerical methods"]
      }
    ]
  }
]'::jsonb
WHERE subject_id IN (
  SELECT id FROM subjects 
  WHERE name ILIKE '%math%' OR name ILIKE '%calculus%' OR name ILIKE '%algebra%'
);