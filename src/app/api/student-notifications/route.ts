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
 * GET /api/student-notifications
 * 
 * Fetches the user's 10 most recent notifications.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔔 Fetching notifications for user: ${userId} (limit: ${limit})`);

    const { data: notifications, error } = await supabaseAdmin
      .from('student_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching notifications:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Count unread notifications
    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    console.log(`✅ Found ${notifications?.length || 0} notifications (${unreadCount} unread)`);

    return NextResponse.json({
      data: notifications || [],
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Unexpected error in student-notifications GET:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

