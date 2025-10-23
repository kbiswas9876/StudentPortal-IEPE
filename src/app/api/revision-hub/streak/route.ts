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
 * GET /api/revision-hub/streak
 * 
 * Calculates user's review streak and returns 90-day activity history.
 * 
 * Streak Logic:
 * - Any day with reviews_completed > 0 counts toward the streak
 * - Current streak: consecutive days from today backwards
 * - Longest streak: maximum consecutive days in entire history
 * 
 * @query userId - The ID of the user (required)
 * @returns { currentStreak, longestStreak, last90Days: Array<{date, count}> }
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

    console.log('📊 Fetching streak data for user:', userId);

    // Get today's date for reference
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate date 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const startDate = ninetyDaysAgo.toISOString().split('T')[0];

    // ============================================================================
    // STEP 1: Fetch all review summary data, ordered by date DESC
    // ============================================================================
    
    const { data: allSummaries, error: allError } = await supabaseAdmin
      .from('daily_review_summary')
      .select('date, reviews_completed')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching review summaries:', allError);
      return NextResponse.json(
        { error: allError.message },
        { status: 500 }
      );
    }

    // ============================================================================
    // STEP 2: Calculate Current Streak
    // ============================================================================
    
    let currentStreak = 0;
    
    if (allSummaries && allSummaries.length > 0) {
      // Start from today and count backwards
      let checkDate = new Date(today);
      
      for (const summary of allSummaries) {
        const summaryDate = summary.date;
        const expectedDate = checkDate.toISOString().split('T')[0];
        
        // If this summary is for the date we're checking
        if (summaryDate === expectedDate) {
          if (summary.reviews_completed > 0) {
            currentStreak++;
            // Move to previous day
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            // Day with 0 reviews breaks the streak
            break;
          }
        } else if (summaryDate < expectedDate) {
          // Gap in data (no reviews on expected date), streak broken
          break;
        }
        // If summaryDate > expectedDate, keep looking for our expected date
      }
    }

    // ============================================================================
    // STEP 3: Calculate Longest Streak
    // ============================================================================
    
    let longestStreak = 0;
    let tempStreak = 0;
    let previousDate: Date | null = null;

    if (allSummaries && allSummaries.length > 0) {
      // Sort by date ascending for this calculation
      const sortedAsc = [...allSummaries].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      for (const summary of sortedAsc) {
        if (summary.reviews_completed > 0) {
          const currentDate = new Date(summary.date);
          
          if (previousDate === null) {
            // First day with reviews
            tempStreak = 1;
          } else {
            // Check if current date is consecutive with previous
            const daysDiff = Math.floor(
              (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (daysDiff === 1) {
              // Consecutive day
              tempStreak++;
            } else {
              // Gap, reset streak
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          }
          
          previousDate = currentDate;
          longestStreak = Math.max(longestStreak, tempStreak);
        }
      }
    }

    // ============================================================================
    // STEP 4: Get Last 90 Days of Activity
    // ============================================================================
    
    const { data: last90Summaries, error: recentError } = await supabaseAdmin
      .from('daily_review_summary')
      .select('date, reviews_completed')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', today)
      .order('date', { ascending: true });

    if (recentError) {
      console.error('❌ Error fetching recent summaries:', recentError);
      return NextResponse.json(
        { error: recentError.message },
        { status: 500 }
      );
    }

    // Create a complete 90-day array (fill gaps with 0s)
    const last90Days = [];
    const dataMap = new Map(
      (last90Summaries || []).map(s => [s.date, s.reviews_completed])
    );

    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      last90Days.push({
        date: dateStr,
        count: dataMap.get(dateStr) || 0,
      });
    }

    // ============================================================================
    // STEP 5: Return Results
    // ============================================================================

    console.log('✅ Streak calculation complete:', {
      currentStreak,
      longestStreak,
      daysWithData: last90Days.filter(d => d.count > 0).length,
    });

    return NextResponse.json({
      success: true,
      data: {
        currentStreak,
        longestStreak,
        last90Days,
      },
    });

  } catch (error) {
    console.error('❌ Unexpected error in streak endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

