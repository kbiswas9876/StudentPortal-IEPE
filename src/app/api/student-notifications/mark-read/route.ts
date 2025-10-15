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
 * POST /api/student-notifications/mark-read
 * 
 * Marks one or all notifications as read for the user.
 * 
 * @body notificationId - Optional. If provided, marks only this notification as read.
 *                        If not provided, marks all user notifications as read.
 * @body userId - Required. The user ID.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { notificationId, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('✓ Marking notifications as read:', { notificationId, userId });

    if (notificationId) {
      // Mark single notification as read
      const { error } = await supabaseAdmin
        .from('student_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId); // Security: ensure user owns this notification

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      console.log(`✅ Marked notification ${notificationId} as read`);
    } else {
      // Mark all user notifications as read
      const { error } = await supabaseAdmin
        .from('student_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false); // Only update unread ones for efficiency

      if (error) {
        console.error('❌ Error marking all notifications as read:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      console.log('✅ Marked all notifications as read for user');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Unexpected error in mark-read endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

