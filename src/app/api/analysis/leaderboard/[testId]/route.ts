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
    const { testId } = await params
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters with defaults
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const currentUserId = searchParams.get('userId')

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    if (!currentUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 })
    }

    // Fetch total marks for the test
    const totalMarks = await calculateTotalMarks(supabaseAdmin as any, Number(testId))

    // Fetch all test results for the mock test
    const { data: testResults, error: resultsError } = await supabaseAdmin
      .from('test_results')
      .select(`
        id,
        user_id,
        score_percentage,
        total_correct,
        total_incorrect,
        total_skipped,
        total_time_taken
      `)
      .eq('mock_test_id', testId)
      .eq('session_type', 'mock_test')
      .order('score_percentage', { ascending: false })

    if (resultsError) {
      return NextResponse.json({ error: resultsError.message }, { status: 500 })
    }

    if (!testResults || testResults.length === 0) {
      return NextResponse.json({ 
        data: { 
          entries: [], 
          totalEntries: 0,
          currentPage: page,
          totalPages: 0,
          currentUserRank: 0
        } 
      })
    }

    // Calculate actual scores for all users
    const leaderboardPromises = testResults.map(async (result) => {
      const marksObtained = await calculateActualScore(supabaseAdmin as any, result.id, Number(testId))
      
      return {
        resultId: result.id,
        userId: result.user_id,
        score: marksObtained,
        totalMarks: totalMarks,
        correct: result.total_correct || 0,
        incorrect: result.total_incorrect || 0,
        skipped: result.total_skipped || 0,
        timeTaken: result.total_time_taken || 0,
        scorePercentage: result.score_percentage || 0
      }
    })

    const leaderboardData = await Promise.all(leaderboardPromises)

    // Sort by score descending (already sorted by score_percentage, but re-sort by actual score)
    leaderboardData.sort((a, b) => b.score - a.score)

    // Assign ranks
    const rankedLeaderboard = leaderboardData.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }))

    // Find current user's rank
    const userIndex = rankedLeaderboard.findIndex(entry => entry.userId === currentUserId)
    const currentUserRank = userIndex !== -1 ? userIndex + 1 : 0

    // Calculate pagination
    const totalEntries = rankedLeaderboard.length
    const totalPages = Math.ceil(totalEntries / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    // Slice for current page
    const paginatedEntries = rankedLeaderboard.slice(startIndex, endIndex)

    // Anonymize users and format response
    const entries = paginatedEntries.map(entry => ({
      rank: entry.rank,
      userId: entry.userId,
      name: entry.userId === currentUserId ? 'You' : `Student #${entry.rank}`,
      score: entry.score,
      totalMarks: entry.totalMarks,
      correct: entry.correct,
      incorrect: entry.incorrect,
      skipped: entry.skipped,
      timeTaken: entry.timeTaken,
      isCurrentUser: entry.userId === currentUserId
    }))

    return NextResponse.json({
      data: {
        entries,
        totalEntries,
        currentPage: page,
        totalPages,
        currentUserRank
      }
    })

  } catch (error) {
    console.error('Unexpected error in leaderboard route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
