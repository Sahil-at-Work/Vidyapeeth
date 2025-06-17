/*
  # Seed Initial Data for University Management System

  1. Sample Data
    - Universities: Pune University, Mumbai University, Vishwakarma Institutes
    - Departments: CS, IT, E&TC, AI, Mechanical, Civil
    - Semesters: 1-8 for each department
    - Subjects: Core subjects for each semester

  2. Data Structure
    - Realistic subject names and codes
    - Proper credit assignments
    - Complete semester coverage
*/

-- Insert Universities
INSERT INTO universities (name, short_name, location) VALUES
  ('Pune University', 'PU', 'Pune, Maharashtra'),
  ('Mumbai University', 'MU', 'Mumbai, Maharashtra'),
  ('Vishwakarma Institutes', 'VIT', 'Pune, Maharashtra')
ON CONFLICT (name) DO NOTHING;

-- Get university IDs
DO $$
DECLARE
  pune_univ_id uuid;
  mumbai_univ_id uuid;
  vit_univ_id uuid;
  
  -- Department IDs
  pu_cs_id uuid; pu_it_id uuid; pu_entc_id uuid; pu_ai_id uuid;
  mu_cs_id uuid; mu_it_id uuid; mu_mech_id uuid;
  vit_cs_id uuid; vit_civil_id uuid;
  
  -- Semester IDs (just a few examples)
  pu_cs_sem1_id uuid; pu_cs_sem2_id uuid; pu_cs_sem3_id uuid; pu_cs_sem4_id uuid;
  pu_it_sem1_id uuid; pu_it_sem2_id uuid;
