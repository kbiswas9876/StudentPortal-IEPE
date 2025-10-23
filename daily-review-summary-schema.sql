-- ============================================================================
-- DAILY REVIEW SUMMARY TABLE
-- ============================================================================
-- This table tracks daily review activity for streak calculation and
-- the 90-day activity heatmap in the analytics dashboard.
--
-- Each row represents a single day's review activity for a user.
-- The table uses an UPSERT pattern to increment the count as reviews are completed.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.daily_review_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reviews_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per user per day
  CONSTRAINT daily_review_summary_user_date_unique UNIQUE(user_id, date)
);

-- Index for efficient streak queries (get recent days for a user, ordered by date)
CREATE INDEX IF NOT EXISTS idx_daily_review_user_date 
ON public.daily_review_summary(user_id, date DESC);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_daily_review_date 
ON public.daily_review_summary(date);

-- Comments for documentation
COMMENT ON TABLE public.daily_review_summary IS 
'Tracks daily review completion counts for streak tracking and activity heatmaps';

COMMENT ON COLUMN public.daily_review_summary.reviews_completed IS 
'Number of SRS reviews completed on this date (any review counts toward streak)';

COMMENT ON COLUMN public.daily_review_summary.date IS 
'The date in the user''s local timezone (stored as DATE for consistency)';

