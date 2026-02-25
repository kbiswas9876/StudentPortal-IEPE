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

// POST - Create new bookmark with rating, personal note, and custom tags
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { questionId, difficultyRating, customTags, personalNote, userId } = body

    console.log('📝 Create bookmark request received:', { questionId, difficultyRating, customTags, personalNote, userId })

    if (!questionId) {
      console.error('❌ No question ID provided')
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    if (!userId) {
      console.error('❌ No user ID provided')
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Validate rating if provided
    if (difficultyRating !== undefined && difficultyRating !== null && (difficultyRating < 1 || difficultyRating > 5)) {
      console.error('❌ Invalid rating value:', difficultyRating)
      return NextResponse.json({ error: 'Rating must be between 1 and 5, or null' }, { status: 400 })
    }

    // Check if bookmark already exists
    const { data: existingBookmark, error: checkError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('id')
      .eq('question_id', questionId)
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('❌ Error checking existing bookmark:', checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existingBookmark) {
      console.log('📌 Bookmark already exists, updating instead')
      // Update existing bookmark
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (difficultyRating !== undefined) {
        updateData.user_difficulty_rating = difficultyRating
      }
      if (personalNote !== undefined) {
        updateData.personal_note = personalNote || null
      }
      if (customTags !== undefined) {
        updateData.custom_tags = customTags || null
      }

      const { data, error } = await supabaseAdmin
        .from('bookmarked_questions')
        .update(updateData)
        .eq('id', existingBookmark.id)
        .select()

      if (error) {
        console.error('❌ Database error updating bookmark:', error)
        return NextResponse.json({ 
          error: 'Database error: ' + error.message,
          details: error 
        }, { status: 500 })
      }

      console.log('✅ Successfully updated existing bookmark:', data[0])
      return NextResponse.json({ 
        data: data[0],
        message: 'Bookmark updated successfully' 
      })
    }

    // Create new bookmark
    const bookmarkData: any = {
      question_id: questionId,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (difficultyRating !== undefined) {
      bookmarkData.user_difficulty_rating = difficultyRating
    }
    if (personalNote !== undefined) {
      bookmarkData.personal_note = personalNote || null
    }
    if (customTags !== undefined) {
      bookmarkData.custom_tags = customTags || null
    }

    console.log('📦 Creating new bookmark with data:', bookmarkData)

    const { data, error } = await supabaseAdmin
      .from('bookmarked_questions')
      .insert([bookmarkData])
      .select()

    if (error) {
      console.error('❌ Database error creating bookmark:', error)
      return NextResponse.json({ 
        error: 'Database error: ' + error.message,
        details: error 
      }, { status: 500 })
    }

    console.log('✅ Successfully created new bookmark:', data[0])
    return NextResponse.json({ 
      data: data[0],
      message: 'Bookmark created successfully' 
    })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}