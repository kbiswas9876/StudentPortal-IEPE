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

// GET - Fetch unique chapters with bookmarks, grouped by book
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching unique chapters with bookmarks for user:', userId)

    // Fetch all bookmarks for the user
    const { data: bookmarks, error: bookmarkError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select('question_id')
      .eq('user_id', userId)

    if (bookmarkError) {
      console.error('Error fetching bookmarks:', bookmarkError)
      return NextResponse.json({ error: bookmarkError.message }, { status: 500 })
    }

    if (!bookmarks || bookmarks.length === 0) {
      console.log('No bookmarks found')
      return NextResponse.json({ data: [] })
    }

    // Get question IDs
    const questionIds = bookmarks.map(b => b.question_id)

    // Fetch questions to get book sources and chapters
    const { data: questions, error: questionError } = await supabaseAdmin
      .from('questions')
      .select('book_source, chapter_name')
      .in('question_id', questionIds)

    if (questionError) {
      console.error('Error fetching questions:', questionError)
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    // Group bookmarks by chapter (chapter-first approach, regardless of book)
    const chapterCounts: Record<string, number> = {}

    questions?.forEach(question => {
      const { chapter_name } = question

      if (!chapterCounts[chapter_name]) {
        chapterCounts[chapter_name] = 0
      }
      chapterCounts[chapter_name]++
    })

    // Format response as array of chapters with counts
    const formattedResponse = Object.keys(chapterCounts)
      .sort() // Sort alphabetically
      .map(chapterName => ({
        name: chapterName,
        count: chapterCounts[chapterName]
      }))

    console.log(`Found ${formattedResponse.length} unique chapters with bookmarks`)
    return NextResponse.json({ data: formattedResponse })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

