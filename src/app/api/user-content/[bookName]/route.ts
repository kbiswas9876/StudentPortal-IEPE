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

// GET - Fetch questions from a specific custom book
export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookName: string }> }
) {
  try {
    const { bookName } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!bookName) {
      return NextResponse.json({ error: 'Book name is required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching questions from custom book:', bookName, 'for user:', userId)

    // Fetch questions from the custom book
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('user_uploaded_questions')
      .select('id, question_text, options, correct_option, solution_text, created_at')
      .eq('user_id', userId)
      .eq('book_name', decodeURIComponent(bookName))
      .order('created_at', { ascending: true })

    if (questionsError) {
      console.error('Error fetching custom book questions:', questionsError)
      return NextResponse.json({ error: questionsError.message }, { status: 500 })
    }

    console.log(`Successfully fetched ${questions?.length || 0} questions from custom book`)

    return NextResponse.json({
      data: questions || []
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a custom book and all its questions
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ bookName: string }> }
) {
  try {
    const { bookName } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!bookName) {
      return NextResponse.json({ error: 'Book name is required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Deleting custom book:', bookName, 'for user:', userId)

    const { error: deleteError } = await supabaseAdmin
      .from('user_uploaded_questions')
      .delete()
      .eq('user_id', userId)
      .eq('book_name', decodeURIComponent(bookName))

    if (deleteError) {
      console.error('Error deleting custom book:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    console.log('Custom book deleted successfully:', bookName)

    return NextResponse.json({
      message: 'Custom book deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
