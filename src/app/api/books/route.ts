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
    const includeStats = searchParams.get('includeStats') === 'true'

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
    let allBooks = [
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

    // If statistics are requested, fetch them for all official books
    if (includeStats && officialBooks && officialBooks.length > 0) {
      console.log('Fetching statistics for all books...')
      
      // Fetch statistics for all official books in parallel
      const statsPromises = officialBooks.map(async (book) => {
        try {
          // Get chapter and question counts for this book
          const { data: questionsData, error: questionsError } = await supabaseAdmin
            .from('questions')
            .select('chapter_name')
            .eq('book_source', book.name)

          if (questionsError) {
            console.error(`Error fetching questions for book ${book.name}:`, questionsError)
            return {
              bookCode: book.code,
              totalChapters: 0,
              totalQuestions: 0
            }
          }

          if (!questionsData || questionsData.length === 0) {
            return {
              bookCode: book.code,
              totalChapters: 0,
              totalQuestions: 0
            }
          }

          // Group by chapter_name and count
          const chapterCounts = questionsData.reduce((acc, question) => {
            const chapterName = question.chapter_name
            if (chapterName) {
              acc[chapterName] = (acc[chapterName] || 0) + 1
            }
            return acc
          }, {} as Record<string, number>)

          const totalChapters = Object.keys(chapterCounts).length
          const totalQuestions = questionsData.length

          return {
            bookCode: book.code,
            totalChapters,
            totalQuestions
          }
        } catch (error) {
          console.error(`Error processing statistics for book ${book.name}:`, error)
          return {
            bookCode: book.code,
            totalChapters: 0,
            totalQuestions: 0
          }
        }
      })

      // Wait for all statistics to be fetched
      const statsResults = await Promise.all(statsPromises)
      
      // Create a map for quick lookup
      const statsMap = new Map()
      statsResults.forEach(stat => {
        statsMap.set(stat.bookCode, stat)
      })

      // Add statistics to official books
      allBooks = allBooks.map(book => {
        if (book.type === 'official') {
          const stats = statsMap.get(book.code)
          return {
            ...book,
            totalChapters: stats?.totalChapters || 0,
            totalQuestions: stats?.totalQuestions || 0
          }
        }
        return book
      })

      console.log('Statistics fetched for all books:', statsResults)
    }

    console.log(`Fetched ${allBooks.length} books (${officialBooks?.length || 0} official, ${customBooks.length} custom)`)

    return NextResponse.json({ data: allBooks })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}