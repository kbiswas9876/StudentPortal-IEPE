-- ============================================================================
-- TABLE: test_results
-- Purpose: Stores student test attempt results and performance metrics
-- Note: This table already exists, this schema documents its structure
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.test_results (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,
  
  -- References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mock_test_id BIGINT REFERENCES tests(id) ON DELETE SET NULL,
  
  -- Test Type Classification
  test_type TEXT NOT NULL DEFAULT 'practice',
  session_type TEXT NOT NULL DEFAULT 'practice',
  
  -- Performance Metrics
  score NUMERIC,
  score_percentage NUMERIC,
  accuracy NUMERIC,
  
  -- Question Statistics
  total_questions INTEGER,
  total_correct INTEGER,
  total_incorrect INTEGER,
  total_skipped INTEGER,
  
  -- Time Tracking
  total_time_taken INTEGER, -- in seconds
  
  -- SRS Integration
  srs_feedback_log JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User performance queries
CREATE INDEX IF NOT EXISTS idx_test_results_user_id 
ON test_results(user_id);

-- Mock test leaderboard queries
CREATE INDEX IF NOT EXISTS idx_test_results_mock_test_id 
ON test_results(mock_test_id) 
WHERE mock_test_id IS NOT NULL;

-- Composite index for leaderboard (test + score)
CREATE INDEX IF NOT EXISTS idx_test_results_mock_test_score 
ON test_results(mock_test_id, score_percentage DESC NULLS LAST) 
WHERE mock_test_id IS NOT NULL;

-- User's test history
CREATE INDEX IF NOT EXISTS idx_test_results_user_mock_test 
ON test_results(user_id, mock_test_id);

-- Session type filtering
CREATE INDEX IF NOT EXISTS idx_test_results_session_type 
ON test_results(session_type);

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_test_results_submitted_at 
ON test_results(submitted_at DESC);

-- SRS feedback queries
CREATE INDEX IF NOT EXISTS idx_test_results_srs_feedback 
ON test_results USING gin(srs_feedback_log) 
WHERE srs_feedback_log IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own results
CREATE POLICY "Users can view their own test results" ON test_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own results
CREATE POLICY "Users can insert their own test results" ON test_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all results
CREATE POLICY "Admins can view all test results" ON test_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE test_results IS 
'Stores student test attempt results with comprehensive performance metrics';

COMMENT ON COLUMN test_results.user_id IS 
'Reference to the student who took the test';

COMMENT ON COLUMN test_results.mock_test_id IS 
'Reference to the mock test (NULL for practice sessions)';

COMMENT ON COLUMN test_results.test_type IS 
'Type of test: "practice" or "mock_test"';

COMMENT ON COLUMN test_results.session_type IS 
'Session classification for filtering: "practice", "mock_test", etc.';

COMMENT ON COLUMN test_results.score IS 
'Raw score calculated based on marking scheme';

COMMENT ON COLUMN test_results.score_percentage IS 
'Percentage score (0-100)';

COMMENT ON COLUMN test_results.accuracy IS 
'Accuracy percentage: (correct / attempted) * 100';

COMMENT ON COLUMN test_results.total_questions IS 
'Total number of questions in the test';

COMMENT ON COLUMN test_results.total_correct IS 
'Number of correctly answered questions';

COMMENT ON COLUMN test_results.total_incorrect IS 
'Number of incorrectly answered questions';

COMMENT ON COLUMN test_results.total_skipped IS 
'Number of unattempted/skipped questions';

COMMENT ON COLUMN test_results.total_time_taken IS 
'Total time taken in seconds';

COMMENT ON COLUMN test_results.srs_feedback_log IS 
'JSONB storing SRS feedback given during solution review. Maps question_id to feedback entry.';

COMMENT ON COLUMN test_results.submitted_at IS 
'Timestamp when the test was submitted';

-- ============================================================================
-- UTILITY VIEWS
-- ============================================================================

-- View: Mock test leaderboard with rankings
CREATE OR REPLACE VIEW mock_test_leaderboard AS
SELECT 
  tr.id,
  tr.user_id,
  tr.mock_test_id,
  tr.score_percentage,
  tr.total_correct,
  tr.total_incorrect,
  tr.total_skipped,
  tr.total_time_taken,
  tr.submitted_at,
  RANK() OVER (
    PARTITION BY tr.mock_test_id 
    ORDER BY tr.score_percentage DESC NULLS LAST, tr.submitted_at ASC
  ) as rank,
  COUNT(*) OVER (PARTITION BY tr.mock_test_id) as total_participants
FROM test_results tr
WHERE tr.mock_test_id IS NOT NULL
  AND tr.session_type = 'mock_test';

COMMENT ON VIEW mock_test_leaderboard IS 
'Leaderboard view with rankings for each mock test';

-- View: User performance summary
CREATE OR REPLACE VIEW user_test_performance_summary AS
SELECT 
  user_id,
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN session_type = 'mock_test' THEN 1 END) as mock_test_attempts,
  COUNT(CASE WHEN session_type = 'practice' THEN 1 END) as practice_attempts,
  AVG(score_percentage) as avg_score,
  MAX(score_percentage) as best_score,
  SUM(total_questions) as total_questions_attempted,
  SUM(total_correct) as total_correct_answers,
  SUM(total_time_taken) as total_time_spent_seconds
FROM test_results
GROUP BY user_id;

COMMENT ON VIEW user_test_performance_summary IS 
'Aggregated performance metrics per user across all attempts';

