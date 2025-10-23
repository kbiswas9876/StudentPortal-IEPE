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
 * GET /api/revision-hub/analytics
 * 
 * Comprehensive analytics endpoint for SRS progress tracking.
 * Returns:
 * - Current review streak
 * - Retention rate (% of Good/Easy ratings in last 30 days)
 * - Deck mastery distribution (Learning/Maturing/Mastered)
 * - Upcoming reviews forecast (next 7 days)
 * 
 * @query userId - The ID of the user (required)
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

    console.log('📊 Fetching analytics for user:', userId);

    // We'll need to create a review_history table to track this properly
    // For now, we'll work with what we have in the bookmarked_questions table

    const today = new Date().toISOString().split('T')[0];

    // ============================================================================
    // 1. FETCH ALL USER'S BOOKMARKS
    // ============================================================================
    const { data: bookmarks, error: bookmarksError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('*')
      .eq('user_id', userId);

    if (bookmarksError) {
      console.error('❌ Error fetching bookmarks:', bookmarksError);
      return NextResponse.json(
        { error: bookmarksError.message },
        { status: 500 }
      );
    }

    const totalBookmarks = bookmarks?.length || 0;

    // ============================================================================
    // 2. CALCULATE DECK MASTERY DISTRIBUTION
    // ============================================================================
    // Learning: interval < 7 days
    // Maturing: 7 <= interval <= 30 days
    // Mastered: interval > 30 days

    let learning = 0;
    let maturing = 0;
    let mastered = 0;

    bookmarks?.forEach(bookmark => {
      const interval = bookmark.srs_interval || 0;
      if (interval < 7) {
        learning++;
      } else if (interval <= 30) {
        maturing++;
      } else {
        mastered++;
      }
    });

    // ============================================================================
    // 3. CALCULATE UPCOMING REVIEWS FORECAST
    // ============================================================================
    const forecast = [];
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      const dateStr = targetDate.toISOString().split('T')[0];

      const dueOnDate = bookmarks?.filter(bookmark => {
        const reviewDate = bookmark.is_custom_reminder_active
          ? bookmark.custom_next_review_date
          : bookmark.next_review_date;
        return reviewDate === dateStr;
      }).length || 0;

      forecast.push({
        date: dateStr,
        count: dueOnDate,
      });
    }

    // ============================================================================
    // 4. CALCULATE REVIEW STREAK
    // ============================================================================
    // Note: This requires a review_history table to track daily completions
    // For now, we'll return a placeholder value
    // TODO: Implement proper streak tracking with review_history table
    const currentStreak = 0; // Placeholder

    // ============================================================================
    // 5. CALCULATE RETENTION RATE
    // ============================================================================
    // Note: This also requires review_history to track performance ratings
    // For now, we can estimate based on ease factor
    // Average ease factor > 2.5 suggests good retention
    const totalEaseFactor = bookmarks?.reduce((sum, b) => sum + (b.srs_ease_factor || 2.5), 0) || 0;
    const avgEaseFactor = totalBookmarks > 0 ? totalEaseFactor / totalBookmarks : 2.5;
    
    // Convert ease factor to approximate retention rate
    // Ease factor ranges from 1.3 to ~3.0+
    // We'll map this to a percentage
    const estimatedRetentionRate = Math.min(100, Math.max(0, ((avgEaseFactor - 1.3) / (3.0 - 1.3)) * 100));

    // ============================================================================
    // 6. RETURN ANALYTICS DATA
    // ============================================================================
    // Note: Insights are fetched separately via /api/revision-hub/insights
    // to keep this endpoint fast and focused on core metrics
    const analytics = {
      overview: {
        totalQuestions: totalBookmarks,
        currentStreak,
        retentionRate: Math.round(estimatedRetentionRate),
        averageEaseFactor: Number(avgEaseFactor.toFixed(2)),
      },
      deckMastery: {
        learning: {
          count: learning,
          percentage: totalBookmarks > 0 ? Math.round((learning / totalBookmarks) * 100) : 0,
        },
        maturing: {
          count: maturing,
          percentage: totalBookmarks > 0 ? Math.round((maturing / totalBookmarks) * 100) : 0,
        },
        mastered: {
          count: mastered,
          percentage: totalBookmarks > 0 ? Math.round((mastered / totalBookmarks) * 100) : 0,
        },
      },
      upcomingReviews: forecast,
    };

    console.log('✅ Analytics calculated successfully');

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('❌ Unexpected error in analytics endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

