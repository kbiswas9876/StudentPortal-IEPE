import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { cookies } from 'next/headers'

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

// GET - Fetch all mock tests and user's attempts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching mock tests and user attempts for user:', userId)

    // Query 1: Fetch all relevant tests with question counts
    const { data: tests, error: testsError } = await supabaseAdmin
      .from('tests')
      .select('*, test_questions(count)')
      .in('status', ['scheduled', 'live', 'completed'])
      .order('start_time', { ascending: true })

    if (testsError) {
      console.error('Error fetching tests:', testsError)
      return NextResponse.json({ error: testsError.message }, { status: 500 })
    }

    // Transform response to flatten question count
    const transformedTests = (tests || []).map((test: any) => ({
      ...test,
      total_questions: test.test_questions?.[0]?.count || 0,
      // Remove the nested test_questions object
      test_questions: undefined
    }))

    // Query 2: Fetch user's attempts with detailed results
    const { data: userAttempts, error: attemptsError } = await supabaseAdmin
      .from('test_results')
      .select(`
        mock_test_id, 
        score_percentage, 
        id,
        total_correct,
        total_incorrect,
        total_questions,
        submitted_at
      `)
      .eq('user_id', userId)
      .eq('session_type', 'mock_test')

    if (attemptsError) {
      console.error('Error fetching user attempts:', attemptsError)
      return NextResponse.json({ error: attemptsError.message }, { status: 500 })
    }

    // Calculate dynamic metrics for each completed test
    const enhancedUserAttempts = await Promise.all(
      (userAttempts || []).map(async (attempt: any) => {
        const test = transformedTests.find(t => t.id === attempt.mock_test_id)
        if (!test) return attempt

        // Calculate Final Score
        console.log(`Test ${attempt.mock_test_id} - Attempt data:`, {
          total_correct: attempt.total_correct,
          total_incorrect: attempt.total_incorrect,
          total_questions: attempt.total_questions,
          marks_per_correct: test.marks_per_correct,
          negative_marks_per_incorrect: test.negative_marks_per_incorrect
        })
        
        const marksObtained = (attempt.total_correct * test.marks_per_correct) - 
                            (attempt.total_incorrect * Math.abs(test.negative_marks_per_incorrect))
        const totalMarks = attempt.total_questions * test.marks_per_correct
        
        console.log(`Test ${attempt.mock_test_id} - Calculated marks:`, {
          marksObtained,
          totalMarks
        })

        // Calculate Rank for this specific test
        const { data: allTestResults, error: rankError } = await supabaseAdmin
          .from('test_results')
          .select('user_id, score_percentage')
          .eq('mock_test_id', attempt.mock_test_id)
          .eq('session_type', 'mock_test')
          .order('score_percentage', { ascending: false })

        if (rankError) {
          console.error('Error fetching rank data:', rankError)
          return { ...attempt, rank: 0, percentile: 0 }
        }

        // Calculate rank
        const userRank = allTestResults.findIndex((result: any) => result.user_id === userId) + 1

        // Calculate Percentile - Correct formula: (Number of users with score < your score / Total participants) * 100
        const usersWithLowerScore = allTestResults.filter((result: any) => 
          result.score_percentage < attempt.score_percentage
        ).length
        const totalTestTakers = allTestResults.length
        const percentile = totalTestTakers > 1 ? (usersWithLowerScore / totalTestTakers) * 100 : 100

        console.log(`Test ${attempt.mock_test_id} - User ${userId}:`, {
          userScore: attempt.score_percentage,
          totalTestTakers,
          userRank,
          usersWithLowerScore,
          percentile
        })

        return {
          ...attempt,
          results: {
            marks_obtained: marksObtained,
            total_marks: totalMarks,
            percentile: percentile,
            rank: userRank,
            total_test_takers: totalTestTakers
          }
        }
      })
    )

    console.log(`Successfully fetched ${transformedTests?.length || 0} tests and ${enhancedUserAttempts?.length || 0} user attempts with dynamic metrics`)

    return NextResponse.json({
      data: {
        tests: transformedTests || [],
        userAttempts: enhancedUserAttempts || []
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
