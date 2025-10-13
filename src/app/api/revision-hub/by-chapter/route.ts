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

// GET - Fetch bookmarked questions for a specific chapter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const chapterName = searchParams.get('chapterName')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!chapterName) {
      return NextResponse.json({ error: 'Chapter name is required' }, { status: 400 })
    }

    console.log('Fetching bookmarked questions for:', { userId, chapterName })

    // Fetch bookmarks for the user
    const { data: bookmarks, error: bookmarkError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (bookmarkError) {
      console.error('Error fetching bookmarks:', bookmarkError)
      return NextResponse.json({ error: bookmarkError.message }, { status: 500 })
    }

    if (!bookmarks || bookmarks.length === 0) {
      console.log('No bookmarks found')
      return NextResponse.json({ data: [] })
    }

    // Get question IDs from bookmarks
    const questionIds = bookmarks.map(b => b.question_id)

    // Fetch questions filtered by chapter only (chapter-first approach)
    const { data: questions, error: questionError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .in('question_id', questionIds)
      .eq('chapter_name', chapterName)

    if (questionError) {
      console.error('Error fetching questions:', questionError)
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    // Combine bookmark data with question data
    const bookmarkedQuestions = bookmarks
      .map(bookmark => {
        const question = questions?.find(q => q.question_id === bookmark.question_id)
        if (!question) return null

        return {
          ...bookmark,
          questions: question
        }
      })
      .filter(item => item !== null)

    // Fetch performance data for these questions
    const performanceQuestionIds = bookmarkedQuestions
      .map(item => item?.questions?.id)
      .filter(id => id !== undefined) as number[]

    console.log(`Fetching performance data for ${performanceQuestionIds.length} questions`)

    const { data: performanceData, error: performanceError } = await supabaseAdmin
      .from('answer_log')
      .select('question_id, status, time_taken, created_at')
      .eq('user_id', userId)
      .in('question_id', performanceQuestionIds)
      .order('created_at', { ascending: false })

    if (performanceError) {
      console.error('Error fetching performance data:', performanceError)
      // Continue without performance data
    }

    // Calculate performance metrics for each question
    const enrichedQuestions = bookmarkedQuestions.map(item => {
      if (!item) return null

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
      const lastAttemptDate = lastAttempt ? lastAttempt.created_at : null

      // Calculate time trend
      let timeTrend: 'faster' | 'slower' | 'none' | null = null
      if (questionPerformance.length >= 2) {
        const recentTime = lastAttemptTime
        const previousAttempts = questionPerformance.slice(1)
        const previousTimes = previousAttempts.map(p => p.time_taken).filter(t => t !== null)
        
        if (recentTime !== null && previousTimes.length > 0) {
          const averagePreviousTime = previousTimes.reduce((sum, time) => sum + time, 0) / previousTimes.length
          const timeDifference = recentTime - averagePreviousTime
          
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
        id: item.id,
        user_id: item.user_id,
        question_id: item.question_id,
        personal_note: item.personal_note,
        custom_tags: item.custom_tags,
        user_difficulty_rating: item.user_difficulty_rating || null,
        created_at: item.created_at,
        updated_at: item.updated_at,
        questions: item.questions,
        performance: {
          total_attempts: totalAttempts,
          correct_attempts: correctAttempts,
          success_rate: successRate,
          last_attempt_status: lastAttemptStatus,
          last_attempt_time: lastAttemptTime,
          last_attempt_date: lastAttemptDate,
          time_trend: timeTrend
        }
      }
    }).filter(item => item !== null)

    console.log(`Successfully fetched ${enrichedQuestions.length} bookmarked questions for chapter`)
    return NextResponse.json({ data: enrichedQuestions })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

