# Real-time Subscription Troubleshooting Guide

## Error: "Real-time subscription error"

This error occurs when Supabase Realtime cannot establish a connection to listen for database changes.

---

## Solution Steps

### Step 1: Enable Replication in Supabase Dashboard

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Find the `tests` table in the list
4. Toggle **Enable** for the `tests` table
5. Click **Save** or **Apply**

**Option B: Using SQL Editor**

1. Go to **SQL Editor** in Supabase dashboard
2. Run this SQL script:

```sql
-- Enable replication for tests table
ALTER PUBLICATION supabase_realtime ADD TABLE tests;

-- Verify it worked
SELECT tablename 
FROM pg_publication_tables 
WHERE tablename = 'tests' AND pubname = 'supabase_realtime';
```

3. If the SELECT query returns a row, replication is enabled ✅

---

### Step 2: Verify RLS Policies

Run this in SQL Editor to ensure proper Row Level Security:

```sql
-- Check existing policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tests';

-- If no policies exist, create one
CREATE POLICY "Students can view published tests" 
ON tests 
FOR SELECT 
TO authenticated
USING (status IN ('scheduled', 'live', 'completed'));
```

---

### Step 3: Run the Migration Script

Execute the provided migration:

```bash
# Copy the SQL from supabase/migrations/enable_realtime_for_tests.sql
# Paste and run it in Supabase SQL Editor
```

Or use the Supabase CLI:

```bash
supabase db push
```

---

### Step 4: Verify in Your App

After enabling replication:

1. Refresh your application
2. Open browser console (F12)
3. Navigate to Mock Tests page
4. Look for: `✅ Real-time subscription active for test status changes`

If you still see errors, check the error details in console.

---

## Common Issues & Solutions

### Issue 1: "Replication slot full"

**Solution:** Reduce the number of subscriptions or increase Supabase plan limits.

### Issue 2: "Permission denied for table tests"

**Solution:** 
- Check that RLS policies allow SELECT for authenticated users
- Verify user is logged in with valid session

### Issue 3: "Table not found in publication"

**Solution:**
- Replication not enabled for `tests` table
- Follow Step 1 above

---

## Testing Real-time Updates

### Manual Test:

1. Open Mock Tests page in browser
2. Open a second tab/window with Supabase SQL Editor
3. Run this update:
   ```sql
   UPDATE tests 
   SET status = 'live' 
   WHERE id = (SELECT id FROM tests WHERE status = 'scheduled' LIMIT 1);
   ```
4. Check if the first tab updates automatically (no refresh needed)

---

## Fallback Behavior

If real-time cannot be enabled:

**The app will still work!** Users just need to manually refresh the page to see status updates.

To disable real-time and rely on manual refresh:

1. Comment out the real-time subscription code in `src/app/mock-tests/page.tsx`
2. Or add a feature flag:

```typescript
const ENABLE_REALTIME = process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true'

useEffect(() => {
  if (!ENABLE_REALTIME || !mockTestData || !user) return
  // ... subscription code
}, [mockTestData, user])
```

---

## Database Configuration Checklist

Run this comprehensive check:

```sql
-- 1. Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'tests';

-- 2. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tests';

-- 3. Check replication status
SELECT * FROM pg_publication_tables 
WHERE tablename = 'tests';

-- 4. Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'tests';

-- 5. Test SELECT as authenticated user
SELECT id, name, status FROM tests LIMIT 5;
```

All checks should return results. If any return empty, that's your issue!

---

## Quick Fix: Enable Everything

Run this complete setup script:

```sql
-- Complete Realtime setup for tests table
BEGIN;

-- Enable RLS
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Students can view published tests" ON tests;
DROP POLICY IF EXISTS "Public read access" ON tests;

-- Create SELECT policy
CREATE POLICY "Students can view published tests" 
ON tests FOR SELECT TO authenticated
USING (status IN ('scheduled', 'live', 'completed'));

-- Enable replication
ALTER PUBLICATION supabase_realtime ADD TABLE tests;

COMMIT;

-- Verify
SELECT 'RLS Enabled' as check, 
       (SELECT rowsecurity FROM pg_tables WHERE tablename = 'tests') as enabled
UNION ALL
SELECT 'Replication Enabled', 
       CASE WHEN EXISTS(SELECT 1 FROM pg_publication_tables WHERE tablename = 'tests') 
       THEN 'true' ELSE 'false' END;
```

---

## Still Not Working?

**Check Supabase Project Settings:**

1. Database → Settings → Check connection pooler is enabled
2. Authentication → Settings → Check JWT expiry
3. API → Settings → Check API URL and anon key are correct

**Check Browser Console:**

Look for WebSocket errors:
- `Failed to establish WebSocket connection`
- `Connection refused`
- `Authentication failed`

**Contact Support:**

If none of the above work, the issue might be:
- Supabase plan limitations (free tier has limits)
- Network/firewall blocking WebSocket connections
- Supabase regional outage

---

## Success Indicators

When everything works correctly, you'll see:

```
Setting up real-time subscription for test status changes...
✅ Real-time subscription active for test status changes
```

And when a test status changes in the database, you'll see:

```
Test status update received: {...}
Updating test 123 from status 'scheduled' to 'live'
```

Without needing to refresh the page! 🎉

