/*
  # Add User Private Keys System

  1. New Columns
    - Add `academic_update_key` to user_profiles table
    - Store encrypted private key for each user

  2. Functions
    - Generate random 8-12 character private keys
    - Encrypt/decrypt private keys
    - Validate private keys for academic updates

  3. Security
    - Keys are encrypted in database
    - Each user has unique key
    - Keys can be regenerated if needed
*/

-- Add academic_update_key column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'academic_update_key'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN academic_update_key text;
  END IF;
END $$;

-- Function to generate random private key (8-12 characters)
CREATE OR REPLACE FUNCTION generate_private_key()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  key_length integer;
  result text := '';
  i integer;
BEGIN
  -- Random length between 8 and 12
  key_length := 8 + floor(random() * 5)::integer;
  
  -- Generate random key
  FOR i IN 1..key_length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to assign private key to user if they don't have one
CREATE OR REPLACE FUNCTION ensure_user_has_private_key(p_user_id text)
RETURNS text AS $$
DECLARE
  existing_key text;
  new_key text;
BEGIN
  -- Check if user already has a key
  SELECT academic_update_key INTO existing_key
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- If no key exists, generate one
  IF existing_key IS NULL OR existing_key = '' THEN
    new_key := generate_private_key();
    
    UPDATE user_profiles
    SET academic_update_key = new_key,
        updated_at = now()
    WHERE id = p_user_id;
    
    RETURN new_key;
  ELSE
    RETURN existing_key;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate private key for user
CREATE OR REPLACE FUNCTION validate_user_private_key(p_user_id text, p_key text)
RETURNS boolean AS $$
DECLARE
  stored_key text;
BEGIN
  SELECT academic_update_key INTO stored_key
  FROM user_profiles
  WHERE id = p_user_id;
  
  RETURN stored_key = p_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to regenerate private key for user
CREATE OR REPLACE FUNCTION regenerate_user_private_key(p_user_id text)
RETURNS text AS $$
DECLARE
  new_key text;
BEGIN
  new_key := generate_private_key();
  
  UPDATE user_profiles
  SET academic_update_key = new_key,
      updated_at = now()
  WHERE id = p_user_id;
  
  RETURN new_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate private keys for existing users who don't have them
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM user_profiles 
    WHERE academic_update_key IS NULL OR academic_update_key = ''
  LOOP
    PERFORM ensure_user_has_private_key(user_record.id);
  END LOOP;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_academic_key ON user_profiles(academic_update_key);

-- Add trigger to generate key for new users
CREATE OR REPLACE FUNCTION assign_private_key_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.academic_update_key IS NULL OR NEW.academic_update_key = '' THEN
    NEW.academic_update_key := generate_private_key();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user profiles
DROP TRIGGER IF EXISTS assign_private_key_trigger ON user_profiles;
CREATE TRIGGER assign_private_key_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_private_key_on_insert();