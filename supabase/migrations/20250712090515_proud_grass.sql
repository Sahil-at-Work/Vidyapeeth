/*
  # Add Video Resources Column to Subject Materials

  1. New Column
    - `video_resources` (jsonb) - Stores video content organized by chapters
    - Each chapter contains topics with video details including thumbnails and YouTube links
  
  2. Structure
    - Chapter-based organization
    - Topic-level videos with metadata
    - YouTube integration support
    - Thumbnail image support
  
  3. Sample Data
    - Added comprehensive video resources for different subjects
    - Includes realistic YouTube-style thumbnails and links
*/

-- Add video_resources column to subject_materials table
ALTER TABLE subject_materials 
ADD COLUMN video_resources jsonb DEFAULT '[]'::jsonb;

-- Add GIN index for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_subject_materials_video_resources 
ON subject_materials USING gin (video_resources);

-- Add sample video resources data
UPDATE subject_materials 
SET video_resources = '[
  {
    "chapter": "Introduction to Programming",
    "description": "Fundamental concepts of programming and software development",
    "topics": [
      {
        "title": "What is Programming?",
        "description": "Understanding the basics of programming languages and logic",
        "thumbnail": "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=zOjov-2OZ0E",
        "duration": "12:45",
        "difficulty": "beginner"
      },
      {
        "title": "Programming Languages Overview",
        "description": "Exploring different programming languages and their uses",
        "thumbnail": "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=2lVDktWK-pc",
        "duration": "18:30",
        "difficulty": "beginner"
      },
      {
        "title": "Setting Up Development Environment",
        "description": "Installing and configuring your first IDE",
        "thumbnail": "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=VqcTT4wZcpU",
        "duration": "15:20",
        "difficulty": "beginner"
      }
    ]
  },
  {
    "chapter": "Object-Oriented Programming",
    "description": "Core concepts of OOP including classes, objects, and inheritance",
    "topics": [
      {
        "title": "Classes and Objects",
        "description": "Understanding the fundamental building blocks of OOP",
        "thumbnail": "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=pTB0EiLXUC8",
        "duration": "22:15",
        "difficulty": "intermediate"
      },
      {
        "title": "Inheritance and Polymorphism",
        "description": "Advanced OOP concepts for code reusability",
        "thumbnail": "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=qqYOYIVrso0",
        "duration": "28:45",
        "difficulty": "intermediate"
      },
      {
        "title": "Encapsulation and Abstraction",
        "description": "Data hiding and interface design principles",
        "thumbnail": "https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=hxGOiiR9ZKg",
        "duration": "19:30",
        "difficulty": "intermediate"
      }
    ]
  },
  {
    "chapter": "Data Structures and Algorithms",
    "description": "Essential data structures and algorithmic thinking",
    "topics": [
      {
        "title": "Arrays and Linked Lists",
        "description": "Linear data structures and their implementations",
        "thumbnail": "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=DuDz6B4cqVc",
        "duration": "25:10",
        "difficulty": "intermediate"
      },
      {
        "title": "Trees and Graphs",
        "description": "Hierarchical and network data structures",
        "thumbnail": "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=1-l_UOFi1Xw",
        "duration": "32:20",
        "difficulty": "advanced"
      },
      {
        "title": "Sorting and Searching",
        "description": "Fundamental algorithms for data manipulation",
        "thumbnail": "https://images.pexels.com/photos/1181373/pexels-photo-1181373.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=kPRA0W1kECg",
        "duration": "27:45",
        "difficulty": "advanced"
      }
    ]
  }
]'::jsonb
WHERE subject_id IN (
  SELECT id FROM subjects WHERE code LIKE '%CS%' OR code LIKE '%IT%'
);

-- Add sample video resources for Biology subjects
UPDATE subject_materials 
SET video_resources = '[
  {
    "chapter": "Cell Biology",
    "description": "Structure and function of cells - the basic unit of life",
    "topics": [
      {
        "title": "Cell Structure and Organelles",
        "description": "Exploring the components of prokaryotic and eukaryotic cells",
        "thumbnail": "https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=URUJD5NEXC8",
        "duration": "16:30",
        "difficulty": "beginner"
      },
      {
        "title": "Cell Division: Mitosis and Meiosis",
        "description": "Understanding how cells reproduce and create genetic diversity",
        "thumbnail": "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=f-ldPgEfAHI",
        "duration": "21:15",
        "difficulty": "intermediate"
      },
      {
        "title": "Cellular Respiration",
        "description": "How cells convert glucose into ATP energy",
        "thumbnail": "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=00jbG_cfGuQ",
        "duration": "18:45",
        "difficulty": "intermediate"
      }
    ]
  },
  {
    "chapter": "Genetics and Heredity",
    "description": "Understanding inheritance patterns and genetic principles",
    "topics": [
      {
        "title": "Mendels Laws of Inheritance",
        "description": "Basic principles of genetic inheritance discovered by Gregor Mendel",
        "thumbnail": "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=Mehz7tCxjSE",
        "duration": "24:20",
        "difficulty": "intermediate"
      },
      {
        "title": "DNA Structure and Replication",
        "description": "The molecular basis of heredity and genetic information storage",
        "thumbnail": "https://images.pexels.com/photos/3938025/pexels-photo-3938025.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=8kK2zwjRV0M",
        "duration": "19:50",
        "difficulty": "advanced"
      }
    ]
  }
]'::jsonb
WHERE subject_id IN (
  SELECT id FROM subjects WHERE name ILIKE '%biology%' OR name ILIKE '%life%'
);

-- Add sample video resources for Chemistry subjects
UPDATE subject_materials 
SET video_resources = '[
  {
    "chapter": "Atomic Structure",
    "description": "Understanding the building blocks of matter",
    "topics": [
      {
        "title": "Atomic Models and Electronic Configuration",
        "description": "Evolution of atomic theory and electron arrangement",
        "thumbnail": "https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=W2Xb2GFK2yc",
        "duration": "20:30",
        "difficulty": "intermediate"
      },
      {
        "title": "Periodic Table and Trends",
        "description": "Organization of elements and periodic properties",
        "thumbnail": "https://images.pexels.com/photos/8386421/pexels-photo-8386421.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=0RRVV4Diomg",
        "duration": "17:45",
        "difficulty": "beginner"
      }
    ]
  },
  {
    "chapter": "Chemical Bonding",
    "description": "How atoms combine to form compounds",
    "topics": [
      {
        "title": "Ionic and Covalent Bonds",
        "description": "Different types of chemical bonds and their properties",
        "thumbnail": "https://images.pexels.com/photos/8386423/pexels-photo-8386423.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
        "video_url": "https://www.youtube.com/watch?v=QqjcCvzWwww",
        "duration": "23:15",
        "difficulty": "intermediate"
      }
    ]
  }
]'::jsonb
WHERE subject_id IN (
  SELECT id FROM subjects WHERE name ILIKE '%chemistry%' OR name ILIKE '%chemical%'
);

-- Add comment explaining the JSON structure
COMMENT ON COLUMN subject_materials.video_resources IS 'JSON array of video chapters with topics, thumbnails, and YouTube links for educational content';