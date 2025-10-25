-- ============================================================================
-- TABLE: tests
-- Purpose: Stores mock test definitions with scheduling, scoring, and results policies
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tests (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,
  
  -- Test Identification
  name TEXT NOT NULL,
  description TEXT,
  
  -- Scheduling
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'scheduled', 'live', 'completed', 'archived')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  
  -- Duration & Scoring
  total_time_minutes INTEGER NOT NULL DEFAULT 60,
  marks_per_correct NUMERIC NOT NULL DEFAULT 1 
    CHECK (marks_per_correct > 0),
  negative_marks_per_incorrect NUMERIC NOT NULL DEFAULT 0 
    CHECK (negative_marks_per_incorrect <= 0),
  total_questions INTEGER NOT NULL DEFAULT 0 
    CHECK (total_questions >= 0),
  
  -- Results Management
  result_policy TEXT NOT NULL DEFAULT 'instant' 
    CHECK (result_policy IN ('instant', 'scheduled', 'manual')),
  result_release_at TIMESTAMPTZ,
  
  -- Teacher-Controlled Features
  allow_pausing BOOLEAN NOT NULL DEFAULT false,
  show_in_question_timer BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_end_time_after_start_time 
    CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time),
  CONSTRAINT check_result_release_valid 
    CHECK (result_policy != 'scheduled' OR result_release_at IS NOT NULL)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Status-based queries (most common)
CREATE INDEX IF NOT EXISTS idx_tests_status 
ON tests(status);

-- Time-based queries (CRON job)
CREATE INDEX IF NOT EXISTS idx_tests_start_time 
ON tests(start_time) 
WHERE start_time IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tests_end_time 
ON tests(end_time) 
WHERE end_time IS NOT NULL;

-- Composite indexes for status transitions
CREATE INDEX IF NOT EXISTS idx_tests_status_start_time 
ON tests(status, start_time) 
WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_tests_status_end_time 
ON tests(status, end_time) 
WHERE status = 'live';

-- Result policy queries
CREATE INDEX IF NOT EXISTS idx_tests_result_policy 
ON tests(result_policy, result_release_at) 
WHERE result_policy = 'scheduled';

-- Ordering index
CREATE INDEX IF NOT EXISTS idx_tests_created_at 
ON tests(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tests_updated_at ON tests;

CREATE TRIGGER trigger_tests_updated_at
BEFORE UPDATE ON tests
FOR EACH ROW
EXECUTE FUNCTION update_tests_updated_at();

-- Auto-update total_questions when test_questions changes
CREATE OR REPLACE FUNCTION update_test_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE tests 
    SET total_questions = (
      SELECT COUNT(*) 
      FROM test_questions 
      WHERE test_id = OLD.test_id
    )
    WHERE id = OLD.test_id;
    RETURN OLD;
  ELSE
    UPDATE tests 
    SET total_questions = (
      SELECT COUNT(*) 
      FROM test_questions 
      WHERE test_id = NEW.test_id
    )
    WHERE id = NEW.test_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Note: Trigger is created on test_questions table, not here

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Policy: Public read for published tests (students can see live/completed tests)
CREATE POLICY "Students can view published tests" ON tests
  FOR SELECT
  USING (status IN ('scheduled', 'live', 'completed'));

-- Policy: Admins have full access
CREATE POLICY "Admins have full access to tests" ON tests
  FOR ALL
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

COMMENT ON TABLE tests IS 
'Mock test definitions with scheduling, scoring configuration, and results management.';

COMMENT ON COLUMN tests.name IS 
'Display name of the test (e.g., "JEE Main Mock Test #1")';

COMMENT ON COLUMN tests.description IS 
'Optional detailed description of test content and instructions';

COMMENT ON COLUMN tests.status IS 
'Current lifecycle status:
- draft: Being created, not visible to students
- scheduled: Published, scheduled for future
- live: Currently active, students can attempt
- completed: Past end time, no new attempts allowed
- archived: Hidden from all lists';

COMMENT ON COLUMN tests.start_time IS 
'When test becomes available to students. NULL for perpetual tests.';

COMMENT ON COLUMN tests.end_time IS 
'When test closes. NULL for perpetual tests.';

COMMENT ON COLUMN tests.total_time_minutes IS 
'Duration limit for each student attempt in minutes';

COMMENT ON COLUMN tests.marks_per_correct IS 
'Marks awarded for each correct answer (must be positive)';

COMMENT ON COLUMN tests.negative_marks_per_incorrect IS 
'Marks deducted for incorrect answers. Must be <= 0 (e.g., -0.25, -0.5, -1). Zero means no negative marking.';

COMMENT ON COLUMN tests.total_questions IS 
'Total number of questions. Auto-computed from test_questions table via trigger.';

COMMENT ON COLUMN tests.result_policy IS 
'When results are shown to students:
- instant: Immediately after submission
- scheduled: At specific datetime (result_release_at)
- manual: Admin manually publishes results';

COMMENT ON COLUMN tests.result_release_at IS 
'Timestamp when results become visible (only used when result_policy = scheduled)';

COMMENT ON COLUMN tests.allow_pausing IS 
'Whether students can pause the test during the session. Controlled by teacher in Admin Panel.';

COMMENT ON COLUMN tests.show_in_question_timer IS 
'Whether to show per-question timer to students. Controlled by teacher in Admin Panel.';

-- Legacy field removed in migration

