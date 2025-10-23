# Quick Test Guide: Real-time Mock Test Updates

## 🎯 What to Test

Verify that test status changes automatically update in the UI without page refresh.

## ⚡ Quick Setup (5 minutes)

### 1. Prepare a Test

In your Admin Panel (`C:\Users\HP\Documents\MyProject\AdminPanel-IEPE`):

1. Create a new mock test
2. Set these values:
   - **Status:** `scheduled`
   - **Start Time:** 3 minutes from now
   - **End Time:** 8 minutes from now
   - Add a few questions
3. Save the test

### 2. Open Student Portal

1. Navigate to: `http://localhost:3000/mock-tests` (or your dev URL)
2. Log in as a student
3. Open browser console (F12 → Console tab)

### 3. Verify Subscription

Look for this log in console:
```
✅ Real-time subscription active for test status changes
```

If you see this, the real-time connection is working! ✅

## 🧪 Test Scenario 1: Watch a Test Go Live

### Expected Timeline

```
T-3 min: Test appears in "Upcoming" tab
         Countdown shows "Starts in: 00:03:00"
         Button says "Coming Soon" (disabled/grayed)

T-0 min: Countdown hits zero, shows "Starting now!"
         Wait up to 60 seconds for CRON job...

T+0 to T+1 min: 🎉 MAGIC HAPPENS:
         Console logs: "Test status update received"
         Test automatically moves to "Live" tab
         Button changes to "Start Test" (enabled/green)
         NO PAGE REFRESH NEEDED!
```

### What to Watch For

#### ✅ Success Indicators:
- Test moves from "Upcoming" to "Live" automatically
- Button becomes clickable
- Console shows update logs
- Smooth animation (no jarring changes)

#### ❌ Failure Indicators:
- Test stays in "Upcoming" after countdown ends
- No console logs after countdown
- Need to manually refresh to see "Live" status
- Console errors (red text)

## 🧪 Test Scenario 2: Multi-Tab Test

### Setup
1. Open `/mock-tests` in Tab 1
2. Open `/mock-tests` in Tab 2 (duplicate tab)
3. Use same test from Scenario 1

### Expected Result
When test goes live:
- **Both tabs update simultaneously** ✅
- No need to switch tabs or refresh
- Each tab logs its own subscription status

## 🐛 Troubleshooting

### Problem: No "✅ Real-time subscription active" log

**Check:**
1. Is Supabase Realtime enabled in your project?
   - Go to Supabase Dashboard → Database → Replication
   - Ensure `tests` table is replicated
2. Are you logged in as a student?
3. Did the initial data fetch complete?

**Fix:** Check network tab for WebSocket connection to Supabase

---

### Problem: Countdown ends but test doesn't move

**Check:**
1. Did CRON job run?
   - Check Vercel logs or manually trigger:
   - `curl http://localhost:3000/api/cron/update-test-status`
2. Is test `start_time` in correct timezone (UTC)?
3. Console shows any errors?

**Fix:** Manually trigger CRON job to test database update

---

### Problem: Console shows update but UI doesn't change

**Check:**
1. React DevTools → Components → MockTestHubPage
2. Verify `mockTestData.tests` array is updating
3. Check test ID in console log matches test you're watching

**Fix:** This indicates a React state issue, check browser console for errors

## 📋 Testing Checklist

Before marking Phase 1.2 complete, verify:

- [ ] Subscription establishes on page load (console log)
- [ ] Test moves from "Upcoming" to "Live" automatically
- [ ] Button state changes (disabled → enabled)
- [ ] Test moves from "Live" to "Completed" automatically
- [ ] Works with multiple browser tabs open
- [ ] No console errors
- [ ] No page refresh required
- [ ] Countdown timer keeps working during transition

## 🎉 Success!

If all checkboxes are ✅, Phase 1.2 is complete!

The Mock Test portal now provides a seamless, real-time experience where students see status updates instantly without manual refresh.

---

**Next:** Commit and push to `mock-test-revised` branch, then begin Phase 2 planning.

