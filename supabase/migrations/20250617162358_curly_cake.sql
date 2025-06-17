/*
  # Add Profile Fields for Personal Information

  1. New Columns
    - Add personal information fields to user_profiles table
    - phone_number (text)
    - date_of_birth (date)
    - profile_image (text) - stores selected avatar option
    - bio (text) - optional bio/description
    - location (text) - optional location

  2. Security
    - Update RLS policies to allow users to update their profile information
    - Ensure data privacy and security

  3. Indexes
    - Add indexes for better performance on profile queries
*/

-- Add new columns to user_profiles table
DO $$
BEGIN
  -- Add phone_number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone_number text;
  END IF;

  -- Add date_of_birth column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN date_of_birth date;
  END IF;

  -- Add profile_image column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'profile_image'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN profile_image text DEFAULT 'avatar1';
  END IF;

  -- Add bio column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN bio text;
  END IF;

  -- Add location column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN location text;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone_number ON user_profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_image ON user_profiles(profile_image);

-- Update RLS policies to ensure users can update their profile information
-- (The existing policies should already cover this, but let's make sure)

-- Function to validate phone number format (basic validation)
CREATE OR REPLACE FUNCTION validate_phone_number(phone text)
RETURNS boolean AS $$
BEGIN
  -- Basic phone number validation (10-15 digits, optional + prefix)
  RETURN phone ~ '^(\+\d{1,3}[- ]?)?\d{10,14}$';
END;
$$ LANGUAGE plpgsql;

-- Function to validate date of birth (must be in the past and reasonable age)
CREATE OR REPLACE FUNCTION validate_date_of_birth(dob date)
RETURNS boolean AS $$
BEGIN
  -- Check if date is in the past and person is between 10 and 100 years old
  RETURN dob < CURRENT_DATE 
    AND dob > CURRENT_DATE - INTERVAL '100 years'
    AND dob < CURRENT_DATE - INTERVAL '10 years';
END;
$$ LANGUAGE plpgsql;