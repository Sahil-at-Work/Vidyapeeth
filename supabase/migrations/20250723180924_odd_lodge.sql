/*
  # Fix doubt_replies foreign key relationship

  1. Changes
    - Update doubt_replies.user_id to reference user_profiles.id instead of users.id
    - This aligns with the existing user_profiles structure and enables proper relationship traversal

  2. Security
    - Maintains existing RLS policies
    - Preserves data integrity with CASCADE delete
*/

-- Drop the existing foreign key constraint
ALTER TABLE doubt_replies DROP CONSTRAINT IF EXISTS doubt_replies_user_id_fkey;

-- Add the correct foreign key constraint pointing to user_profiles
ALTER TABLE doubt_replies ADD CONSTRAINT doubt_replies_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;