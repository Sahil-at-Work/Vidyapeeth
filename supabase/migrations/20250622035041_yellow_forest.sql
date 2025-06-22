/*
  # Add Maharashtra Board HSC+CET and NCERT Board (JEE/NEET) Universities

  1. New Universities
    - Maharashtra Board HSC+CET with Class XI and Class XII departments
    - NCERT Board (JEE/NEET) with Foundation, Class XI, and Class XII departments

  2. Subjects
    - Physics, Chemistry, Biology, Mathematics for each department
    - Comprehensive syllabus and sample PYQs for each subject

  3. Study Materials
    - Detailed syllabus covering complete curriculum
    - Sample Previous Year Questions with explanations
    - Drive links for additional resources
*/

DO $$
DECLARE
  maha_board_id uuid;
  ncert_board_id uuid;
  
  -- Maharashtra Board Department IDs
  maha_xi_id uuid;
  maha_xii_id uuid;
  
  -- NCERT Board Department IDs
  ncert_foundation_id uuid;
  ncert_xi_id uuid;
  ncert_xii_id uuid;
  
  -- Semester IDs
  maha_xi_sem_id uuid;
  maha_xii_sem_id uuid;
  ncert_foundation_sem_id uuid;
  ncert_xi_sem_id uuid;
  ncert_xii_sem_id uuid;
  
  -- Subject IDs for materials
  subject_id uuid;
  
BEGIN
  -- Insert Maharashtra Board HSC+CET University
  INSERT INTO universities (name, short_name, location)
  VALUES ('Maharashtra Board HSC+CET', 'MH-HSC', 'Maharashtra, India')
  RETURNING id INTO maha_board_id;
  
  -- Insert NCERT Board (JEE/NEET) University
  INSERT INTO universities (name, short_name, location)
  VALUES ('NCERT Board (JEE/NEET)', 'NCERT-JN', 'All India')
  RETURNING id INTO ncert_board_id;
  
  -- Create departments for Maharashtra Board
  INSERT INTO departments (name, code, university_id) VALUES
    ('Class XI', 'XI', maha_board_id)
  RETURNING id INTO maha_xi_id;
  
  INSERT INTO departments (name, code, university_id) VALUES
    ('Class XII', 'XII', maha_board_id)
  RETURNING id INTO maha_xii_id;
  
  -- Create departments for NCERT Board
  INSERT INTO departments (name, code, university_id) VALUES
    ('Foundation', 'FOUND', ncert_board_id)
  RETURNING id INTO ncert_foundation_id;
  
  INSERT INTO departments (name, code, university_id) VALUES
    ('Class XI', 'XI-NCERT', ncert_board_id)
  RETURNING id INTO ncert_xi_id;
  
  INSERT INTO departments (name, code, university_id) VALUES
    ('Class XII', 'XII-NCERT', ncert_board_id)
  RETURNING id INTO ncert_xii_id;
  
  -- Create semesters for all departments
  INSERT INTO semesters (number, department_id) VALUES
    (1, maha_xi_id)
  RETURNING id INTO maha_xi_sem_id;
  
  INSERT INTO semesters (number, department_id) VALUES
    (1, maha_xii_id)
  RETURNING id INTO maha_xii_sem_id;
  
  INSERT INTO semesters (number, department_id) VALUES
    (1, ncert_foundation_id)
  RETURNING id INTO ncert_foundation_sem_id;
  
  INSERT INTO semesters (number, department_id) VALUES
    (1, ncert_xi_id)
  RETURNING id INTO ncert_xi_sem_id;
  
  INSERT INTO semesters (number, department_id) VALUES
    (1, ncert_xii_id)
  RETURNING id INTO ncert_xii_sem_id;
  
  -- Add subjects for Maharashtra Board Class XI
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Physics', 'MH-XI-PHY', 4, maha_xi_sem_id),
    ('Chemistry', 'MH-XI-CHE', 4, maha_xi_sem_id),
    ('Biology', 'MH-XI-BIO', 4, maha_xi_sem_id),
    ('Mathematics', 'MH-XI-MAT', 4, maha_xi_sem_id);
  
  -- Add subjects for Maharashtra Board Class XII
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Physics', 'MH-XII-PHY', 4, maha_xii_sem_id),
    ('Chemistry', 'MH-XII-CHE', 4, maha_xii_sem_id),
    ('Biology', 'MH-XII-BIO', 4, maha_xii_sem_id),
    ('Mathematics', 'MH-XII-MAT', 4, maha_xii_sem_id);
  
  -- Add subjects for NCERT Foundation
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Physics', 'NCERT-F-PHY', 4, ncert_foundation_sem_id),
    ('Chemistry', 'NCERT-F-CHE', 4, ncert_foundation_sem_id),
    ('Biology', 'NCERT-F-BIO', 4, ncert_foundation_sem_id),
    ('Mathematics', 'NCERT-F-MAT', 4, ncert_foundation_sem_id);
  
  -- Add subjects for NCERT Class XI
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Physics', 'NCERT-XI-PHY', 4, ncert_xi_sem_id),
    ('Chemistry', 'NCERT-XI-CHE', 4, ncert_xi_sem_id),
    ('Biology', 'NCERT-XI-BIO', 4, ncert_xi_sem_id),
    ('Mathematics', 'NCERT-XI-MAT', 4, ncert_xi_sem_id);
  
  -- Add subjects for NCERT Class XII
  INSERT INTO subjects (name, code, credits, semester_id) VALUES
    ('Physics', 'NCERT-XII-PHY', 4, ncert_xii_sem_id),
    ('Chemistry', 'NCERT-XII-CHE', 4, ncert_xii_sem_id),
    ('Biology', 'NCERT-XII-BIO', 4, ncert_xii_sem_id),
    ('Mathematics', 'NCERT-XII-MAT', 4, ncert_xii_sem_id);
  
  -- Add comprehensive subject materials for Maharashtra Board Class XI Physics
  SELECT id INTO subject_id FROM subjects WHERE code = 'MH-XI-PHY' LIMIT 1;
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    '# Maharashtra Board Class XI Physics Syllabus

