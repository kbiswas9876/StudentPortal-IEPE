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

// GET - Fetch all custom books for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching custom books for user:', userId)

    // Fetch user's custom books with aggregation
    const { data: books, error: booksError } = await supabaseAdmin
      .from('user_uploaded_questions')
      .select('book_name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (booksError) {
      console.error('Error fetching custom books:', booksError)
      return NextResponse.json({ error: booksError.message }, { status: 500 })
    }

    // Process the data to get unique books with question counts
    const bookMap = new Map()
    
    books?.forEach((item: any) => {
      if (!bookMap.has(item.book_name)) {
        bookMap.set(item.book_name, {
          book_name: item.book_name,
          question_count: 0,
          created_at: item.created_at
        })
      }
      bookMap.get(item.book_name).question_count++
    })

    const uniqueBooks = Array.from(bookMap.values())

    console.log(`Successfully fetched ${uniqueBooks.length} custom books`)

    return NextResponse.json({
      data: uniqueBooks
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Upload and process custom questions
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const bookName = formData.get('bookName') as string
    const file = formData.get('file') as File

    if (!userId || !bookName || !file) {
      return NextResponse.json({ 
        error: 'User ID, book name, and file are required' 
      }, { status: 400 })
    }

    console.log('Processing custom questions upload:', { userId, bookName, fileName: file.name })

    // Validate file type
    if (!file.name.endsWith('.jsonl')) {
      return NextResponse.json({ 
        error: 'Only .jsonl files are allowed' 
      }, { status: 400 })
    }

    // Read and parse the file
    const fileContent = await file.text()
    const lines = fileContent.trim().split('\n').filter(line => line.trim())

    if (lines.length === 0) {
      return NextResponse.json({ 
        error: 'File is empty or contains no valid lines' 
      }, { status: 400 })
    }

    // Validate and parse each line
    const questions = []
    const errors = []

    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1
      const line = lines[i].trim()

      if (!line) continue

      try {
        const questionData = JSON.parse(line)

        // Validate required fields
        if (!questionData.question_text) {
          errors.push(`Line ${lineNumber}: 'question_text' is required`)
          continue
        }
        if (!questionData.options || typeof questionData.options !== 'object') {
          errors.push(`Line ${lineNumber}: 'options' must be an object`)
          continue
        }
        if (!questionData.correct_option) {
          errors.push(`Line ${lineNumber}: 'correct_option' is required`)
          continue
        }

        // Validate options structure
        const options = questionData.options
        if (!options.a || !options.b || !options.c || !options.d) {
          errors.push(`Line ${lineNumber}: 'options' must contain keys 'a', 'b', 'c', 'd'`)
          continue
        }

        // Validate correct_option is one of the options
        if (!['a', 'b', 'c', 'd'].includes(questionData.correct_option)) {
          errors.push(`Line ${lineNumber}: 'correct_option' must be 'a', 'b', 'c', or 'd'`)
          continue
        }

        questions.push({
          user_id: userId,
          book_name: bookName,
          question_text: questionData.question_text,
          options: questionData.options,
          correct_option: questionData.correct_option,
          solution_text: questionData.solution_text || null
        })
      } catch (parseError) {
        errors.push(`Line ${lineNumber}: Invalid JSON format`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation errors found',
        details: errors
      }, { status: 400 })
    }

    if (questions.length === 0) {
      return NextResponse.json({ 
        error: 'No valid questions found in the file' 
      }, { status: 400 })
    }

    // Insert questions into database
    const { data: insertedQuestions, error: insertError } = await supabaseAdmin
      .from('user_uploaded_questions')
      .insert(questions)
      .select('id')

    if (insertError) {
      console.error('Error inserting custom questions:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log(`Successfully uploaded ${insertedQuestions?.length || 0} custom questions`)

    return NextResponse.json({
      message: 'Custom questions uploaded successfully',
      data: {
        bookName,
        questionCount: insertedQuestions?.length || 0,
        totalLines: lines.length,
        validQuestions: questions.length
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
