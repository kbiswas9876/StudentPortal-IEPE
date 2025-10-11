import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { questionIds } = body

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: 'Question IDs array is required' }, { status: 400 })
    }

    // Get the current user using server client, prefer Bearer token from headers
    const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    const supabase = await createServerClient(token)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all bookmarked questions for this user that match the provided question IDs
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarked_questions')
      .select('question_id')
      .eq('user_id', user.id)
      .in('question_id', questionIds.map(String))

    if (bookmarksError) {
      console.error('Error checking bookmarks:', bookmarksError)
      return NextResponse.json({ error: bookmarksError.message }, { status: 500 })
    }

    // Create a map of question_id -> boolean for quick lookup
    const bookmarkedMap: Record<string, boolean> = {}
    questionIds.forEach((id: number | string) => {
      bookmarkedMap[String(id)] = false
    })

    // Normalize Supabase rows to a typed structure
    const bookmarksRows = (bookmarks ?? []) as { question_id: string }[]

    // Mark bookmarked questions as true
    bookmarksRows.forEach((bookmark) => {
      bookmarkedMap[bookmark.question_id] = true
    })

    return NextResponse.json({ bookmarks: bookmarkedMap })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

