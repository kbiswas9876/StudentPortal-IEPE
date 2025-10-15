-- Personal Revision Hub - Database Schema Enhancement
-- This query enhances the bookmarked_questions table to store rich user context

-- Add columns for personal notes and custom tags
ALTER TABLE public.bookmarked_questions
  ADD COLUMN IF NOT EXISTS personal_note TEXT,
  ADD COLUMN IF NOT EXISTS custom_tags TEXT[];

-- Add indexes for better performance on the new columns
CREATE INDEX IF NOT EXISTS idx_bookmarked_questions_personal_note ON public.bookmarked_questions USING gin(to_tsvector('english', personal_note));
CREATE INDEX IF NOT EXISTS idx_bookmarked_questions_custom_tags ON public.bookmarked_questions USING gin(custom_tags);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bookmarked_questions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
