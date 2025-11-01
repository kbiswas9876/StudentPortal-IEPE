-- Add dynamic shuffling flag to tests table (default false for backward compatibility)
ALTER TABLE public.tests
ADD COLUMN IF NOT EXISTS is_dynamically_shuffled boolean NOT NULL DEFAULT false;

-- Optional: comment for documentation
COMMENT ON COLUMN public.tests.is_dynamically_shuffled IS 'When true, each attempt gets a per-user shuffled question and option order.';

