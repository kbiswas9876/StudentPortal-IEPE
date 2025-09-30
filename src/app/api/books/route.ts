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
    const userId = searchParams.get('userId')
    const includeCustom = searchParams.get('includeCustom') === 'true'

    // Fetch official books
    const { data: officialBooks, error: officialError } = await supabaseAdmin
      .from('book_sources')
      .select('id, name, code, created_at')
      .order('name')

    if (officialError) {
      console.error('Error fetching official books:', officialError)
      return NextResponse.json({ error: officialError.message }, { status: 500 })
    }

    let customBooks = []
    
    // Fetch custom books if requested and user is provided
    if (includeCustom && userId) {
      const { data: customBooksData, error: customError } = await supabaseAdmin
        .from('user_uploaded_questions')
        .select('book_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (customError) {
        console.error('Error fetching custom books:', customError)
        // Don't fail the entire request if custom books fail
      } else {
        // Process the data to get unique books with question counts
        const bookMap = new Map()
        
        customBooksData?.forEach((item: any) => {
          if (!bookMap.has(item.book_name)) {
            bookMap.set(item.book_name, {
              book_name: item.book_name,
              question_count: 0,
              created_at: item.created_at
            })
          }
          bookMap.get(item.book_name).question_count++
        })

        customBooks = Array.from(bookMap.values())
      }
    }

    // Combine and format the results
    const allBooks = [
      ...(officialBooks || []).map(book => ({
        ...book,
        type: 'official',
        source: 'book_sources'
      })),
      ...(customBooks || []).map((book: any) => ({
        id: `custom-${book.book_name}`,
        name: book.book_name,
        code: `CUSTOM-${book.book_name}`,
        created_at: book.created_at,
        type: 'custom',
        source: 'user_uploaded_questions',
        question_count: book.question_count
      }))
    ]

    console.log(`Fetched ${allBooks.length} books (${officialBooks?.length || 0} official, ${customBooks.length} custom)`)

    return NextResponse.json({ data: allBooks })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}