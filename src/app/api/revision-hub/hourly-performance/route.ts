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
 * GET /api/revision-hub/hourly-performance?userId=xxx
 * 
 * Calculates performance breakdown by time of day, using the user's local timezone.
 * Groups reviews into 4 time blocks: Morning, Afternoon, Evening, Night.
 * 
 * Success Rate: percentage of reviews with rating >= 3 (Good or Easy)
 * 
 * Returns data only if user has reviewed in at least 3 different time blocks.
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

    console.log('⏰ Calculating hourly performance for user:', userId);

    // Fetch user's timezone from preferences
    const { data: preferences, error: prefsError } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('user_timezone')
      .eq('user_id', userId)
      .maybeSingle();

    if (prefsError) {
      console.error('❌ Error fetching user preferences:', prefsError);
    }

    const userTimezone = preferences?.user_timezone || 'UTC';
    console.log(`✅ Using timezone: ${userTimezone}`);

    // Fetch ALL review history for this user
    const { data: reviews, error: fetchError } = await supabaseAdmin
      .from('review_history')
      .select('performance_rating, created_at')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('❌ Error fetching review history:', fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${reviews?.length || 0} total reviews`);

    // Handle case where there are no reviews
    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        hasEnoughData: false,
        performanceByTimeBlock: [],
      });
    }

    // Define 4 time blocks (Decision: Option A)
    const timeBlocks: Record<string, { start: number; end: number; success: number; total: number }> = {
      morning: { start: 6, end: 12, success: 0, total: 0 },   // 6am-11:59am
      afternoon: { start: 12, end: 18, success: 0, total: 0 }, // 12pm-5:59pm
      evening: { start: 18, end: 24, success: 0, total: 0 },   // 6pm-11:59pm
      night: { start: 0, end: 6, success: 0, total: 0 },       // 12am-5:59am
    };

    // Process each review
    reviews.forEach(review => {
      try {
        // Convert UTC timestamp to user's local timezone
        const utcDate = new Date(review.created_at);
        const localDateString = utcDate.toLocaleString('en-US', { timeZone: userTimezone });
        const localDate = new Date(localDateString);
        const localHour = localDate.getHours();

        // Determine which block this review belongs to
        let block: string;
        if (localHour >= 6 && localHour < 12) block = 'morning';
        else if (localHour >= 12 && localHour < 18) block = 'afternoon';
        else if (localHour >= 18 && localHour < 24) block = 'evening';
        else block = 'night';

        // Count review
        timeBlocks[block].total++;
        if (review.performance_rating >= 3) {
          timeBlocks[block].success++;
        }
      } catch (error) {
        console.error('⚠️ Error processing review timestamp:', error);
      }
    });

    // Calculate success rates and format for response
    const results = Object.entries(timeBlocks).map(([name, data]) => ({
      timeBlock: name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      timeRange: getTimeRange(name),
      successRate: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0,
      totalReviews: data.total,
    }));

    // Check if minimum data threshold is met (3+ time blocks with data)
    const blocksWithData = results.filter(b => b.totalReviews > 0).length;
    
    console.log(`✅ Performance calculated across ${blocksWithData} time blocks`);

    return NextResponse.json({
      hasEnoughData: blocksWithData >= 3,
      performanceByTimeBlock: results,
    });
  } catch (error) {
    console.error('❌ Unexpected error in hourly-performance endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getTimeRange(block: string): string {
  const ranges: Record<string, string> = {
    morning: '6:00 AM - 11:59 AM',
    afternoon: '12:00 PM - 5:59 PM',
    evening: '6:00 PM - 11:59 PM',
    night: '12:00 AM - 5:59 AM',
  };
  return ranges[block] || 'Unknown';
}