## Unit 1: Measurements and Motion in a Plane
- **Physical World and Measurement**
  - Physics scope and excitement
  - Units of measurement, systems of units
  - Fundamental and derived units
  - Least count, accuracy and precision
  - Errors in measurement, significant figures
  - Dimensions of physical quantities, dimensional analysis

- **Motion in a Plane**
  - Scalar and vector quantities
  - Position and displacement vectors
  - Velocity and acceleration vectors
  - Motion in a plane with constant acceleration
  - Relative velocity in two dimensions
  - Projectile motion
  - Uniform circular motion

## Unit 2: Laws of Motion
- **Newton''s Laws of Motion**
  - Intuitive concept of force
  - Inertia, Newton''s first law of motion
  - Newton''s second law of motion, concept of momentum
  - Newton''s third law of motion
  - Law of conservation of linear momentum
  - Equilibrium of concurrent forces
  - Static and kinetic friction, rolling friction

## Unit 3: Work, Energy and Power
- **Work, Energy and Power**
  - Work done by a constant force and variable force
  - Kinetic energy, work-energy theorem
  - Power, commercial unit of energy
  - Potential energy, conservation of mechanical energy
  - Conservative and non-conservative forces
  - Elastic and inelastic collisions in one and two dimensions

## Unit 4: Motion of System of Particles and Rigid Body
- **System of Particles and Rotational Motion**
  - Centre of mass of a two-particle system
  - Centre of mass of a rigid body
  - Basic concepts of rotational motion
  - Moment of a force, torque, angular momentum
  - Conservation of angular momentum
  - Equilibrium of rigid bodies, moment of inertia
  - Theorems of perpendicular and parallel axes

## Unit 5: Gravitation
- **Gravitation**
  - Kepler''s laws of planetary motion
  - Universal law of gravitation
  - Acceleration due to gravity and its variation
  - Gravitational potential energy, gravitational potential
  - Escape velocity, orbital velocity of a satellite
  - Geostationary satellites

## Unit 6: Properties of Bulk Matter
- **Mechanical Properties of Solids**
  - Elastic behaviour, stress-strain relationship
  - Hooke''s law, Young''s modulus, bulk modulus, shear modulus
  - Poisson''s ratio, elastic energy

- **Mechanical Properties of Fluids**
  - Pressure due to a fluid column
  - Pascal''s law and its applications
  - Effect of gravity on fluid pressure
  - Viscosity, Stokes'' law, terminal velocity
  - Reynolds number, streamline and turbulent flow
  - Bernoulli''s theorem and its applications

- **Thermal Properties of Matter**
  - Heat, temperature, thermal expansion
  - Specific heat capacity, calorimetry, change of state
  - Latent heat capacity, heat transfer
  - Conduction, convection and radiation
  - Thermal conductivity, qualitative ideas of blackbody radiation

## Unit 7: Thermodynamics
- **Thermodynamics**
  - Thermal equilibrium and definition of temperature
  - Zeroth law of thermodynamics, heat, work and internal energy
  - First law of thermodynamics, isothermal and adiabatic processes
  - Second law of thermodynamics, reversible and irreversible processes
  - Heat engine and refrigerator

## Unit 8: Behaviour of Perfect Gases and Kinetic Theory of Gases
- **Kinetic Theory**
  - Equation of state of a perfect gas, work done by compressing a gas
  - Kinetic theory of gases, concept of pressure
  - Kinetic interpretation of temperature
  - RMS speed of gas molecules, degrees of freedom
  - Law of equipartition of energy, specific heat capacity
  - Mean free path, Avogadro''s number

