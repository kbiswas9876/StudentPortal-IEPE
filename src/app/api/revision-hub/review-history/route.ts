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
 * GET /api/revision-hub/review-history
 * 
 * Fetches the complete review history for a bookmarked question.
 * NOTE: This endpoint currently returns a placeholder as we don't have a review_history table yet.
 * 
 * In a full implementation, we would:
 * 1. Create a review_history table to log each review with timestamp, performance rating, and SRS state
 * 2. Query that table to build a timeline
 * 3. Show interval progression over time
 * 
 * For now, we return basic bookmark info and a note that history tracking is coming soon.
 * 
 * @query questionId - The question_id to fetch history for
 * @query userId - The user ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');
    const userId = searchParams.get('userId');

    if (!questionId || !userId) {
      return NextResponse.json(
        { error: 'Question ID and User ID are required' },
        { status: 400 }
      );
    }

    // Fetch the current bookmark
    const { data: bookmark, error: bookmarkError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('*')
      .eq('question_id', questionId)
      .eq('user_id', userId)
      .maybeSingle();

    if (bookmarkError) {
      console.error('❌ Error fetching bookmark:', bookmarkError);
      return NextResponse.json(
        { error: bookmarkError.message },
        { status: 500 }
      );
    }

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    // TODO: Query review_history table when implemented
    // For now, return current state only
    const history = {
      currentState: {
        srs_repetitions: bookmark.srs_repetitions,
        srs_ease_factor: bookmark.srs_ease_factor,
        srs_interval: bookmark.srs_interval,
        next_review_date: bookmark.next_review_date,
        created_at: bookmark.created_at,
        updated_at: bookmark.updated_at,
      },
      reviews: [], // Would contain historical review entries
      note: 'Full review history tracking will be available soon. This shows your current SRS state.',
    };

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('❌ Unexpected error in review-history endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

