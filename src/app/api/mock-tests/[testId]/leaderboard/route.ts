import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { calculateActualScore, calculateTotalMarks } from '@/lib/scoring'

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

    // Step 1: Fetch total marks for the test
    const totalMarks = await calculateTotalMarks(supabaseAdmin as any, Number(testId));

    // Step 2: Fetch all test results
    const { data: testResults, error: resultsError } = await supabaseAdmin
      .from('test_results')
      .select(`
        id,
        user_id,
        total_correct,
        total_incorrect,
        total_skipped
      `)
      .eq('mock_test_id', testId)
      .eq('session_type', 'mock_test');

    if (resultsError) {
      return NextResponse.json({ error: resultsError.message }, { status: 500 });
    }

    if (!testResults || testResults.length === 0) {
      return NextResponse.json({ data: { leaderboard: [] } });
    }

    // Step 3: Get user profiles
    const userIds = testResults.map(result => result.user_id);
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    if (profilesError) console.error('Error fetching user profiles:', profilesError);
    const userNames = new Map(profiles?.map(p => [p.id, p.full_name]));

    // Step 4: Calculate actual marks for each user and create leaderboard entries
    const leaderboardPromises = testResults.map(async (result) => {
      // Calculate the actual score for each user
      const marksObtained = await calculateActualScore(supabaseAdmin as any, result.id, Number(testId));

      return {
        name: userNames.get(result.user_id) || 'Anonymous',
        user_id: result.user_id,
        marks_obtained: marksObtained,
        total_marks: totalMarks,
        correct: result.total_correct || 0,
        incorrect: result.total_incorrect || 0,
        skipped: result.total_skipped || 0,
      };
    });

    const leaderboardEntries = await Promise.all(leaderboardPromises);

    // Step 5: Sort by marks_obtained (descending) and assign ranks
    leaderboardEntries.sort((a, b) => b.marks_obtained - a.marks_obtained);
    
    const leaderboard = leaderboardEntries.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    return NextResponse.json({
      data: {
        leaderboard: leaderboard,
        totalParticipants: testResults.length,
      }
    });

  } catch (error) {
    console.error('Unexpected error in leaderboard route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
