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

// GET - Fetch all bookmarked questions for a user with simple approach
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching bookmarked questions for user:', userId)

    // Step 1: Get bookmarked questions
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
      console.log('No bookmarked questions found')
      return NextResponse.json({ data: [] })
    }

    console.log('Found bookmarks:', bookmarks.length)

    // Step 2: Get question IDs
    const questionIds = bookmarks.map(b => b.question_id)
    console.log('Question IDs to fetch:', questionIds)

    // Step 3: Fetch questions by question_id (text field) - CORRECTED JOIN
    const { data: questions, error: questionError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .in('question_id', questionIds)

    if (questionError) {
      console.error('Error fetching questions:', questionError)
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    console.log('Found questions:', questions?.length || 0)

    // Step 4: Combine the data
    const combinedData = bookmarks.map(bookmark => {
      const question = questions?.find(q => q.question_id === bookmark.question_id)
      return {
        ...question, // Spread question details
        personal_note: bookmark.personal_note,
        custom_tags: bookmark.custom_tags,
        bookmark_id: bookmark.id,
        // Performance metrics (simplified for now)
        performance: {
          total_attempts: 0,
          correct_attempts: 0,
          success_rate: 0,
          last_attempt_status: 'never_attempted',
          last_attempt_time: null,
          last_attempt_date: null
        }
      }
    })

    console.log('Combined data sample:', combinedData[0])
    return NextResponse.json({ data: combinedData })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
