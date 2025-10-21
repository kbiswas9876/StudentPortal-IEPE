-- ============================================================================
-- FIX: Add missing updated_at column to user_notification_preferences
-- ============================================================================
-- This migration adds the updated_at column if it doesn't exist.
-- Safe to run multiple times (idempotent).
-- ============================================================================

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_notification_preferences' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_notification_preferences 
        ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
        
        RAISE NOTICE 'Added updated_at column to user_notification_preferences';
    ELSE
        RAISE NOTICE 'updated_at column already exists in user_notification_preferences';
    END IF;
END $$;

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger (safe to run multiple times)
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_notification_preferences' 
        AND column_name = 'updated_at'
    ) THEN
        RAISE NOTICE '✓ Migration successful - updated_at column exists';
    ELSE
        RAISE EXCEPTION '✗ Migration failed - updated_at column not found';
    END IF;
END $$;