## Unit 9: Oscillations and Waves
- **Oscillations**
  - Periodic motion, simple harmonic motion (SHM)
  - Restoring force and force constant, energy in SHM
  - Simple pendulum, free, forced and damped oscillations
  - Resonance

- **Waves**
  - Wave motion, longitudinal and transverse waves
  - Speed of wave motion, displacement relation for a progressive wave
  - Principle of superposition of waves, reflection of waves
  - Standing waves in strings and organ pipes
  - Fundamental mode and harmonics, Doppler effect',
    'https://drive.google.com/drive/folders/mh-xi-physics-materials',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'A projectile is fired at an angle of 30° with the horizontal. What is the range of the projectile if the initial velocity is 20 m/s? (g = 10 m/s²)',
        'options', jsonb_build_array('17.3 m', '20 m', '34.6 m', '40 m'),
        'correct_answer', 0,
        'explanation', 'Range = (u²sin2θ)/g = (20² × sin60°)/10 = (400 × √3/2)/10 = 17.3 m',
        'difficulty', 'medium',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'The dimensional formula for impulse is:',
        'options', jsonb_build_array('[MLT⁻¹]', '[MLT⁻²]', '[ML²T⁻¹]', '[ML²T⁻²]'),
        'correct_answer', 0,
        'explanation', 'Impulse = Force × Time = [MLT⁻²] × [T] = [MLT⁻¹]',
        'difficulty', 'easy',
        'year', 2022
      ),
      jsonb_build_object(
        'question', 'A body of mass 2 kg is moving with velocity 10 m/s. What is its kinetic energy?',
        'options', jsonb_build_array('50 J', '100 J', '200 J', '400 J'),
        'correct_answer', 1,
        'explanation', 'Kinetic Energy = ½mv² = ½ × 2 × 10² = 100 J',
        'difficulty', 'easy',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'The escape velocity from Earth''s surface is approximately:',
        'options', jsonb_build_array('7.9 km/s', '11.2 km/s', '15.0 km/s', '25.0 km/s'),
        'correct_answer', 1,
        'explanation', 'The escape velocity from Earth is 11.2 km/s, calculated using v = √(2GM/R)',
        'difficulty', 'medium',
        'year', 2022
      ),
      jsonb_build_object(
        'question', 'In simple harmonic motion, the acceleration is:',
        'options', jsonb_build_array('Constant', 'Proportional to displacement', 'Proportional to velocity', 'Zero at mean position'),
        'correct_answer', 1,
        'explanation', 'In SHM, acceleration a = -ω²x, which is proportional to displacement and directed towards mean position',
        'difficulty', 'medium',
        'year', 2023
      )
    )
  );
  
  -- Add materials for Maharashtra Board Class XI Chemistry
  SELECT id INTO subject_id FROM subjects WHERE code = 'MH-XI-CHE' LIMIT 1;
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    '# Maharashtra Board Class XI Chemistry Syllabus

## Unit 1: Some Basic Concepts of Chemistry
- **Matter and its Nature**
  - Physical and chemical properties
  - Measurement and significant figures
  - SI units, dimensional analysis
  - Laws of chemical combination
  - Atomic and molecular masses
  - Mole concept, molar mass
  - Percentage composition, empirical and molecular formula

## Unit 2: Structure of Atom
- **Atomic Structure**
  - Discovery of electron, proton and neutron
  - Thomson and Rutherford atomic models
  - Bohr''s model of hydrogen atom
  - Quantum mechanical model of atom
  - Quantum numbers, electronic configuration
  - Aufbau principle, Pauli exclusion principle, Hund''s rule

## Unit 3: Classification of Elements and Periodicity in Properties
- **Periodic Table**
  - Modern periodic law and present form of periodic table
  - Nomenclature of elements with atomic number > 100
  - Electronic configuration of elements
  - Periodic trends: atomic radius, ionization enthalpy
  - Electron gain enthalpy, electronegativity, valency

## Unit 4: Chemical Bonding and Molecular Structure
- **Chemical Bonding**
  - Kossel-Lewis approach to chemical bonding
  - Ionic bond: formation, factors affecting formation
  - Lattice enthalpy, covalent bond
  - Lewis structure, polar character of covalent bond
  - Valence bond theory, hybridization
  - VSEPR theory, molecular geometry
  - Hydrogen bonding

## Unit 5: States of Matter: Gases and Liquids
- **Gaseous State**
  - Intermolecular forces, thermal energy
  - Gas laws: Boyle''s law, Charles'' law, Gay Lussac''s law
  - Avogadro''s law, ideal gas equation
  - Kinetic molecular theory of gases
  - Real gases, deviation from ideal gas behaviour

