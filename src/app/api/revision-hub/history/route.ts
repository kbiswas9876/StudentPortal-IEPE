import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')
    
    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    // Extract auth token from Authorization header
    const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    const supabase = await createServerClient(token)
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First, get the numeric question ID from the questions table
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('id')
      .eq('question_id', questionId)
      .single()

    if (questionError || !questionData) {
      console.error('Error fetching question data:', questionError)
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    const numericQuestionId = (questionData as any).id

    // Fetch bookmark details for the question
    const { data: bookmarkData, error: bookmarkError } = await supabase
      .from('bookmarked_questions')
      .select('*')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .single()

    // Fetch attempt history for the question using numeric ID
    const { data: attemptHistory, error: attemptError } = await supabase
      .from('answer_log')
      .select('status, time_taken, created_at')
      .eq('user_id', user.id)
      .eq('question_id', numericQuestionId)
      .order('created_at', { ascending: true })

    if (bookmarkError && bookmarkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is acceptable
      console.error('Error fetching bookmark data:', bookmarkError)
      return NextResponse.json(
        { error: 'Failed to fetch bookmark data' },
        { status: 500 }
      )
    }

    if (attemptError) {
      console.error('Error fetching attempt history:', attemptError)
      return NextResponse.json(
        { error: 'Failed to fetch attempt history' },
        { status: 500 }
      )
    }

    // Return combined data
    return NextResponse.json({
      data: {
        bookmark: bookmarkData || null,
        attemptHistory: attemptHistory || []
      }
    })

  } catch (error) {
    console.error('Error in revision-hub/history API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
