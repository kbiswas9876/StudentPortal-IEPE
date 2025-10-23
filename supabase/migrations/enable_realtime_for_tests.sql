-- ============================================================================
-- Enable Supabase Realtime for the tests table
-- Run this in Supabase SQL Editor to fix real-time subscription errors
-- ============================================================================

-- Step 1: Enable replication for the tests table
ALTER PUBLICATION supabase_realtime ADD TABLE tests;

-- Step 2: Ensure RLS is enabled (should already be from migration)
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Step 3: Create or update RLS policy for SELECT (students can view scheduled/live/completed tests)
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Students can view published tests" ON tests;

-- Create new policy allowing authenticated users to view tests
CREATE POLICY "Students can view published tests" 
ON tests 
FOR SELECT 
TO authenticated
USING (status IN ('scheduled', 'live', 'completed'));

-- Step 4: Verify the configuration
SELECT 
  schemaname,
  tablename,
  'Replication Enabled' as status
FROM pg_publication_tables 
WHERE tablename = 'tests' AND pubname = 'supabase_realtime';

-- If the above query returns no rows, replication is NOT enabled
-- If it returns a row, replication IS enabled ✅

COMMENT ON TABLE tests IS 'Mock tests table with real-time updates enabled for status changes';

