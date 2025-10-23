# CRON Job Setup Guide

## Overview

The mock test portal uses a Vercel CRON job to automatically transition test statuses based on scheduled times. This eliminates manual intervention and ensures tests start and end precisely on time.

---

## CRON Job Details

**Endpoint:** `/api/cron/update-test-status`  
**Schedule:** Every minute (`* * * * *`)  
**Method:** GET (POST supported for manual testing)  
**Security:** Protected by `CRON_SECRET` environment variable

---

## Environment Variable Setup

### 1. Generate a Secure Secret

Run this command to generate a cryptographically secure random string:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**
```
7f3d8e2a9c1b4f5e6d7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e
```

### 2. Add to Vercel Environment Variables

#### Option A: Via Vercel Dashboard
1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Name: `CRON_SECRET`
5. Value: Paste your generated secret
6. Select all environments (Production, Preview, Development)
7. Click **Save**

#### Option B: Via Vercel CLI
```bash
vercel env add CRON_SECRET
# Paste your secret when prompted
# Select: Production, Preview, Development
```

### 3. Add to Local Development

Create or update `.env.local`:

```bash
CRON_SECRET=your_generated_secret_here
```

**⚠️ Important:** Add `.env.local` to `.gitignore` (should already be there)

---

## Verification

### 1. Verify CRON Job is Scheduled

After deployment:
1. Go to Vercel dashboard → Your Project
2. Navigate to **Settings** → **Cron Jobs**
3. Confirm you see:
   - Path: `/api/cron/update-test-status`
   - Schedule: `* * * * *` (every minute)
   - Status: Active

### 2. Manual Test (Local Development)

```bash
# Make sure your local server is running
npm run dev

# In another terminal, test the endpoint
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/update-test-status
```

**Expected Response:**
```json
{
  "success": true,
  "timestamp": "2024-10-24T10:30:00.000Z",
  "transitions": {
    "scheduled_to_live": 0,
    "live_to_completed": 0
  },
  "updated_tests": {
    "now_live": [],
    "now_completed": []
  }
}
```

