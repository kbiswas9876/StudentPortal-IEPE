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

// Cache for book lookups to avoid repeated database queries
const bookCache = new Map<string, string>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookCode, chapterName, mode, values } = body

    console.log('Questions API - Received request:', { bookCode, chapterName, mode, values })

    if (!bookCode || !chapterName) {
      return NextResponse.json({ error: 'Book code and chapter name are required' }, { status: 400 })
    }

    // Check cache first, then fetch from database if not cached
    let bookName = bookCache.get(bookCode)
    if (!bookName) {
      // First, let's see what books are available
      const { data: allBooks, error: allBooksError } = await supabaseAdmin
        .from('book_sources')
        .select('code, name')
      
      if (!allBooksError && allBooks) {
        console.log('Available books in database:', allBooks)
      }

      const { data: bookData, error: bookError } = await supabaseAdmin
        .from('book_sources')
        .select('name')
        .eq('code', bookCode)
        .single()

      if (bookError || !bookData) {
        console.error('Error fetching book name:', bookError)
        console.error('Looking for bookCode:', bookCode)
        return NextResponse.json({ error: 'Book not found' }, { status: 404 })
      }
      
      bookName = bookData.name
      bookCache.set(bookCode, bookName)
    }

    // Build query based on mode (matching admin panel approach)
    let query = supabaseAdmin
      .from('questions')
      .select('question_id, question_number_in_book')
      .eq('book_source', bookName)
      .eq('chapter_name', chapterName)

    if (mode === 'range') {
      const start = values.start || 1
      const end = values.end || 1
      query = query
        .gte('question_number_in_book', start)
        .lte('question_number_in_book', end)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ data: [] })
    }

    let questionIds = data.map(q => q.question_id)

    // For quantity mode, sample randomly (matching admin panel approach)
    if (mode === 'quantity' && values.count) {
      const count = Math.min(values.count, questionIds.length)
      // Shuffle and take the requested count
      questionIds = questionIds.sort(() => 0.5 - Math.random()).slice(0, count)
    }

    return NextResponse.json({ data: questionIds })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}