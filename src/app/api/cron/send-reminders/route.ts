import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * POST /api/cron/send-reminders
 * 
 * Automated cron job that runs hourly to:
 * 1. Find users whose reminder time matches the current UTC hour
 * 2. Check if they have due reviews
 * 3. Send in-app and/or email notifications
 * 
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 */
export async function POST(request: Request) {
  try {
    console.log('🕐 Starting automated reminder cron job...');
    
    // Security: Verify the request is from an authorized source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron job attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentTimeUTC = new Date();
    console.log(`⏰ Current UTC time: ${currentTimeUTC.toISOString()}`);

    // ============================================================================
    // STEP 1: Find all users who should receive notifications at this hour
    // ============================================================================
    
    // Get all users with notification preferences enabled
    const { data: allPreferences, error: preferencesError } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('*')
      .or('enable_in_app_reminders.eq.true,enable_email_reminders.eq.true');

    if (preferencesError) {
      console.error('❌ Error fetching user preferences:', preferencesError);
      return NextResponse.json(
        { error: preferencesError.message },
        { status: 500 }
      );
    }

    console.log(`📋 Found ${allPreferences?.length || 0} users with notifications enabled`);

    if (!allPreferences || allPreferences.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with notifications enabled',
        usersProcessed: 0,
        notificationsSent: 0,
      });
    }

    // ============================================================================
    // STEP 2: Filter users whose local reminder time matches current UTC hour
    // ============================================================================
    
    const targetUsers = allPreferences.filter(pref => {
      try {
        // Parse the user's reminder time (format: "HH:MM")
        const [reminderHour, reminderMinute] = pref.reminder_time.split(':').map(Number);
        
        // Create a date object for the user's local time
        const userLocalTime = new Date(currentTimeUTC.toLocaleString('en-US', { 
          timeZone: pref.user_timezone 
        }));
        
        // Check if the current hour in user's timezone matches their reminder hour
        // We check for a 1-hour window to account for cron job timing
        const userHour = userLocalTime.getHours();
        const isTargetHour = userHour === reminderHour;
        
        if (isTargetHour) {
          console.log(`✓ User ${pref.user_id} - Local time: ${userLocalTime.toTimeString()}, Reminder: ${pref.reminder_time}`);
        }
        
        return isTargetHour;
      } catch (error) {
        console.error(`Error processing timezone for user ${pref.user_id}:`, error);
        return false;
      }
    });

    console.log(`🎯 Found ${targetUsers.length} users whose reminder time matches current hour`);

    let notificationsSent = 0;
    let emailsSent = 0;

    // ============================================================================
    // STEP 3: Process each target user
    // ============================================================================
    
    for (const userPref of targetUsers) {
      try {
        console.log(`👤 Processing user: ${userPref.user_id}`);

        // Check for due reviews
        const today = new Date().toISOString().split('T')[0];
        
        const { data: dueBookmarks, error: dueError } = await supabaseAdmin
          .from('bookmarked_questions')
          .select('id, question_id')
          .eq('user_id', userPref.user_id)
          .or(`and(is_custom_reminder_active.eq.true,custom_next_review_date.lte.${today}),and(is_custom_reminder_active.eq.false,next_review_date.lte.${today}),and(is_custom_reminder_active.eq.false,next_review_date.is.null)`);

        if (dueError) {
          console.error(`❌ Error checking due reviews for user ${userPref.user_id}:`, dueError);
          continue;
        }

        const dueCount = dueBookmarks?.length || 0;
        console.log(`📚 User has ${dueCount} questions due for review`);

        if (dueCount === 0) {
          console.log('⏭️ No due reviews, skipping user');
          continue;
        }

        // ============================================================================
        // STEP 4: Send notifications
        // ============================================================================

        // Send in-app notification
        if (userPref.enable_in_app_reminders) {
          const message = dueCount === 1 
            ? 'Your daily review is ready! You have 1 question waiting.'
            : `Your daily review is ready! You have ${dueCount} questions waiting.`;

          const { error: notificationError } = await supabaseAdmin
            .from('student_notifications')
            .insert([{
              user_id: userPref.user_id,
              message,
              link: '/revision-hub',
              is_read: false,
            }]);

          if (notificationError) {
            console.error(`❌ Error creating in-app notification for user ${userPref.user_id}:`, notificationError);
          } else {
            console.log(`✅ In-app notification sent to user ${userPref.user_id}`);
            notificationsSent++;
          }
        }

        // Send email notification
        if (userPref.enable_email_reminders) {
          // TODO: Integrate with email service (Resend, SendGrid, etc.)
          // For now, we'll log this action
          console.log(`📧 Email notification would be sent to user ${userPref.user_id}`);
          console.log(`   Subject: Your Daily Review is Ready`);
          console.log(`   Message: You have ${dueCount} question(s) ready for review.`);
          console.log(`   Link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/revision-hub`);
          
          // Placeholder for actual email sending
          // await sendEmail({
          //   to: userEmail,
          //   subject: 'Your Daily Review is Ready',
          //   html: emailTemplate,
          // });
          
          emailsSent++;
        }

      } catch (error) {
        console.error(`Error processing user ${userPref.user_id}:`, error);
        continue;
      }
    }

    // ============================================================================
    // STEP 5: Return summary
    // ============================================================================

    const summary = {
      success: true,
      timestamp: currentTimeUTC.toISOString(),
      usersChecked: allPreferences.length,
      usersInTargetHour: targetUsers.length,
      usersProcessed: targetUsers.length,
      inAppNotificationsSent: notificationsSent,
      emailNotificationsQueued: emailsSent,
    };

    console.log('✅ Cron job completed successfully');
    console.log('📊 Summary:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ Unexpected error in send-reminders cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing/monitoring
 * Returns basic info about the cron job
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cron/send-reminders',
    description: 'Automated reminder system for SRS daily reviews',
    method: 'POST',
    schedule: 'Hourly (at the beginning of each hour)',
    authentication: 'Bearer token in Authorization header (CRON_SECRET)',
    status: 'Active',
  });
}