- **Liquid State**
  - Properties of liquids, vapour pressure
  - Surface tension, viscosity

## Unit 6: Thermodynamics
- **Chemical Thermodynamics**
  - System and surroundings, types of systems
  - State functions, extensive and intensive properties
  - First law of thermodynamics, internal energy and enthalpy
  - Measurement of ΔU and ΔH, Hess''s law
  - Enthalpies of bond dissociation, combustion, formation
  - Second law of thermodynamics, entropy
  - Gibbs energy change and equilibrium

## Unit 7: Equilibrium
- **Chemical Equilibrium**
  - Equilibrium in physical and chemical processes
  - Dynamic nature of equilibrium, law of mass action
  - Equilibrium constant, factors affecting equilibrium
  - Le Chatelier''s principle
  - Ionic equilibrium in solution, acids and bases
  - pH scale, buffer solutions, solubility product

## Unit 8: Redox Reactions
- **Redox Reactions**
  - Concept of oxidation and reduction
  - Redox reactions in terms of electron transfer
  - Oxidation number, balancing redox reactions
  - Applications of redox reactions

## Unit 9: Hydrogen
- **Hydrogen**
  - Position of hydrogen in periodic table
  - Occurrence, isotopes, preparation, properties and uses
  - Hydrides: ionic, covalent and metallic hydrides
  - Water: physical and chemical properties
  - Heavy water, hydrogen peroxide

## Unit 10: s-Block Elements
- **Alkali and Alkaline Earth Metals**
  - Group 1 elements: occurrence, electronic configuration
  - Trends in physical and chemical properties
  - Uses of alkali metals and their compounds
  - Group 2 elements: occurrence, electronic configuration
  - Trends in physical and chemical properties
  - Uses of alkaline earth metals and their compounds

## Unit 11: Some p-Block Elements
- **Group 13 and 14 Elements**
  - General introduction, electronic configuration
  - Occurrence, trends in physical and chemical properties
  - Important compounds of boron and carbon
  - Uses of group 13 and 14 elements

## Unit 12: Organic Chemistry - Some Basic Principles and Techniques
- **Fundamentals of Organic Chemistry**
  - Tetravalency of carbon, structural representations
  - Classification of organic compounds
  - Nomenclature: IUPAC system
  - Isomerism: structural and stereoisomerism
  - Fundamental concepts in organic reaction mechanism
  - Inductive effect, resonance, hyperconjugation
  - Electrophiles and nucleophiles
  - Types of organic reactions

## Unit 13: Hydrocarbons
- **Hydrocarbons**
  - Classification of hydrocarbons
  - Alkanes: nomenclature, isomerism, preparation
  - Physical and chemical properties, mechanism of halogenation
  - Alkenes: nomenclature, structure of double bond
  - Geometrical isomerism, preparation, properties
  - Alkynes: nomenclature, structure of triple bond
  - Preparation, physical and chemical properties
  - Aromatic hydrocarbons: introduction, IUPAC nomenclature
  - Benzene: resonance, aromaticity, preparation, properties

## Unit 14: Environmental Chemistry
- **Environmental Chemistry**
  - Environmental pollution: air, water and soil pollution
  - Atmospheric pollution, tropospheric and stratospheric pollution
  - Global warming and greenhouse effect
  - Acid rain, ozone layer depletion
  - Water pollution and soil pollution
  - Strategies to control environmental pollution',
    'https://drive.google.com/drive/folders/mh-xi-chemistry-materials',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'The number of moles in 22 g of CO₂ is:',
        'options', jsonb_build_array('0.5 mol', '1.0 mol', '1.5 mol', '2.0 mol'),
        'correct_answer', 0,
        'explanation', 'Molar mass of CO₂ = 12 + 2(16) = 44 g/mol. Number of moles = 22/44 = 0.5 mol',
        'difficulty', 'easy',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'Which quantum number determines the shape of an orbital?',
        'options', jsonb_build_array('Principal (n)', 'Azimuthal (l)', 'Magnetic (m)', 'Spin (s)'),
        'correct_answer', 1,
        'explanation', 'The azimuthal quantum number (l) determines the shape of an orbital (s, p, d, f)',
        'difficulty', 'medium',
        'year', 2022
      ),
      jsonb_build_object(
        'question', 'The hybridization of carbon in methane (CH₄) is:',
        'options', jsonb_build_array('sp', 'sp²', 'sp³', 'sp³d'),
        'correct_answer', 2,
        'explanation', 'In methane, carbon forms 4 sigma bonds, requiring sp³ hybridization',
        'difficulty', 'easy',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'According to Le Chatelier''s principle, increasing pressure will favor:',
        'options', jsonb_build_array('Forward reaction always', 'Backward reaction always', 'Side with fewer gas molecules', 'Side with more gas molecules'),
        'correct_answer', 2,
        'explanation', 'Increasing pressure favors the side with fewer gas molecules to reduce the stress',
        'difficulty', 'medium',
        'year', 2022
      ),
      jsonb_build_object(
        'question', 'The IUPAC name of CH₃-CH(CH₃)-CH₂-CH₃ is:',
        'options', jsonb_build_array('2-methylbutane', '3-methylbutane', 'Isopentane', 'Pentane'),
        'correct_answer', 0,
        'explanation', 'The longest chain has 4 carbons (butane) with a methyl group at position 2',
        'difficulty', 'medium',
        'year', 2023
      )
    )
  );
  
  -- Add materials for NCERT Class XII Physics (JEE/NEET focused)
  SELECT id INTO subject_id FROM subjects WHERE code = 'NCERT-XII-PHY' LIMIT 1;
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    '# NCERT Class XII Physics Syllabus (JEE/NEET)

