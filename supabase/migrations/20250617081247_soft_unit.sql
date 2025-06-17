/*
  # Add Electronics and Telecommunication Department

  1. New Department
    - Electronics and Telecommunication (ENTC) at Vishwakarma Institute
    - 8 semesters (1st, 2nd, 7th, 8th without subjects initially)
    
  2. Subjects by Semester
    - 3rd Semester: Data Science, Internet of Things, Object Oriented Programming, Database Management System
    - 4th Semester: Data Structures, Digital Systems, Data Communications, Industrial Engineering
    - 5th Semester: Web Technology, Advanced Algorithms, Operating System, Computer Networks
    - 6th Semester: Signal Processing, Digital Design, Computer Vision, Embedded Systems
    
  3. Subject Materials
    - Sample syllabus, drive links, and GATE questions for each subject
*/

-- First, get the Vishwakarma Institute ID
DO $$
DECLARE
  vishwakarma_id uuid;
  entc_dept_id uuid;
  sem_3_id uuid;
  sem_4_id uuid;
  sem_5_id uuid;
  sem_6_id uuid;
  subject_id uuid;
BEGIN
  -- Get Vishwakarma Institute ID (assuming it exists)
  SELECT id INTO vishwakarma_id 
  FROM universities 
  WHERE name ILIKE '%vishwakarma%' 
  LIMIT 1;
  
  -- If Vishwakarma Institute doesn't exist, create it
  IF vishwakarma_id IS NULL THEN
    INSERT INTO universities (name, short_name, location)
    VALUES ('Vishwakarma Institute of Technology', 'VIT', 'Pune, Maharashtra')
    RETURNING id INTO vishwakarma_id;
  END IF;
  
  -- Create Electronics and Telecommunication Department
  INSERT INTO departments (name, code, university_id)
  VALUES ('Electronics and Telecommunication', 'ENTC', vishwakarma_id)
  RETURNING id INTO entc_dept_id;
  
  -- Create all 8 semesters
  FOR i IN 1..8 LOOP
    INSERT INTO semesters (number, department_id)
    VALUES (i, entc_dept_id);
  END LOOP;
  
  -- Get semester IDs for subjects
  SELECT id INTO sem_3_id FROM semesters WHERE number = 3 AND department_id = entc_dept_id;
  SELECT id INTO sem_4_id FROM semesters WHERE number = 4 AND department_id = entc_dept_id;
  SELECT id INTO sem_5_id FROM semesters WHERE number = 5 AND department_id = entc_dept_id;
  SELECT id INTO sem_6_id FROM semesters WHERE number = 6 AND department_id = entc_dept_id;
  
  -- 3rd Semester Subjects
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Data Science', 'ENTC301', 4, sem_3_id),
    ('Internet of Things', 'ENTC302', 4, sem_3_id),
    ('Object Oriented Programming', 'ENTC303', 4, sem_3_id),
    ('Database Management System', 'ENTC304', 4, sem_3_id);
  
  -- 4th Semester Subjects
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Data Structures', 'ENTC401', 4, sem_4_id),
    ('Digital Systems', 'ENTC402', 4, sem_4_id),
    ('Data Communications', 'ENTC403', 4, sem_4_id),
    ('Industrial Engineering', 'ENTC404', 4, sem_4_id);
  
  -- 5th Semester Subjects
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Web Technology', 'ENTC501', 4, sem_5_id),
    ('Advanced Algorithms', 'ENTC502', 4, sem_5_id),
    ('Operating System', 'ENTC503', 4, sem_5_id),
    ('Computer Networks', 'ENTC504', 4, sem_5_id);
  
  -- 6th Semester Subjects
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Signal Processing', 'ENTC601', 4, sem_6_id),
    ('Digital Design', 'ENTC602', 4, sem_6_id),
    ('Computer Vision', 'ENTC603', 4, sem_6_id),
    ('Embedded Systems', 'ENTC604', 4, sem_6_id);
  
  -- Add subject materials for 3rd semester subjects
  -- Data Science
  SELECT id INTO subject_id FROM subjects WHERE code = 'ENTC301';
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    'Data Science fundamentals including statistical analysis, machine learning algorithms, data visualization, Python programming, pandas, numpy, scikit-learn, data preprocessing, feature engineering, model evaluation, and big data concepts.',
    'https://drive.google.com/drive/folders/data-science-entc-materials',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'Which of the following is NOT a supervised learning algorithm?',
        'options', jsonb_build_array('Linear Regression', 'K-Means Clustering', 'Decision Trees', 'Support Vector Machine'),
        'correct_answer', 1,
        'explanation', 'K-Means Clustering is an unsupervised learning algorithm used for clustering data points.',
        'difficulty', 'medium',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'What is the primary purpose of cross-validation in machine learning?',
        'options', jsonb_build_array('Data cleaning', 'Model evaluation', 'Feature selection', 'Data visualization'),
        'correct_answer', 1,
        'explanation', 'Cross-validation is used to evaluate model performance and prevent overfitting.',
        'difficulty', 'easy',
        'year', 2022
      ),
      jsonb_build_object(
        'question', 'In pandas, which function is used to read CSV files?',
        'options', jsonb_build_array('read_csv()', 'load_csv()', 'import_csv()', 'get_csv()'),
        'correct_answer', 0,
        'explanation', 'pandas.read_csv() is the standard function to read CSV files into a DataFrame.',
        'difficulty', 'easy',
        'year', 2023
      )
    )
  );
  
  -- Internet of Things
  SELECT id INTO subject_id FROM subjects WHERE code = 'ENTC302';
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    'IoT architecture, sensors and actuators, communication protocols (WiFi, Bluetooth, Zigbee), microcontrollers (Arduino, Raspberry Pi), cloud platforms, data analytics, security in IoT, smart home applications, industrial IoT.',
    'https://drive.google.com/drive/folders/iot-entc-materials',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'Which protocol is commonly used for low-power, short-range IoT communication?',
        'options', jsonb_build_array('HTTP', 'Zigbee', 'FTP', 'SMTP'),
        'correct_answer', 1,
        'explanation', 'Zigbee is designed for low-power, low-data-rate applications in IoT networks.',
        'difficulty', 'medium',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'What does MQTT stand for in IoT context?',
        'options', jsonb_build_array('Message Queue Telemetry Transport', 'Multiple Query Transfer Tool', 'Machine Quality Test Terminal', 'Mobile Quick Transfer Technology'),
        'correct_answer', 0,
        'explanation', 'MQTT (Message Queue Telemetry Transport) is a lightweight messaging protocol for IoT.',
        'difficulty', 'hard',
        'year', 2022
      )
    )
  );
  
  -- Object Oriented Programming
  SELECT id INTO subject_id FROM subjects WHERE code = 'ENTC303';
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    'OOP concepts: classes, objects, inheritance, polymorphism, encapsulation, abstraction. Java/C++ programming, constructors, destructors, method overloading, operator overloading, exception handling, file handling.',
    'https://drive.google.com/drive/folders/oop-entc-materials',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'Which OOP principle allows a class to inherit properties from another class?',
        'options', jsonb_build_array('Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'),
        'correct_answer', 1,
        'explanation', 'Inheritance allows a derived class to inherit properties and methods from a base class.',
        'difficulty', 'easy',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'What is method overloading?',
        'options', jsonb_build_array('Same method name with different parameters', 'Different method names with same parameters', 'Inheriting methods from parent class', 'Hiding implementation details'),
        'correct_answer', 0,
        'explanation', 'Method overloading allows multiple methods with the same name but different parameter lists.',
        'difficulty', 'medium',
        'year', 2022
      )
    )
  );
  
  -- Database Management System
  SELECT id INTO subject_id FROM subjects WHERE code = 'ENTC304';
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    'Database concepts, ER modeling, relational model, SQL queries, normalization, transactions, concurrency control, indexing, query optimization, NoSQL databases, database security.',
    'https://drive.google.com/drive/folders/dbms-entc-materials',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'Which normal form eliminates transitive dependencies?',
        'options', jsonb_build_array('1NF', '2NF', '3NF', 'BCNF'),
        'correct_answer', 2,
        'explanation', 'Third Normal Form (3NF) eliminates transitive dependencies in database tables.',
        'difficulty', 'medium',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'What does ACID stand for in database transactions?',
        'options', jsonb_build_array('Atomicity, Consistency, Isolation, Durability', 'Access, Control, Integration, Data', 'Automatic, Concurrent, Independent, Distributed', 'Analysis, Computation, Implementation, Design'),
        'correct_answer', 0,
        'explanation', 'ACID properties ensure reliable database transactions: Atomicity, Consistency, Isolation, Durability.',
        'difficulty', 'hard',
        'year', 2022
      )
    )
  );
  
  -- Add materials for 4th semester subjects
  -- Data Structures
  SELECT id INTO subject_id FROM subjects WHERE code = 'ENTC401';
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    'Arrays, linked lists, stacks, queues, trees, binary search trees, heaps, graphs, hashing, sorting algorithms, searching algorithms, time and space complexity analysis.',
    'https://drive.google.com/drive/folders/data-structures-entc-materials',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'What is the time complexity of binary search?',
        'options', jsonb_build_array('O(n)', 'O(log n)', 'O(n²)', 'O(1)'),
        'correct_answer', 1,
        'explanation', 'Binary search has O(log n) time complexity as it divides the search space in half each iteration.',
        'difficulty', 'medium',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'Which data structure follows LIFO principle?',
        'options', jsonb_build_array('Queue', 'Stack', 'Array', 'Linked List'),
        'correct_answer', 1,
        'explanation', 'Stack follows Last In First Out (LIFO) principle.',
        'difficulty', 'easy',
        'year', 2022
      )
    )
  );
  
  -- Digital Systems
  SELECT id INTO subject_id FROM subjects WHERE code = 'ENTC402';
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    'Number systems, Boolean algebra, logic gates, combinational circuits, sequential circuits, flip-flops, counters, registers, memory systems, programmable logic devices.',
    'https://drive.google.com/drive/folders/digital-systems-entc-materials',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'How many input combinations are possible for a 3-input AND gate?',
        'options', jsonb_build_array('6', '8', '9', '12'),
        'correct_answer', 1,
        'explanation', 'A 3-input gate has 2³ = 8 possible input combinations.',
        'difficulty', 'easy',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'Which flip-flop is known as a toggle flip-flop?',
        'options', jsonb_build_array('SR flip-flop', 'D flip-flop', 'JK flip-flop', 'T flip-flop'),
        'correct_answer', 3,
        'explanation', 'T (Toggle) flip-flop changes its output state on each clock pulse when T=1.',
        'difficulty', 'medium',
        'year', 2022
      )
    )
  );
  
  -- Add materials for remaining subjects (5th and 6th semester)
  -- Web Technology
  SELECT id INTO subject_id FROM subjects WHERE code = 'ENTC501';
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    'HTML, CSS, JavaScript, responsive design, web frameworks (React, Angular), server-side programming, databases, web services, REST APIs, web security, performance optimization.',
    'https://drive.google.com/drive/folders/web-technology-entc-materials',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'Which HTTP method is used to retrieve data from a server?',
        'options', jsonb_build_array('POST', 'GET', 'PUT', 'DELETE'),
        'correct_answer', 1,
        'explanation', 'GET method is used to retrieve data from a server without modifying it.',
        'difficulty', 'easy',
        'year', 2023
      )
    )
  );
  
  -- Signal Processing
  SELECT id INTO subject_id FROM subjects WHERE code = 'ENTC601';
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    'Discrete-time signals, Z-transform, DFT, FFT, digital filters, FIR and IIR filters, filter design, signal analysis, spectral analysis, applications in communication systems.',
    'https://drive.google.com/drive/folders/signal-processing-entc-materials',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'What does FFT stand for?',
        'options', jsonb_build_array('Fast Fourier Transform', 'Finite Fourier Transform', 'Forward Fourier Transform', 'Frequency Fourier Transform'),
        'correct_answer', 0,
        'explanation', 'FFT stands for Fast Fourier Transform, an efficient algorithm to compute DFT.',
        'difficulty', 'easy',
        'year', 2023
      )
    )
  );
  
END $$;