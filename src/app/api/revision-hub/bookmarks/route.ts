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

// GET - Fetch all bookmarked questions for a user with performance data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching bookmarked questions with performance data for user:', userId)

    // Stage 1: Fetch bookmarked questions and their content using CORRECTED JOIN
    // First get bookmarks
    const { data: bookmarks, error: bookmarkError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (bookmarkError) {
      console.error('Error fetching bookmarked questions:', bookmarkError)
      return NextResponse.json({ error: bookmarkError.message }, { status: 500 })
    }

    if (!bookmarks || bookmarks.length === 0) {
      console.log('No bookmarked questions found')
      return NextResponse.json({ data: [] })
    }

    // Then get questions using the CORRECTED JOIN on question_id (text)
    const questionIds = bookmarks.map(b => b.question_id)
    const { data: questions, error: questionError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .in('question_id', questionIds)

    if (questionError) {
      console.error('Error fetching questions:', questionError)
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    // Combine the data
    const bookmarkedData = bookmarks.map(bookmark => ({
      ...bookmark,
      questions: questions?.find(q => q.question_id === bookmark.question_id)
    }))

    // Stage 2: Extract question IDs and fetch performance history
    const performanceQuestionIds = bookmarkedData
      .map(item => item.questions?.id) // Use numeric ID from questions table for answer_log
      .filter(id => id !== undefined)

    console.log(`Fetching performance data for ${performanceQuestionIds.length} questions`)

    const { data: performanceData, error: performanceError } = await supabaseAdmin
      .from('answer_log')
      .select('question_id, status, time_taken, result_id')
      .eq('user_id', userId)
      .in('question_id', performanceQuestionIds)

    if (performanceError) {
      console.error('Error fetching performance data:', performanceError)
      // Continue without performance data rather than failing completely
    }

    // Stage 3: Combine data and calculate metrics
    const bookmarkedQuestions = bookmarkedData.map(item => {
      const questionId = item.questions?.id
      const questionPerformance = performanceData?.filter(p => p.question_id === questionId) || []
      
      // Calculate performance metrics
      const totalAttempts = questionPerformance.length
      const correctAttempts = questionPerformance.filter(p => p.status === 'correct').length
      const successRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
      
      // Get the most recent attempt
      const lastAttempt = questionPerformance.length > 0 ? questionPerformance[0] : null
      const lastAttemptStatus = lastAttempt ? lastAttempt.status : 'never_attempted'
      const lastAttemptTime = lastAttempt ? lastAttempt.time_taken : null

      // Calculate time trend (only if there are 2+ attempts)
      let timeTrend: 'faster' | 'slower' | 'none' | null = null
      if (questionPerformance.length >= 2) {
        const recentTime = lastAttemptTime
        const previousAttempts = questionPerformance.slice(1) // All attempts except the most recent
        const previousTimes = previousAttempts.map(p => p.time_taken).filter(t => t !== null)
        
        if (recentTime !== null && previousTimes.length > 0) {
          const averagePreviousTime = previousTimes.reduce((sum, time) => sum + time, 0) / previousTimes.length
          const timeDifference = recentTime - averagePreviousTime
          
          // Use a 10% threshold to determine if the change is significant
          const threshold = averagePreviousTime * 0.1
          if (timeDifference < -threshold) {
            timeTrend = 'faster'
          } else if (timeDifference > threshold) {
            timeTrend = 'slower'
          } else {
            timeTrend = 'none'
          }
        }
      }

      return {
        ...item.questions, // Spread question details
        personal_note: item.personal_note,
        custom_tags: item.custom_tags,
        bookmark_id: item.id,
        // Performance metrics
        performance: {
          total_attempts: totalAttempts,
          correct_attempts: correctAttempts,
          success_rate: successRate,
          last_attempt_status: lastAttemptStatus,
          last_attempt_time: lastAttemptTime,
          last_attempt_date: null, // Will be available after database schema update
          time_trend: timeTrend
        }
      }
    })

    console.log(`Successfully fetched ${bookmarkedQuestions.length} bookmarked questions with performance data`)
    return NextResponse.json({ data: bookmarkedQuestions })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}