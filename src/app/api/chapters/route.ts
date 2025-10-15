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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookCode = searchParams.get('bookCode')

    if (!bookCode) {
      return NextResponse.json({ error: 'Book code is required' }, { status: 400 })
    }

    // First, get the book name from the book_sources table using the code
    const { data: bookData, error: bookError } = await supabaseAdmin
      .from('book_sources')
      .select('name')
      .eq('code', bookCode)
      .single()

    if (bookError || !bookData) {
      console.error('Error fetching book name:', bookError)
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Now query questions using the book name (not code)
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('chapter_name')
      .eq('book_source', bookData.name)

    if (error) {
      console.error('Error fetching chapters:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Group by chapter_name and count (matching admin panel approach)
    const chapterCounts = data.reduce((acc, question) => {
      const chapterName = question.chapter_name
      if (chapterName) {
        acc[chapterName] = (acc[chapterName] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const chapterData = Object.entries(chapterCounts).map(([chapter_name, count]) => ({
      chapter_name,
      count
    })).sort((a, b) => a.chapter_name.localeCompare(b.chapter_name))

    return NextResponse.json({ data: chapterData })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}