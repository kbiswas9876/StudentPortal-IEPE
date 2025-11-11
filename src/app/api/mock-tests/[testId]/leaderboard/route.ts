import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params;

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
    }

    // Step 1: Fetch all test results for the given mock test
    const { data: testResults, error: resultsError } = await supabaseAdmin
      .from('test_results')
      .select(`
        user_id,
        score_percentage,
        total_correct,
        total_incorrect,
        total_skipped
      `)
      .eq('mock_test_id', testId)
      .eq('session_type', 'mock_test')
      .order('score_percentage', { ascending: false });

    if (resultsError) {
      console.error('Error fetching leaderboard data:', resultsError);
      return NextResponse.json({ error: resultsError.message }, { status: 500 });
    }

    if (!testResults || testResults.length === 0) {
      return NextResponse.json({ data: { leaderboard: [] } });
    }

    // Step 2: Get all unique user IDs from the results
    const userIds = testResults.map(result => result.user_id);

    // Step 3: Fetch the profiles (names) for all users in the leaderboard
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      // Continue without names if this fails, but log the error
    }

    // Create a map for quick lookup of user names
    const userNames = new Map(profiles?.map(p => [p.id, p.full_name]));

    // Step 4: Process the data to create the final leaderboard
    const totalParticipants = testResults.length;
    const leaderboard = testResults.map((result, index) => {
      const attempted = (result.total_correct || 0) + (result.total_incorrect || 0);
      const accuracy = attempted > 0 ? ((result.total_correct || 0) / attempted) * 100 : 0;
      const rank = index + 1;
      const percentile = totalParticipants > 1 
        ? ((totalParticipants - rank) / (totalParticipants - 1)) * 100 
        : 100;

      return {
        rank: rank,
        name: userNames.get(result.user_id) || 'Anonymous',
        user_id: result.user_id,
        score: result.score_percentage || 0, // Using score_percentage as the main score
        accuracy: accuracy,
        percentile: percentile,
      };
    });

    return NextResponse.json({
      data: {
        leaderboard: leaderboard,
        totalParticipants: totalParticipants,
      }
    });

  } catch (error) {
    console.error('Unexpected error in leaderboard route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}