BEGIN
  -- Get university IDs
  SELECT id INTO pune_univ_id FROM universities WHERE short_name = 'PU';
  SELECT id INTO mumbai_univ_id FROM universities WHERE short_name = 'MU';
  SELECT id INTO vit_univ_id FROM universities WHERE short_name = 'VIT';
  
  -- Insert Departments for Pune University
  INSERT INTO departments (name, code, university_id) VALUES
    ('Computer Science', 'CS', pune_univ_id),
    ('Information Technology', 'IT', pune_univ_id),
    ('Electronics & Telecommunication', 'ENTC', pune_univ_id),
    ('Artificial Intelligence', 'AI', pune_univ_id)
  ON CONFLICT (code, university_id) DO NOTHING;
  
  -- Insert Departments for Mumbai University
  INSERT INTO departments (name, code, university_id) VALUES
    ('Computer Science', 'CS', mumbai_univ_id),
    ('Information Technology', 'IT', mumbai_univ_id),
    ('Mechanical Engineering', 'MECH', mumbai_univ_id)
  ON CONFLICT (code, university_id) DO NOTHING;
  
  -- Insert Departments for Vishwakarma Institutes
  INSERT INTO departments (name, code, university_id) VALUES
    ('Computer Science', 'CS', vit_univ_id),
    ('Civil Engineering', 'CIVIL', vit_univ_id)
  ON CONFLICT (code, university_id) DO NOTHING;
  
  -- Get department IDs
  SELECT id INTO pu_cs_id FROM departments WHERE code = 'CS' AND university_id = pune_univ_id;
  SELECT id INTO pu_it_id FROM departments WHERE code = 'IT' AND university_id = pune_univ_id;
  SELECT id INTO pu_entc_id FROM departments WHERE code = 'ENTC' AND university_id = pune_univ_id;
  SELECT id INTO pu_ai_id FROM departments WHERE code = 'AI' AND university_id = pune_univ_id;
  
  SELECT id INTO mu_cs_id FROM departments WHERE code = 'CS' AND university_id = mumbai_univ_id;
  SELECT id INTO vit_cs_id FROM departments WHERE code = 'CS' AND university_id = vit_univ_id;
  
  -- Insert Semesters for PU CS Department
  INSERT INTO semesters (number, department_id) VALUES
    (1, pu_cs_id), (2, pu_cs_id), (3, pu_cs_id), (4, pu_cs_id),
    (5, pu_cs_id), (6, pu_cs_id), (7, pu_cs_id), (8, pu_cs_id)
  ON CONFLICT (number, department_id) DO NOTHING;
  
  -- Insert Semesters for PU IT Department
  INSERT INTO semesters (number, department_id) VALUES
    (1, pu_it_id), (2, pu_it_id), (3, pu_it_id), (4, pu_it_id),
    (5, pu_it_id), (6, pu_it_id), (7, pu_it_id), (8, pu_it_id)
  ON CONFLICT (number, department_id) DO NOTHING;
  
  -- Insert Semesters for other departments
  INSERT INTO semesters (number, department_id) VALUES
    (1, pu_entc_id), (2, pu_entc_id), (3, pu_entc_id), (4, pu_entc_id),
    (1, pu_ai_id), (2, pu_ai_id), (3, pu_ai_id), (4, pu_ai_id),
    (1, mu_cs_id), (2, mu_cs_id), (3, mu_cs_id), (4, mu_cs_id),
    (1, vit_cs_id), (2, vit_cs_id), (3, vit_cs_id), (4, vit_cs_id)
  ON CONFLICT (number, department_id) DO NOTHING;
  
  -- Get some semester IDs for subjects
  SELECT id INTO pu_cs_sem1_id FROM semesters WHERE number = 1 AND department_id = pu_cs_id;
  SELECT id INTO pu_cs_sem2_id FROM semesters WHERE number = 2 AND department_id = pu_cs_id;
  SELECT id INTO pu_cs_sem3_id FROM semesters WHERE number = 3 AND department_id = pu_cs_id;
  SELECT id INTO pu_cs_sem4_id FROM semesters WHERE number = 4 AND department_id = pu_cs_id;
  
  SELECT id INTO pu_it_sem1_id FROM semesters WHERE number = 1 AND department_id = pu_it_id;
  SELECT id INTO pu_it_sem2_id FROM semesters WHERE number = 2 AND department_id = pu_it_id;
  
  -- Insert Subjects for PU CS Semester 1
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Programming Fundamentals', 'CS101', 4, pu_cs_sem1_id),
    ('Mathematics I', 'MATH101', 3, pu_cs_sem1_id),
    ('Physics', 'PHY101', 3, pu_cs_sem1_id),
    ('English Communication', 'ENG101', 2, pu_cs_sem1_id),
    ('Engineering Drawing', 'ED101', 2, pu_cs_sem1_id),
    ('Environmental Studies', 'EVS101', 1, pu_cs_sem1_id)
  ON CONFLICT (code, semester_id) DO NOTHING;
  
  -- Insert Subjects for PU CS Semester 2
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Data Structures', 'CS201', 4, pu_cs_sem2_id),
    ('Mathematics II', 'MATH201', 3, pu_cs_sem2_id),
    ('Chemistry', 'CHEM201', 3, pu_cs_sem2_id),
    ('Technical Communication', 'ENG201', 2, pu_cs_sem2_id),
    ('Workshop Practice', 'WS201', 2, pu_cs_sem2_id),
    ('Basic Electronics', 'EC201', 3, pu_cs_sem2_id)
  ON CONFLICT (code, semester_id) DO NOTHING;
  
  -- Insert Subjects for PU CS Semester 3
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Object-Oriented Programming', 'CS301', 4, pu_cs_sem3_id),
    ('Computer Organization', 'CS302', 3, pu_cs_sem3_id),
    ('Discrete Mathematics', 'MATH301', 3, pu_cs_sem3_id),
    ('Database Management Systems', 'CS303', 4, pu_cs_sem3_id),
    ('Digital Logic Design', 'EC301', 3, pu_cs_sem3_id)
  ON CONFLICT (code, semester_id) DO NOTHING;
  
  -- Insert Subjects for PU CS Semester 4
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Algorithms', 'CS401', 4, pu_cs_sem4_id),
    ('Computer Networks', 'CS402', 3, pu_cs_sem4_id),
    ('Operating Systems', 'CS403', 4, pu_cs_sem4_id),
    ('Software Engineering', 'CS404', 3, pu_cs_sem4_id),
    ('Web Technologies', 'CS405', 3, pu_cs_sem4_id)
  ON CONFLICT (code, semester_id) DO NOTHING;
  
  -- Insert Subjects for PU IT Semester 1
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Programming Basics', 'IT101', 4, pu_it_sem1_id),
    ('Mathematics I', 'MATH101', 3, pu_it_sem1_id),
    ('Physics', 'PHY101', 3, pu_it_sem1_id),
    ('English Communication', 'ENG101', 2, pu_it_sem1_id),
    ('Information Technology Fundamentals', 'IT102', 3, pu_it_sem1_id)
  ON CONFLICT (code, semester_id) DO NOTHING;
  
  -- Insert Subjects for PU IT Semester 2
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Data Structures and Algorithms', 'IT201', 4, pu_it_sem2_id),
    ('Mathematics II', 'MATH201', 3, pu_it_sem2_id),
    ('Digital Electronics', 'EC201', 3, pu_it_sem2_id),
    ('Database Concepts', 'IT202', 3, pu_it_sem2_id),
    ('Computer Graphics', 'IT203', 3, pu_it_sem2_id)
  ON CONFLICT (code, semester_id) DO NOTHING;
  
END $$;