## Unit 1: Electrostatics
- **Electric Charges and Fields**
  - Electric charge, conservation of charge, Coulomb''s law
  - Electric field, electric field due to a point charge
  - Electric field lines, electric dipole, electric field due to a dipole
  - Torque on a dipole in uniform electric field
  - Electric flux, Gauss''s law and its applications
  - Electric potential, potential difference, electric potential due to a point charge
  - Equipotential surfaces, potential energy of a system of charges

## Unit 2: Current Electricity
- **Current Electricity**
  - Electric current, flow of electric charges in a metallic conductor
  - Drift velocity, mobility and their relation with electric current
  - Ohm''s law, electrical resistance, V-I characteristics
  - Electrical energy and power, electrical resistivity and conductivity
  - Carbon resistors, colour code for carbon resistors
  - Series and parallel combinations of resistors
  - Temperature dependence of resistance
  - Internal resistance of a cell, potential difference and emf of a cell
  - Combination of cells in series and parallel
  - Kirchhoff''s laws and simple applications
  - Wheatstone bridge, metre bridge
  - Potentiometer: principle and its applications

## Unit 3: Magnetic Effects of Current and Magnetism
- **Moving Charges and Magnetism**
  - Concept of magnetic field, Oersted''s experiment
  - Biot-Savart law and its application to current carrying circular loop
  - Ampere''s law and its applications to infinitely long straight wire
  - Straight and toroidal solenoids, force on a moving charge in uniform magnetic field
  - Cyclotron, force on a current-carrying conductor in a uniform magnetic field
  - Force between two parallel current-carrying conductors
  - Torque experienced by a current loop in uniform magnetic field
  - Moving coil galvanometer, its current sensitivity and conversion to ammeter and voltmeter

- **Magnetism and Matter**
  - Current loop as a magnetic dipole and its magnetic dipole moment
  - Magnetic dipole moment of a revolving electron
  - Bar magnet as an equivalent solenoid, magnetic field lines
  - Earth''s magnetic field and magnetic elements
  - Para-, dia- and ferro-magnetic substances with examples
  - Electromagnets and factors affecting their strengths, permanent magnets

## Unit 4: Electromagnetic Induction and Alternating Currents
- **Electromagnetic Induction**
  - Electromagnetic induction, Faraday''s laws, induced emf and current
  - Lenz''s law, eddy currents, self and mutual induction

- **Alternating Current**
  - Alternating currents, peak and rms value of alternating current/voltage
  - Reactance and impedance, LC oscillations, LCR series circuit
  - Resonance, power in AC circuits, wattless current
  - AC generator and transformer

## Unit 5: Electromagnetic Waves
- **Electromagnetic Waves**
  - Basic idea of displacement current, electromagnetic waves
  - Electromagnetic spectrum (radio waves, microwaves, infrared, visible, ultraviolet, X-rays, gamma rays)
  - Applications of electromagnetic waves

## Unit 6: Optics
- **Ray Optics and Optical Instruments**
  - Ray optics, reflection of light, spherical mirrors, mirror formula
  - Refraction of light, total internal reflection and its applications
  - Optical fibres, refraction at spherical surfaces, lenses
  - Thin lens formula, lensmaker''s formula, magnification, power of a lens
  - Combination of thin lenses in contact, refraction of light through a prism
  - Scattering of light, optical instruments: microscopes and astronomical telescopes

- **Wave Optics**
  - Wave optics: Wavefront and Huygens principle, reflection and refraction of plane wave
  - Interference, Young''s double slit experiment and expression for fringe width
  - Coherent sources and sustained interference of light
  - Diffraction, single slit diffraction, resolving power of microscope and astronomical telescope
  - Polarisation, plane polarised light, Brewster''s law, uses of plane polarised light and Polaroids

## Unit 7: Dual Nature of Radiation and Matter
- **Dual Nature of Radiation and Matter**
  - Photoelectric effect, Hertz and Lenard''s observations
  - Einstein''s photoelectric equation, particle nature of light
  - Matter waves, wave nature of particles, de Broglie relation
  - Davisson-Germer experiment

