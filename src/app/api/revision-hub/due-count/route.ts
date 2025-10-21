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
 * GET /api/revision-hub/due-count
 * 
 * Lightweight endpoint that returns only the count of due questions for a user.
 * This is optimized for polling and real-time updates in the UI.
 * 
 * @query userId - The ID of the user (required)
 * @returns Count of due questions
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Count due bookmarks using the same logic as due-questions endpoint
    const { count, error } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .or(`and(is_custom_reminder_active.eq.true,custom_next_review_date.lte.${today}),and(is_custom_reminder_active.eq.false,next_review_date.lte.${today}),and(is_custom_reminder_active.eq.false,next_review_date.is.null)`);

    if (error) {
      console.error('❌ Error fetching due count:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count: count || 0,
      date: today,
    });
  } catch (error) {
    console.error('❌ Unexpected error in due-count endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

