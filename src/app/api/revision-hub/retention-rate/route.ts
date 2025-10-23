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
 * GET /api/revision-hub/retention-rate?userId=xxx
 * 
 * Calculates retention rates broken down by question maturity (Young vs Mature)
 * and time window (Last 7 Days vs Last 30 Days).
 * 
 * Retention Definition:
 * - Successful: performance_rating >= 3 (Good or Easy)
 * - Failed: performance_rating <= 2 (Again or Hard)
 * 
 * Maturity Classification:
 * - Young: interval_at_review < 21 days
 * - Mature: interval_at_review >= 21 days
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

    console.log('📊 Calculating retention rate for user:', userId);

    // Fetch all reviews from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: reviews, error: fetchError } = await supabaseAdmin
      .from('review_history')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (fetchError) {
      console.error('❌ Error fetching review history:', fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${reviews?.length || 0} reviews in last 30 days`);

    // Handle case where there are no reviews
    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        young7Days: null,
        mature7Days: null,
        young30Days: null,
        mature30Days: null,
        overallRetention: 0,
      });
    }

    // Calculate retention for each category
    const categories = {
      young7: { retained: 0, total: 0 },
      mature7: { retained: 0, total: 0 },
      young30: { retained: 0, total: 0 },
      mature30: { retained: 0, total: 0 },
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    reviews.forEach(review => {
      const isYoung = review.interval_at_review < 21;
      const isRetained = review.performance_rating >= 3; // Good or Easy
      const isWithin7Days = new Date(review.created_at) >= sevenDaysAgo;

      // Categorize and count
      if (isWithin7Days) {
        if (isYoung) {
          categories.young7.total++;
          if (isRetained) categories.young7.retained++;
        } else {
          categories.mature7.total++;
          if (isRetained) categories.mature7.retained++;
        }
      }

      // Also count for 30-day window
      if (isYoung) {
        categories.young30.total++;
        if (isRetained) categories.young30.retained++;
      } else {
        categories.mature30.total++;
        if (isRetained) categories.mature30.retained++;
      }
    });

    // Calculate percentages (handle division by zero)
    const calculateRate = (cat: { retained: number; total: number }) =>
      cat.total > 0 ? Math.round((cat.retained / cat.total) * 100) : null;

    const result = {
      young7Days: calculateRate(categories.young7),
      mature7Days: calculateRate(categories.mature7),
      young30Days: calculateRate(categories.young30),
      mature30Days: calculateRate(categories.mature30),
      // Also return current overall retention for circular progress
      overallRetention: reviews.length > 0
        ? Math.round((reviews.filter(r => r.performance_rating >= 3).length / reviews.length) * 100)
        : 0,
    };

    console.log('✅ Retention rates calculated:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Unexpected error in retention-rate endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