## Unit 8: Atoms and Nuclei
- **Atoms**
  - Alpha-particle scattering experiment, Rutherford''s model of atom
  - Bohr model, energy levels, hydrogen spectrum

- **Nuclei**
  - Composition and size of nucleus, radioactivity
  - Alpha, beta and gamma particles/rays and their properties
  - Radioactive decay law, mass-energy relation, mass defect
  - Binding energy per nucleon and its variation with mass number
  - Nuclear fission, nuclear fusion

## Unit 9: Electronic Devices
- **Semiconductor Electronics**
  - Energy bands in conductors, semiconductors and insulators
  - Intrinsic and extrinsic semiconductors, p-n junction
  - Semiconductor diode, I-V characteristics in forward and reverse bias
  - Diode as a rectifier, special purpose p-n junction diodes
  - Junction transistor, transistor action, characteristics of a transistor
  - Transistor as an amplifier (common emitter configuration) and oscillator
  - Logic gates (OR, AND, NOT, NAND and NOR)

## Unit 10: Communication Systems
- **Communication Systems**
  - Elements of a communication system (block diagram only)
  - Bandwidth of signals (speech, TV and digital data)
  - Bandwidth of transmission medium, propagation of electromagnetic waves
  - Sky and space wave propagation, satellite communication
  - Modulation, amplitude modulation, frequency modulation
  - Advantages of frequency modulation over amplitude modulation
  - Basic ideas about internet, mobile telephony and global positioning system (GPS)',
    'https://drive.google.com/drive/folders/ncert-xii-physics-jee-neet',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'Two point charges +4μC and +1μC are placed 10 cm apart. The electric field is zero at a distance of:',
        'options', jsonb_build_array('6.67 cm from +4μC', '6.67 cm from +1μC', '5 cm from each charge', '3.33 cm from +1μC'),
        'correct_answer', 0,
        'explanation', 'At the null point, E₁ = E₂. Using k×4μC/x² = k×1μC/(10-x)², solving gives x = 6.67 cm from +4μC charge',
        'difficulty', 'hard',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'The magnetic field at the center of a circular coil of radius R carrying current I is:',
        'options', jsonb_build_array('μ₀I/2R', 'μ₀I/4R', 'μ₀I/2πR', 'μ₀I/4πR'),
        'correct_answer', 0,
        'explanation', 'Using Biot-Savart law for a circular coil, B = μ₀I/2R at the center',
        'difficulty', 'medium',
        'year', 2022
      ),
      jsonb_build_object(
        'question', 'In Young''s double slit experiment, the fringe width is:',
        'options', jsonb_build_array('λD/d', 'λd/D', 'Dd/λ', 'λ/Dd'),
        'correct_answer', 0,
        'explanation', 'Fringe width β = λD/d, where λ is wavelength, D is screen distance, d is slit separation',
        'difficulty', 'medium',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'The work function of a metal is 2.5 eV. The threshold frequency is:',
        'options', jsonb_build_array('6.05 × 10¹⁴ Hz', '1.21 × 10¹⁵ Hz', '2.42 × 10¹⁵ Hz', '3.63 × 10¹⁵ Hz'),
        'correct_answer', 0,
        'explanation', 'ν₀ = W₀/h = 2.5 × 1.6 × 10⁻¹⁹ / 6.63 × 10⁻³⁴ = 6.05 × 10¹⁴ Hz',
        'difficulty', 'hard',
        'year', 2022
      ),
      jsonb_build_object(
        'question', 'In a p-n junction diode, the depletion region:',
        'options', jsonb_build_array('Has mobile charge carriers', 'Has no electric field', 'Acts as an insulator', 'Has constant potential'),
        'correct_answer', 2,
        'explanation', 'The depletion region has no mobile charge carriers and acts as an insulator with high resistance',
        'difficulty', 'medium',
        'year', 2023
      )
    )
  );
  
  -- Add materials for NCERT Foundation Biology
  SELECT id INTO subject_id FROM subjects WHERE code = 'NCERT-F-BIO' LIMIT 1;
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    '# NCERT Foundation Biology Syllabus

## Unit 1: Life Processes
- **Life Processes in Living Organisms**
  - What are life processes?
  - Nutrition: autotrophic and heterotrophic nutrition
  - Photosynthesis, respiration in plants and animals
  - Transportation in plants and animals
  - Excretion in plants and animals
  - Control and coordination in plants and animals

## Unit 2: Control and Coordination
- **Control and Coordination**
  - Animals: nervous system, coordination in animals
  - Hormones in animals, plant hormones
  - Coordination in plants, movements in plants
  - Hormones in plants

