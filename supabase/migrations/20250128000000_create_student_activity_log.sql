-- ============================================================================
-- MIGRATION: Create student_activity_log table for analytics event sourcing
-- ============================================================================
-- Purpose: Establish a centralized, append-only log table to capture all
-- critical student interactions for the Independent Student Analytics System.
-- 
-- This table uses an event sourcing pattern for observability, making it
-- fast and simple to query student activity without complex joins.
-- ============================================================================

-- Create the central activity log table
CREATE TABLE IF NOT EXISTS public.student_activity_log (
    -- Primary key for the log entry
    id BIGSERIAL PRIMARY KEY,

    -- Foreign key to the user who performed the action
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Controlled vocabulary for event categorization
    -- This is the primary field for filtering activities
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'PRACTICE_SESSION_COMPLETED',
        'MOCK_TEST_COMPLETED',
        'QUESTION_BOOKMARKED',
        'QUESTION_UNBOOKMARKED',
        'REVIEW_SESSION_COMPLETED'
    )),

    -- Optional reference ID to link back to the source entity
    -- For a 'PRACTICE_SESSION_COMPLETED' event, this would be the ID from test_results.
    -- For a 'QUESTION_BOOKMARKED' event, this would be the ID from bookmarked_questions.
    -- Note: Using TEXT to support both BIGINT (test_results.id) and UUID (bookmark.id)
    related_entity_id TEXT,

    -- Flexible JSONB blob to store all relevant context about the event
    -- This denormalization is key for analytics performance
    metadata JSONB NOT NULL,

    -- Timestamp when the event was recorded
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for performant querying by the Admin Panel
-- ============================================================================

-- Index for querying all activities by user
CREATE INDEX IF NOT EXISTS idx_student_activity_log_user_id 
ON public.student_activity_log (user_id);

-- Index for querying by activity type (e.g., all bookmark events)
CREATE INDEX IF NOT EXISTS idx_student_activity_log_activity_type 
ON public.student_activity_log (activity_type);

-- Composite index for common query pattern: user + activity type
CREATE INDEX IF NOT EXISTS idx_student_activity_log_user_activity 
ON public.student_activity_log (user_id, activity_type);

-- Index for time-based queries (recent activity, daily summaries, etc.)
CREATE INDEX IF NOT EXISTS idx_student_activity_log_created_at 
ON public.student_activity_log (created_at DESC);

-- GIN index for efficient JSONB queries on metadata field
CREATE INDEX IF NOT EXISTS idx_student_activity_log_metadata 
ON public.student_activity_log USING gin (metadata);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS for the table
ALTER TABLE public.student_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service_role (Admin Panel backend) to access everything
-- This is the only role that should read from this table
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'student_activity_log' 
        AND policyname = 'Enable full access for service_role'
    ) THEN
        CREATE POLICY "Enable full access for service_role"
            ON public.student_activity_log
            FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Policy: Allow authenticated users to write their own activity logs
-- This allows the Student Portal to log events on behalf of users
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'student_activity_log' 
        AND policyname = 'Users can log their own activities'
    ) THEN
        CREATE POLICY "Users can log their own activities"
            ON public.student_activity_log
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- COMMENTS for documentation
-- ============================================================================

COMMENT ON TABLE public.student_activity_log IS 
'Central append-only log table for all student analytical events. Uses event sourcing pattern for complete observability.';

COMMENT ON COLUMN public.student_activity_log.user_id IS 
'Reference to the student who performed the action';

COMMENT ON COLUMN public.student_activity_log.activity_type IS 
'Controlled vocabulary: PRACTICE_SESSION_COMPLETED, MOCK_TEST_COMPLETED, QUESTION_BOOKMARKED, QUESTION_UNBOOKMARKED, REVIEW_SESSION_COMPLETED';

COMMENT ON COLUMN public.student_activity_log.related_entity_id IS 
'Optional reference to the source entity (e.g., test_result.id, bookmarked_question.id)';

COMMENT ON COLUMN public.student_activity_log.metadata IS 
'JSONB object containing all event context. Structure varies by activity_type. See blueprint for specifications.';

COMMENT ON COLUMN public.student_activity_log.created_at IS 
'Timestamp when the event occurred';