### 3. Manual Test (Production)

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_PRODUCTION_CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/update-test-status
```

### 4. Monitor CRON Executions

**Via Vercel Dashboard:**
1. Go to your project
2. Click on a deployment
3. Navigate to **Functions** → **Cron Jobs**
4. View execution logs

**Via CLI:**
```bash
vercel logs --follow
```

Look for log entries like:
```
Running test status update CRON job at: 2024-10-24T10:30:00.000Z
✅ Transitioned 1 test(s) to LIVE: #123 "JEE Mock Test #1"
CRON job completed successfully
```

---

## Testing the CRON Job

### Scenario 1: Test Going Live

1. **Create a test in admin panel:**
   - Name: "CRON Test 1"
   - Start time: 3 minutes from now
   - End time: 10 minutes from now
   - Status should be: `scheduled`

2. **Wait for start time:**
   - Within 1 minute of start_time, the CRON job should run
   - Status should automatically change to: `live`
   - Check student portal `/mock-tests` page
   - Test should appear in "Live" tab

3. **Verify logs:**
   ```
   ✅ Transitioned 1 test(s) to LIVE: #X "CRON Test 1"
   ```

### Scenario 2: Test Going Completed

1. **Wait for end time:**
   - Within 1 minute of end_time, the CRON job should run
   - Status should automatically change to: `completed`
   - Test should move to "Completed" tab

2. **Verify logs:**
   ```
   ✅ Transitioned 1 test(s) to COMPLETED: #X "CRON Test 1"
   ```

---

## Troubleshooting

### Issue: CRON Job Not Running

**Symptoms:**
- Tests not transitioning status automatically
- No CRON logs in Vercel

**Solutions:**

1. **Check CRON_SECRET is set:**
   ```bash
   vercel env ls
   ```
   Should show `CRON_SECRET` for all environments

2. **Verify CRON job is configured:**
   - Check `vercel.json` contains:
     ```json
     {
       "crons": [{
         "path": "/api/cron/update-test-status",
         "schedule": "* * * * *"
       }]
     }
     ```

3. **Redeploy the project:**
   ```bash
   vercel --prod
   ```

### Issue: 401 Unauthorized

**Symptoms:**
- CRON job logs show "Unauthorized" errors
- Manual test returns 401

**Solutions:**

1. **Verify secret matches:**
   - Check `.env.local` value
   - Check Vercel environment variable value
   - They must be exactly the same

2. **Check Authorization header format:**
   ```bash
   # Correct format
   Authorization: Bearer your_secret_here
   
   # Incorrect (missing "Bearer ")
   Authorization: your_secret_here
   ```

### Issue: 500 Internal Server Error

**Symptoms:**
- CRON job runs but returns 500
- Logs show "Missing SUPABASE_SERVICE_ROLE_KEY"

**Solutions:**

1. **Verify Supabase credentials are set:**
   ```bash
   vercel env ls
   ```
   Should show:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Check database connection:**
   - Test Supabase connection from Vercel dashboard
   - Verify service role key has admin permissions

### Issue: Tests Not Transitioning

**Symptoms:**
- CRON job runs successfully (200 OK)
- But test status doesn't change

**Debugging:**

1. **Check test times in database:**
   ```sql
   SELECT id, name, status, start_time, end_time, NOW() as current_time
   FROM tests
   WHERE status IN ('scheduled', 'live');
   ```

2. **Verify timezone consistency:**
   - All times should be stored in UTC
   - Use `toISOString()` when saving times

3. **Check CRON response:**
   - Look at `transitions` object
   - Should show number of tests transitioned

---

## Security Best Practices

1. **Never commit CRON_SECRET to version control**
   - Add to `.gitignore`
   - Use environment variables only

2. **Use different secrets for different environments**
   ```
   Production: Use production secret
   Preview: Use preview secret (or same as prod)
   Development: Use local secret
   ```

3. **Rotate secret periodically**
   - Every 90 days recommended
   - Update in Vercel environment variables
   - No code changes needed

4. **Monitor for unauthorized attempts**
   - Check logs for 401 errors
   - Set up alerts for unusual activity

---

## Advanced Configuration

### Change CRON Schedule

Edit `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/update-test-status",
    "schedule": "*/5 * * * *"  // Every 5 minutes instead
  }]
}
```

**Schedule Syntax (cron format):**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)

Examples:
* * * * *     Every minute
*/5 * * * *   Every 5 minutes
0 * * * *     Every hour
0 0 * * *     Daily at midnight
```

### Add Webhook Notifications

Modify `src/app/api/cron/update-test-status/route.ts` to send notifications when tests transition:

```typescript
// After successful transition
if (scheduledToLive && scheduledToLive.length > 0) {
  // Send webhook notification
  await fetch('https://your-webhook-url.com/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'test_went_live',
      tests: scheduledToLive
    })
  })
}
```

---

## FAQ

**Q: Why every minute? Isn't that too frequent?**  
A: For exam precision, 1-minute granularity ensures tests start/end on time. Vercel CRON is lightweight and this frequency is well within limits.

**Q: What happens if CRON job fails?**  
A: The next execution (1 minute later) will catch any missed transitions. The query logic handles this gracefully.

**Q: Can I trigger it manually for testing?**  
A: Yes! Use the POST endpoint with your CRON_SECRET for manual testing anytime.

**Q: Does this cost extra on Vercel?**  
A: CRON jobs are included in all Vercel plans. Check your plan's execution limits.

**Q: What if I need sub-minute precision?**  
A: Vercel CRON minimum is 1 minute. For sub-minute needs, consider Edge Functions or websockets.

---

**Last Updated:** October 24, 2024  
**Version:** 1.0  
**Related:** Phase 1 Implementation