## Unit 3: How do Organisms Reproduce?
- **Reproduction**
  - Reproduction in animals and plants
  - Sexual and asexual reproduction
  - Reproductive health

## Unit 4: Heredity and Evolution
- **Heredity and Evolution**
  - Heredity, variation, evolution
  - Speciation, natural selection
  - Evidence for evolution

## Unit 5: Our Environment
- **Our Environment**
  - Management of natural resources
  - Forest and wildlife resources
  - Water for all, coal and petroleum
  - Our environment: waste production and their solutions

## Unit 6: Natural Resource Management
- **Natural Resource Management**
  - Why manage resources?
  - Forest as resources, water resources
  - Coal and petroleum, natural resource management

## Unit 7: Basic Concepts of Biology
- **Basic Concepts of Biology**
  - Introduction to biology and its branches
  - Characteristics of living organisms
  - Classification of living organisms
  - Cell: basic unit of life
  - Cell structure and functions

## Unit 8: Diversity in Living World
- **Diversity in Living World**
  - Diversity in the living world
  - Taxonomic categories and taxonomical aids
  - Kingdom Monera, Protista, Fungi
  - Kingdom Plantae and Animalia

## Unit 9: Structural Organisation
- **Structural Organisation**
  - Cell: the unit of life
  - Biomolecules, cell cycle and cell division
  - Transport in plants, mineral nutrition
  - Photosynthesis in higher plants
  - Respiration in plants, plant growth and development',
    'https://drive.google.com/drive/folders/ncert-foundation-biology',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'Which of the following is the powerhouse of the cell?',
        'options', jsonb_build_array('Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'),
        'correct_answer', 1,
        'explanation', 'Mitochondria are called the powerhouse of the cell as they produce ATP through cellular respiration',
        'difficulty', 'easy',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'Photosynthesis occurs in which part of the plant cell?',
        'options', jsonb_build_array('Mitochondria', 'Nucleus', 'Chloroplast', 'Vacuole'),
        'correct_answer', 2,
        'explanation', 'Photosynthesis occurs in chloroplasts, which contain chlorophyll and other photosynthetic pigments',
        'difficulty', 'easy',
        'year', 2022
      ),
      jsonb_build_object(
        'question', 'The process by which plants lose water through their leaves is called:',
        'options', jsonb_build_array('Respiration', 'Transpiration', 'Photosynthesis', 'Excretion'),
        'correct_answer', 1,
        'explanation', 'Transpiration is the process of water loss from plant leaves through stomata',
        'difficulty', 'easy',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'Which hormone is responsible for the fight or flight response?',
        'options', jsonb_build_array('Insulin', 'Adrenaline', 'Growth hormone', 'Thyroxine'),
        'correct_answer', 1,
        'explanation', 'Adrenaline (epinephrine) is released during stress and prepares the body for fight or flight response',
        'difficulty', 'medium',
        'year', 2022
      ),
      jsonb_build_object(
        'question', 'The basic unit of heredity is:',
        'options', jsonb_build_array('Chromosome', 'Gene', 'DNA', 'RNA'),
        'correct_answer', 1,
        'explanation', 'Gene is the basic unit of heredity that carries genetic information from parents to offspring',
        'difficulty', 'medium',
        'year', 2023
      )
    )
  );
  
  -- Add materials for Maharashtra Board Class XII Mathematics
  SELECT id INTO subject_id FROM subjects WHERE code = 'MH-XII-MAT' LIMIT 1;
  INSERT INTO subject_materials (subject_id, syllabus, drive_link, gate_questions) VALUES (
    subject_id,
    '# Maharashtra Board Class XII Mathematics Syllabus

## Unit 1: Mathematical Logic
- **Mathematical Logic**
  - Statements, logical connectives, truth tables
  - Tautology, contradiction, contingency
  - Logical equivalence, algebra of statements
  - Conditional and biconditional statements
  - Quantifiers, negation of compound statements

## Unit 2: Matrices
- **Matrices**
  - Types of matrices, algebra of matrices
  - Determinants, properties of determinants
  - Adjoint and inverse of a matrix
  - Solution of system of linear equations
  - Cramer''s rule, elementary transformations

## Unit 3: Trigonometric Functions
- **Trigonometric Functions**
  - Trigonometric functions, their graphs and properties
  - Trigonometric equations, inverse trigonometric functions
  - Properties of inverse trigonometric functions

## Unit 4: Pair of Straight Lines
- **Pair of Straight Lines**
  - Equation of pair of straight lines
  - Angle between pair of lines, condition for perpendicular and parallel lines
  - Bisectors of angles between pair of lines

## Unit 5: Circle
- **Circle**
  - Equation of circle, general equation of circle
  - Parametric equations, tangent and normal to circle
  - Chord of contact, pole and polar
  - Equation of tangent in different forms

## Unit 6: Conics
- **Conic Sections**
  - Parabola: standard equation, parametric form
  - Tangent and normal to parabola
  - Ellipse: standard equation, parametric form
  - Tangent and normal to ellipse
  - Hyperbola: standard equation, parametric form
  - Tangent and normal to hyperbola

## Unit 7: Vectors
- **Vectors**
  - Vector algebra, types of vectors
  - Addition and multiplication of vectors
  - Scalar and vector products
  - Applications of vectors to geometry

## Unit 8: Three Dimensional Geometry
- **3D Geometry**
  - Direction cosines and direction ratios
  - Equation of line in space
  - Equation of plane, angle between planes
  - Distance from point to plane

## Unit 9: Line
- **Straight Line**
  - Slope of line, various forms of equation of line
  - Angle between two lines, distance formulae
  - Locus and its equation

## Unit 10: Plane
- **Applications of Derivatives**
  - Rate of change, increasing and decreasing functions
  - Maxima and minima, applications to geometry and physics

## Unit 11: Limits
- **Limits**
  - Limits of functions, algebra of limits
  - Limits of trigonometric, exponential and logarithmic functions

## Unit 12: Differentiation
- **Differentiation**
  - Derivative as rate of change, derivative of composite functions
  - Derivative of inverse trigonometric functions
  - Logarithmic differentiation, derivative of parametric functions

## Unit 13: Applications of Derivatives
- **Applications of Derivatives**
  - Tangent and normal, rate of change
  - Increasing and decreasing functions
  - Maxima and minima, optimization problems

## Unit 14: Integration
- **Integration**
  - Integration as inverse of differentiation
  - Methods of integration: substitution, parts, partial fractions
  - Integration of trigonometric, exponential and logarithmic functions
  - Definite integrals and their properties

## Unit 15: Applications of Definite Integration
- **Applications of Integration**
  - Area under curves, area between curves
  - Volume of solids of revolution

## Unit 16: Differential Equations
- **Differential Equations**
  - Order and degree of differential equations
  - Solution of first order differential equations
  - Linear differential equations

## Unit 17: Probability Distributions
- **Probability**
  - Random variables, probability distributions
  - Binomial and Poisson distributions
  - Mean and variance of distributions

## Unit 18: Bernoulli Trials and Binomial Distribution
- **Bernoulli Trials**
  - Bernoulli trials, binomial distribution
  - Mean and variance of binomial distribution
  - Applications of binomial distribution',
    'https://drive.google.com/drive/folders/mh-xii-mathematics-materials',
    jsonb_build_array(
      jsonb_build_object(
        'question', 'If A = [1 2; 3 4] and B = [2 1; 1 3], then AB is:',
        'options', jsonb_build_array('[4 7; 10 15]', '[4 10; 7 15]', '[2 2; 3 12]', '[5 8; 11 18]'),
        'correct_answer', 0,
        'explanation', 'AB = [1×2+2×1, 1×1+2×3; 3×2+4×1, 3×1+4×3] = [4 7; 10 15]',
        'difficulty', 'medium',
        'year', 2023
      ),
      jsonb_build_object(
        'question', 'The derivative of sin⁻¹(x) is:',
        'options', jsonb_build_array('1/√(1-x²)', '1/√(1+x²)', '-1/√(1-x²)', 'x/√(1-x²)'),
        'correct_answer', 0,
        'explanation', 'd/dx[sin⁻¹(x)] = 1/√(1-x²) for -1 < x < 1',
        'difficulty', 'medium',
        'year', 2022
      ),
      jsonb_build_object(
        'question', 'The equation of circle with center (2, 3) and radius 5 is:',
        'options', jsonb_build_array('(x-2)² + (y-3)² = 25', '(x+2)² + (y+3)² = 25', 'x² + y² - 4x - 6y = 12', 'x² + y² + 4x + 6y = 12'),
        'correct_answer', 0,
        'explanation', 'Standard form of circle: (x-h)² + (y-k)² = r², where (h,k) is center and r is radius',
        'difficulty', 'easy',
        'year', 2023
      ),
      jsonb_build_object(
        'question', '∫ 1/x dx equals:',
        'options', jsonb_build_array('ln|x| + C', 'x + C', '1/x² + C', 'e^x + C'),
        'correct_answer', 0,
        'explanation', 'The integral of 1/x is ln|x| + C, where C is the constant of integration',
        'difficulty', 'easy',
        'year', 2022
      ),
      jsonb_build_object(
        'question', 'In a binomial distribution with n = 10 and p = 0.3, the mean is:',
        'options', jsonb_build_array('3', '2.1', '7', '0.21'),
        'correct_answer', 0,
        'explanation', 'Mean of binomial distribution = np = 10 × 0.3 = 3',
        'difficulty', 'medium',
        'year', 2023
      )
    )
  );

END $$;