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

// GET - Fetch leaderboard data for a mock test
export async function GET(
  request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params
    const { searchParams } = new URL(request.url)
    const currentUserId = searchParams.get('userId')

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    if (!currentUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching leaderboard data for test ID:', testId, 'for user:', currentUserId)

    // Fetch all test results for this mock test with ranking
    const { data: leaderboardData, error: leaderboardError } = await supabaseAdmin
      .from('test_results')
      .select(`
        user_id,
        score_percentage,
        total_correct,
        total_incorrect,
        total_skipped,
        submitted_at
      `)
      .eq('mock_test_id', testId)
      .eq('session_type', 'mock_test')
      .order('score_percentage', { ascending: false })

    if (leaderboardError) {
      console.error('Error fetching leaderboard data:', leaderboardError)
      return NextResponse.json({ error: leaderboardError.message }, { status: 500 })
    }

    if (!leaderboardData || leaderboardData.length === 0) {
      return NextResponse.json({ 
        data: {
          leaderboard: [],
          userRank: null,
          totalParticipants: 0
        }
      })
    }

    // Calculate rank and percentile for each user
    const leaderboardWithRanking = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      percentile: Math.round(((leaderboardData.length - index) / leaderboardData.length) * 100)
    }))

    // Find current user's rank
    const userRank = leaderboardWithRanking.find(entry => entry.user_id === currentUserId)

    console.log(`Successfully fetched leaderboard with ${leaderboardData.length} participants`)

    return NextResponse.json({
      data: {
        leaderboard: leaderboardWithRanking,
        userRank: userRank || null,
        totalParticipants: leaderboardData.length
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
