-- ============================================================================
-- REVIEW HISTORY TABLE
-- ============================================================================
-- This table tracks every SRS review with full historical context for
-- accurate retention rate calculations and hourly performance analytics.
--
-- Each row represents a single review event with both the SRS state at the
-- time of review (critical for maturity classification) and the resulting
-- new state after the SRS algorithm was applied.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bookmark_id UUID NOT NULL REFERENCES bookmarked_questions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  performance_rating INTEGER NOT NULL CHECK (performance_rating BETWEEN 1 AND 4),
  
  -- SRS state at time of review (critical for retention calculations)
  interval_at_review INTEGER NOT NULL,
  ease_factor_at_review DECIMAL(4,2) NOT NULL,
  repetitions_at_review INTEGER NOT NULL,
  
  -- SRS state after review (for analytics)
  new_interval INTEGER NOT NULL,
  new_ease_factor DECIMAL(4,2) NOT NULL,
  new_repetitions INTEGER NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_review_history_user_created 
ON public.review_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_history_user_rating 
ON public.review_history(user_id, performance_rating);

CREATE INDEX IF NOT EXISTS idx_review_history_bookmark 
ON public.review_history(bookmark_id);

-- Comments for documentation
COMMENT ON TABLE public.review_history IS 
'Tracks every SRS review with full historical context for retention analytics and performance tracking';

COMMENT ON COLUMN public.review_history.performance_rating IS 
'User performance: 1=Again (failed), 2=Hard (difficult), 3=Good (correct), 4=Easy (instant recall)';

COMMENT ON COLUMN public.review_history.interval_at_review IS 
'SRS interval at time of review (days). Used for maturity classification: <21=Young, >=21=Mature';

COMMENT ON COLUMN public.review_history.created_at IS 
'Timestamp in UTC. Converted to user timezone for hourly performance analytics';

