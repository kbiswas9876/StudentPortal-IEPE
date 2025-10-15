-- Simple schema fix for Revision Hub
-- This script adds the missing columns to answer_log table

-- Add user_id column if it doesn't exist
ALTER TABLE public.answer_log
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add created_at column if it doesn't exist  
ALTER TABLE public.answer_log
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_answer_log_user_id ON public.answer_log(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_log_created_at ON public.answer_log(created_at);

-- Update existing entries with user_id from test_results
UPDATE public.answer_log 
SET user_id = tr.user_id
FROM public.test_results tr
WHERE answer_log.result_id = tr.id
AND answer_log.user_id IS NULL;

-- Update created_at for existing entries
UPDATE public.answer_log 
SET created_at = NOW() - INTERVAL '1 day' * (RANDOM() * 30)
WHERE created_at IS NULL;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'answer_log' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
