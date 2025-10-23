-- ============================================================================
-- TABLE: test_questions
-- Purpose: Junction table linking tests to questions (many-to-many relationship)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.test_questions (
  -- Composite Primary Key
  test_id BIGINT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Primary Key
  PRIMARY KEY (test_id, question_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- For fetching all questions in a test
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id 
ON test_questions(test_id);

-- For finding which tests contain a specific question
CREATE INDEX IF NOT EXISTS idx_test_questions_question_id 
ON test_questions(question_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update tests.total_questions when questions are added/removed
DROP TRIGGER IF EXISTS trigger_update_test_question_count ON test_questions;

CREATE TRIGGER trigger_update_test_question_count
AFTER INSERT OR DELETE ON test_questions
FOR EACH ROW
EXECUTE FUNCTION update_test_question_count();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view questions for published tests
CREATE POLICY "Students can view questions for published tests" ON test_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = test_questions.test_id
      AND tests.status IN ('live', 'completed')
    )
  );

-- Policy: Admins have full access
CREATE POLICY "Admins have full access to test_questions" ON test_questions
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

COMMENT ON TABLE test_questions IS 
'Junction table linking tests to their questions. Allows reuse of questions across multiple tests.';

COMMENT ON COLUMN test_questions.test_id IS 
'Reference to the test';

COMMENT ON COLUMN test_questions.question_id IS 
'Reference to the question';

-- Note: position column omitted in base schema

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to add multiple questions to a test at once
CREATE OR REPLACE FUNCTION add_questions_to_test(
  p_test_id BIGINT,
  p_question_ids BIGINT[]
)
RETURNS INTEGER AS $$
DECLARE
  v_question_id BIGINT;
  v_count INTEGER := 0;
BEGIN
  -- Insert each question
  FOREACH v_question_id IN ARRAY p_question_ids
  LOOP
    INSERT INTO test_questions (test_id, question_id)
    VALUES (p_test_id, v_question_id)
    ON CONFLICT (test_id, question_id) DO NOTHING;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_questions_to_test IS 
'Bulk insert questions into a test';

