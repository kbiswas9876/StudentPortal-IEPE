-- Part 6: Personal Revision Hub - Database Schema Enhancement
-- This script adds the crucial user_id column to answer_log table for performance tracking

-- Step 1: Add the user_id column to the answer_log table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'answer_log' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.answer_log
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 2: Add created_at column to answer_log table for performance tracking (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'answer_log' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.answer_log
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Step 3: Create indexes on the new columns for high-performance lookups
CREATE INDEX IF NOT EXISTS idx_answer_log_user_id ON public.answer_log(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_log_created_at ON public.answer_log(created_at);

-- Step 4: Update existing answer_log entries with user_id from test_results
-- This ensures existing data is properly linked to users
UPDATE public.answer_log 
SET user_id = tr.user_id
FROM public.test_results tr
WHERE answer_log.result_id = tr.id
AND answer_log.user_id IS NULL;

-- Step 5: Update created_at for existing entries (use a default timestamp)
UPDATE public.answer_log 
SET created_at = NOW() - INTERVAL '1 day' * (RANDOM() * 30)
WHERE created_at IS NULL;

-- Step 6: Add a check constraint to ensure user_id is not null for new entries (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_user_id_not_null' 
        AND table_name = 'answer_log'
    ) THEN
        ALTER TABLE public.answer_log
        ADD CONSTRAINT check_user_id_not_null CHECK (user_id IS NOT NULL);
    END IF;
END $$;

-- Verification query to check the schema update
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'answer_log' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
