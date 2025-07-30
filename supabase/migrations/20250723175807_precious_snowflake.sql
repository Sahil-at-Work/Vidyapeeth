/*
  # Fix foreign key relationship for student_doubts table

  1. Changes
    - Drop existing foreign key constraint that references auth.users
    - Add new foreign key constraint that references user_profiles table
    - This allows proper joining from student_doubts -> user_profiles -> universities/departments/semesters

  2. Security
    - Maintains existing RLS policies
    - Preserves data integrity with CASCADE delete
*/

-- Drop the existing foreign key constraint that references auth.users
ALTER TABLE IF EXISTS public.student_doubts
DROP CONSTRAINT IF EXISTS student_doubts_user_id_fkey;

-- Add the correct foreign key constraint that references user_profiles
ALTER TABLE public.student_doubts
ADD CONSTRAINT student_doubts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;