/*
  # Update Maharashtra Board Class XI Biology Syllabus

  1. Updates
    - Update the syllabus content for Maharashtra Board Class XI Biology (MH-XI-BIO)
    - Replace existing syllabus with detailed Botany and Zoology sections
    - Maintain existing GATE questions and drive links

  2. Content Structure
    - Section I: Botany (4 units)
    - Section II: Zoology (4 units)
    - Comprehensive coverage of plant and animal biology
*/

-- Update the syllabus for Maharashtra Board Class XI Biology
UPDATE subject_materials 
SET syllabus = '# Maharashtra Board Class XI Biology Syllabus

## SECTION-I: Botany

### Unit 1: Diversity in Living World

**Diversity in Organisms**
- Introduction to diversity in living organisms
- Classification systems and taxonomic hierarchy
- Binomial nomenclature and taxonomic categories
- Concept of species and biodiversity
- Major groups of organisms and their characteristics
- Evolutionary relationships among organisms

**Kingdom Plantae**
- General characteristics of Kingdom Plantae
- Classification of plants: Algae, Bryophytes, Pteridophytes
- Gymnosperms and Angiosperms
- Economic importance of different plant groups
- Life cycles and alternation of generations
- Evolutionary trends in plant kingdom

### Unit 2: Structure and Function of Cell

**Biochemistry of Cell**
- Chemical composition of living cells
- Biomolecules: Carbohydrates, proteins, lipids, nucleic acids
- Structure and function of biomolecules
- Enzymes: structure, classification, mechanism of action
- Factors affecting enzyme activity
- Metabolic pathways and energy transformations

**Cell Division**
- Cell cycle and its regulation
- Mitosis: phases, significance, and regulation
- Meiosis: phases, significance, and genetic implications
- Comparison between mitosis and meiosis
- Cell division in plant and animal cells
- Chromosomal aberrations and their consequences

### Unit 3: Structural Organization in Plants

**Morphology of Plants**
- External morphology of flowering plants
- Root system: types, modifications, and functions
- Shoot system: stem modifications and functions
- Leaf morphology: types, venation, and modifications
- Inflorescence: types and significance
- Flower structure: parts and their functions
- Fruit and seed structure and types

### Unit 4: Plant Physiology

**Plant Water Relations and Mineral Nutrition**
- Water potential and water movement in plants
- Absorption of water by roots
- Transpiration: mechanism, factors affecting, significance
- Translocation of water and minerals
- Essential mineral elements and their functions
- Mineral deficiency symptoms
- Nitrogen fixation and nitrogen cycle

**Plant Growth and Development: Seed Dormancy**
- Concepts of growth, development, and differentiation
- Plant growth regulators: auxins, gibberellins, cytokinins
- Photoperiodism and vernalization
- Seed structure and germination
- Types of seed dormancy and breaking dormancy
- Factors affecting seed germination
- Significance of seed dormancy in plant survival

## SECTION-II: Zoology

### Unit 1: Diversity in Living World

**Kingdom Animalia**
- General characteristics of Kingdom Animalia
- Classification of animals: basis and hierarchy
- Major phyla: Porifera, Cnidaria, Platyhelminthes
- Nematoda, Annelida, Arthropoda, Mollusca
- Echinodermata and Chordata
- Evolutionary relationships and phylogeny
- Economic importance of different animal groups

### Unit 2: Structure and Function of Cell

**Organization of Cell**
- Prokaryotic and eukaryotic cell organization
- Cell membrane: structure and functions
- Cell organelles: nucleus, mitochondria, endoplasmic reticulum
- Golgi apparatus, lysosomes, ribosomes, centrosomes
- Cytoskeleton and cell inclusions
- Cell wall in plants vs. cell membrane in animals
- Transport across cell membrane

### Unit 3: Structural Organization in Animals

**Study of Animal Tissues**
- Concept of tissue organization
- Epithelial tissue: types, structure, and functions
- Connective tissue: types, structure, and functions
- Muscular tissue: types, structure, and functions
- Nervous tissue: structure and functions
- Tissue organization in different organ systems

**Study of Animal Type**
- Comparative study of representative animals
- Body organization and symmetry
- Coelom and its significance
- Digestive, circulatory, and respiratory systems
- Excretory and reproductive systems
- Nervous system and sense organs
- Adaptive features in different environments

### Unit 4: Human Physiology

**Human Nutrition**
- Components of food and their functions
- Human digestive system: anatomy and physiology
- Digestion and absorption of nutrients
- Nutritional disorders and deficiency diseases
- Balanced diet and malnutrition
- Food preservation and food safety

**Human Respiration**
- Human respiratory system: anatomy and physiology
- Mechanism of breathing and gas exchange
- Transport of gases in blood
- Regulation of respiration
- Respiratory disorders and diseases
- Effects of smoking and air pollution

**Human Skeleton and Locomotion**
- Human skeletal system: structure and functions
- Types of bones and joints
- Muscular system: types and mechanism of muscle contraction
- Disorders of muscular and skeletal systems
- Locomotion and movement
- Exercise and physical fitness

## Practical Work

### Botany Practicals
- Study of plant specimens from different groups
- Microscopic examination of plant tissues
- Study of plant morphology and anatomy
- Experiments on plant physiology
- Preparation of temporary mounts

### Zoology Practicals
- Study of animal specimens from different phyla
- Microscopic examination of animal tissues
- Study of human anatomy models
- Physiological experiments
- Dissection of representative animals

## Assessment Pattern

### Theory Examination
- Duration: 3 hours
- Total Marks: 70
- Section A: Botany (35 marks)
- Section B: Zoology (35 marks)

### Practical Examination
- Duration: 3 hours
- Total Marks: 30
- Botany Practical: 15 marks
- Zoology Practical: 15 marks

## Learning Outcomes

Upon completion of this course, students will be able to:
- Understand the diversity of life forms and their classification
- Comprehend the structure and function of cells and tissues
- Analyze plant and animal organization and physiology
- Apply biological concepts to real-life situations
- Develop scientific temper and research aptitude
- Prepare for higher studies in biological sciences

## Reference Books

1. NCERT Biology Textbook for Class XI
2. Maharashtra State Board Biology Textbook
3. Campbell Biology by Neil A. Campbell
4. Biology by Raven, Johnson, Mason, Losos, Singer
5. Objective Biology by Dinesh Publications

## Important Notes

- Regular study and revision are essential for success
- Practical work is mandatory and carries significant weightage
- Focus on understanding concepts rather than rote learning
- Relate biological concepts to everyday life experiences
- Prepare thoroughly for both theory and practical examinations',
    updated_at = now()
WHERE subject_id = (
    SELECT s.id 
    FROM subjects s 
    JOIN semesters sem ON s.semester_id = sem.id 
    JOIN departments d ON sem.department_id = d.id 
    JOIN universities u ON d.university_id = u.id 
    WHERE s.code = 'MH-XI-BIO' 
    AND u.short_name = 'MH-HSC'
    LIMIT 1
);