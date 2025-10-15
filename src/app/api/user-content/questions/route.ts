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

// GET - Fetch questions from a custom book
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const bookName = searchParams.get('bookName')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!bookName) {
      return NextResponse.json({ error: 'Book name is required' }, { status: 400 })
    }

    console.log('Fetching questions from custom book:', bookName, 'for user:', userId)

    // Fetch questions from the custom book
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('user_uploaded_questions')
      .select('id, question_text, options, correct_option, solution_text, created_at')
      .eq('user_id', userId)
      .eq('book_name', bookName)
      .order('created_at', { ascending: true })

    if (questionsError) {
      console.error('Error fetching custom book questions:', questionsError)
      return NextResponse.json({ error: questionsError.message }, { status: 500 })
    }

    // Transform the data to match the expected format for the practice interface
    const transformedQuestions = (questions || []).map((question: any) => ({
      id: question.id,
      question_text: question.question_text,
      options: question.options,
      correct_option: question.correct_option,
      solution_text: question.solution_text,
      book_id: `custom-${bookName}`,
      chapter_id: 'custom-chapter', // Custom books don't have chapters
      subject: 'Custom',
      difficulty: 'medium', // Default difficulty for custom questions
      created_at: question.created_at
    }))

    console.log(`Successfully fetched ${transformedQuestions.length} questions from custom book`)

    return NextResponse.json({
      data: transformedQuestions
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
