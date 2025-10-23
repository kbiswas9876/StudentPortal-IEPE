-- ============================================================================
-- PRE-MIGRATION CHECK SCRIPT
-- Run this BEFORE the actual migration to see what will be changed
-- This is READ-ONLY and makes no changes to your database
-- ============================================================================

-- Check 1: Does negative_marks_per_incorrect column already exist?
DO $$ 
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' 
    AND column_name = 'negative_marks_per_incorrect'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE '✅ Column "negative_marks_per_incorrect" already exists';
  ELSE
    RAISE NOTICE '📝 Column "negative_marks_per_incorrect" will be created';
  END IF;
END $$;

-- Check 2: If column exists, show current values
DO $$ 
DECLARE
  column_exists BOOLEAN;
  v_count INTEGER;
  v_null_count INTEGER;
  v_positive_count INTEGER;
  v_negative_count INTEGER;
  v_zero_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' 
    AND column_name = 'negative_marks_per_incorrect'
  ) INTO column_exists;
  
  IF column_exists THEN
    -- Count total rows
    EXECUTE 'SELECT COUNT(*) FROM tests' INTO v_count;
    
    -- Count NULL values
    EXECUTE 'SELECT COUNT(*) FROM tests WHERE negative_marks_per_incorrect IS NULL' INTO v_null_count;
    
    -- Count positive values (will be converted)
    EXECUTE 'SELECT COUNT(*) FROM tests WHERE negative_marks_per_incorrect > 0' INTO v_positive_count;
    
    -- Count negative values (already correct)
    EXECUTE 'SELECT COUNT(*) FROM tests WHERE negative_marks_per_incorrect < 0' INTO v_negative_count;
    
    -- Count zero values
    EXECUTE 'SELECT COUNT(*) FROM tests WHERE negative_marks_per_incorrect = 0' INTO v_zero_count;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 Current negative_marks_per_incorrect Statistics:';
    RAISE NOTICE '   Total tests: %', v_count;
    RAISE NOTICE '   NULL values: % (will be set to 0)', v_null_count;
    RAISE NOTICE '   Positive values: % (will be converted to negative)', v_positive_count;
    RAISE NOTICE '   Negative values: % (already correct)', v_negative_count;
    RAISE NOTICE '   Zero values: % (no change)', v_zero_count;
    
    IF v_positive_count > 0 THEN
      RAISE NOTICE '';
      RAISE NOTICE '⚠️  ATTENTION: % test(s) have POSITIVE values that will be converted:', v_positive_count;
      RAISE NOTICE '   Example: 0.25 will become -0.25, 1 will become -1';
      RAISE NOTICE '';
    END IF;
  END IF;
END $$;

-- Check 3: Show actual test data that will be affected
DO $$ 
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' 
    AND column_name = 'negative_marks_per_incorrect'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE '📋 Tests with positive negative_marks_per_incorrect (will be converted):';
    RAISE NOTICE '   Run this query to see details:';
    RAISE NOTICE '   SELECT id, name, negative_marks_per_incorrect FROM tests WHERE negative_marks_per_incorrect > 0;';
  END IF;
END $$;

-- Check 4: Does total_questions column exist?
DO $$ 
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' 
    AND column_name = 'total_questions'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Column "total_questions" already exists';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '📝 Column "total_questions" will be created';
  END IF;
END $$;

-- Check 5: Count tests and their questions
DO $$ 
DECLARE
  v_total_tests INTEGER;
  v_tests_with_questions INTEGER;
  v_tests_without_questions INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_tests FROM tests;
  
  SELECT COUNT(DISTINCT test_id) INTO v_tests_with_questions FROM test_questions;
  
  v_tests_without_questions := v_total_tests - v_tests_with_questions;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tests and Questions Statistics:';
  RAISE NOTICE '   Total tests: %', v_total_tests;
  RAISE NOTICE '   Tests with questions: %', v_tests_with_questions;
  RAISE NOTICE '   Tests without questions: % (total_questions will be 0)', v_tests_without_questions;
END $$;

-- Check 6: Show question count for each test
RAISE NOTICE '';
RAISE NOTICE '📋 Question count per test (sample - first 10):';
RAISE NOTICE '   Run this query to see all:';
RAISE NOTICE '   SELECT t.id, t.name, COUNT(tq.question_id) as question_count';
RAISE NOTICE '   FROM tests t LEFT JOIN test_questions tq ON t.id = tq.test_id';
RAISE NOTICE '   GROUP BY t.id, t.name ORDER BY t.id;';

-- Check 7: Verify test_questions table exists
DO $$ 
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'test_questions'
  ) INTO table_exists;
  
  RAISE NOTICE '';
  IF table_exists THEN
    RAISE NOTICE '✅ Table "test_questions" exists';
  ELSE
    RAISE NOTICE '❌ ERROR: Table "test_questions" does NOT exist!';
    RAISE NOTICE '   Migration will fail. Please create test_questions table first.';
  END IF;
END $$;

-- Check 8: Constraints that will be added
RAISE NOTICE '';
RAISE NOTICE '🔧 Constraints that will be added:';
RAISE NOTICE '   ✓ negative_marks_per_incorrect <= 0 (must be negative or zero)';
RAISE NOTICE '   ✓ marks_per_correct > 0 (must be positive)';
RAISE NOTICE '   ✓ total_questions >= 0 (must be non-negative)';
RAISE NOTICE '   ✓ status must be one of: draft, scheduled, live, completed, archived';
RAISE NOTICE '   ✓ end_time must be after start_time';

-- Check 9: Indexes that will be created
RAISE NOTICE '';
RAISE NOTICE '🚀 Indexes that will be created:';
RAISE NOTICE '   ✓ idx_tests_status';
RAISE NOTICE '   ✓ idx_tests_start_time';
RAISE NOTICE '   ✓ idx_tests_end_time';
RAISE NOTICE '   ✓ idx_tests_status_start_time';
RAISE NOTICE '   ✓ idx_tests_status_end_time';
RAISE NOTICE '   ✓ idx_tests_result_policy';

-- Check 10: Trigger that will be created
RAISE NOTICE '';
RAISE NOTICE '⚙️  Trigger that will be created:';
RAISE NOTICE '   ✓ trigger_update_test_question_count';
RAISE NOTICE '   → Automatically updates total_questions when questions are added/removed';

-- Final Summary
RAISE NOTICE '';
RAISE NOTICE '═══════════════════════════════════════════════════════════';
RAISE NOTICE '✅ PRE-MIGRATION CHECK COMPLETE';
RAISE NOTICE '═══════════════════════════════════════════════════════════';
RAISE NOTICE '';
RAISE NOTICE '👉 Next Steps:';
RAISE NOTICE '   1. Review the statistics above';
RAISE NOTICE '   2. If everything looks good, run: 20251024_mock_tests_schema_migration_CORRECTED.sql';
RAISE NOTICE '   3. Monitor the migration output for success messages';
RAISE NOTICE '';
RAISE NOTICE '⚠️  Note: This check made NO CHANGES to your database';
RAISE NOTICE '';

