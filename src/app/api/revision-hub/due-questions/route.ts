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
 * GET /api/revision-hub/due-questions
 * 
 * Fetches all bookmarked questions that are due for review for the authenticated user.
 * This endpoint intelligently checks both:
 * - SRS-scheduled review dates
 * - Custom reminder dates (if active)
 * 
 * @query userId - The ID of the user (required)
 * @returns Array of due questions with their IDs and question_ids
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

    console.log('📚 Fetching due questions for user:', userId);

    // Get current date in YYYY-MM-DD format for comparison
    const today = new Date().toISOString().split('T')[0];

    // Query bookmarks that are due for review
    // Logic: A bookmark is due if:
    // 1. Custom reminder is active AND custom_next_review_date <= today
    // OR
    // 2. Custom reminder is NOT active AND next_review_date <= today
    // OR
    // 3. next_review_date is NULL (never been reviewed, should be available immediately)
    
    const { data: dueBookmarks, error } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('id, question_id, is_custom_reminder_active, custom_next_review_date, next_review_date')
      .eq('user_id', userId)
      .or(`and(is_custom_reminder_active.eq.true,custom_next_review_date.lte.${today}),and(is_custom_reminder_active.eq.false,next_review_date.lte.${today}),and(is_custom_reminder_active.eq.false,next_review_date.is.null)`);

    if (error) {
      console.error('❌ Error fetching due questions:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Format the response
    const questions = (dueBookmarks || []).map(bookmark => ({
      id: bookmark.id,
      question_id: bookmark.question_id,
      is_custom_reminder: bookmark.is_custom_reminder_active,
    }));

    console.log(`✅ Found ${questions.length} questions due for review`);
    
    return NextResponse.json({
      questions,
      count: questions.length,
      date: today,
    });
  } catch (error) {
    console.error('❌ Unexpected error in due-questions endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

