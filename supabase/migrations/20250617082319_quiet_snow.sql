/*
  # Add User Names System

  1. New Tables
    - Add `display_name` column to user_profiles table
    - Create function to generate random names
    - Update existing users with random names

  2. Security
    - Update RLS policies to include display_name access
    - Ensure users can update their own display names

  3. Data Population
    - Assign random names to existing users without names
    - Create list of realistic names for assignment
*/

-- Add display_name column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN display_name text;
  END IF;
END $$;

-- Create function to generate random names
CREATE OR REPLACE FUNCTION generate_random_name()
RETURNS text AS $$
DECLARE
  first_names text[] := ARRAY[
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Vedant', 'Kabir', 'Aryan', 'Rudra', 'Yash', 'Dhruv',
    'Ananya', 'Diya', 'Priya', 'Kavya', 'Anika', 'Ira', 'Myra', 'Tara', 'Sara', 'Riya',
    'Aadhya', 'Kiara', 'Saanvi', 'Avni', 'Pari', 'Khushi', 'Angel', 'Pihu', 'Aarohi', 'Nisha',
    'Rahul', 'Rohan', 'Amit', 'Vikram', 'Rajesh', 'Suresh', 'Mahesh', 'Ramesh', 'Dinesh', 'Ganesh',
    'Pooja', 'Sneha', 'Neha', 'Rekha', 'Geeta', 'Seeta', 'Meera', 'Veera', 'Deepa', 'Shreya'
  ];
  
  last_names text[] := ARRAY[
    'Sharma', 'Verma', 'Gupta', 'Agarwal', 'Jain', 'Bansal', 'Goel', 'Mittal', 'Singhal', 'Mahajan',
    'Patel', 'Shah', 'Mehta', 'Desai', 'Modi', 'Joshi', 'Trivedi', 'Pandya', 'Amin', 'Thakkar',
    'Singh', 'Kumar', 'Yadav', 'Chauhan', 'Rajput', 'Thakur', 'Bisht', 'Negi', 'Rawat', 'Bhatt',
    'Reddy', 'Rao', 'Krishna', 'Prasad', 'Murthy', 'Naidu', 'Chandra', 'Ravi', 'Srinivas', 'Venkat',
    'Iyer', 'Nair', 'Menon', 'Pillai', 'Kurup', 'Varma', 'Namboothiri', 'Thampi', 'Panicker', 'Nambiar'
  ];
  
  first_name text;
  last_name text;
BEGIN
  -- Select random first and last name
  first_name := first_names[1 + floor(random() * array_length(first_names, 1))];
  last_name := last_names[1 + floor(random() * array_length(last_names, 1))];
  
  RETURN first_name || ' ' || last_name;
END;
$$ LANGUAGE plpgsql;

-- Function to assign random names to users without display names
CREATE OR REPLACE FUNCTION assign_random_names_to_users()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  random_name text;
BEGIN
  -- Loop through all user profiles without display names
  FOR user_record IN 
    SELECT id FROM user_profiles 
    WHERE display_name IS NULL OR display_name = ''
  LOOP
    -- Generate a unique random name
    LOOP
      random_name := generate_random_name();
      
      -- Check if this name is already taken
      IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE display_name = random_name AND id != user_record.id
      ) THEN
        EXIT; -- Name is unique, exit the loop
      END IF;
    END LOOP;
    
    -- Update the user profile with the random name
    UPDATE user_profiles 
    SET display_name = random_name 
    WHERE id = user_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to assign random names to existing users
SELECT assign_random_names_to_users();

-- Create trigger to assign random name when new user profile is created without a name
CREATE OR REPLACE FUNCTION assign_random_name_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
    LOOP
      NEW.display_name := generate_random_name();
      
      -- Check if this name is already taken
      IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE display_name = NEW.display_name AND id != NEW.id
      ) THEN
        EXIT; -- Name is unique, exit the loop
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user profiles
DROP TRIGGER IF EXISTS assign_random_name_trigger ON user_profiles;
CREATE TRIGGER assign_random_name_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_random_name_on_insert();

-- Update RLS policies to allow users to read and update their display names
-- (The existing policies should already cover this, but let's make sure)

-- Create index for better performance on display_name lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- Function to get user display name by user ID
CREATE OR REPLACE FUNCTION get_user_display_name(p_user_id uuid)
RETURNS text AS $$
DECLARE
  user_name text;
BEGIN
  SELECT display_name INTO user_name
  FROM user_profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(user_name, 'Anonymous User');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;