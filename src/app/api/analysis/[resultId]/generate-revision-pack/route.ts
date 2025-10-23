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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params

    if (!resultId) {
      return NextResponse.json({ error: 'Result ID is required' }, { status: 400 })
    }

    console.log('Generating revision pack for result ID:', resultId)

    // Fetch all incorrect answers for this result
    const { data: incorrectAnswers, error: answersError } = await supabaseAdmin
      .from('answer_log')
      .select('question_id')
      .eq('result_id', resultId)
      .eq('status', 'incorrect')

    if (answersError) {
      console.error('Error fetching incorrect answers:', answersError)
      return NextResponse.json({ error: 'Failed to fetch incorrect answers' }, { status: 500 })
    }

    if (!incorrectAnswers || incorrectAnswers.length === 0) {
      return NextResponse.json({ 
        questionIds: [],
        message: 'No incorrect answers found. Great job!' 
      })
    }

    // Extract question IDs
    const questionIds = incorrectAnswers.map(answer => answer.question_id)

    // Get topic/chapter breakdown
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('id, chapter_name')
      .in('id', questionIds)

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      // Still return question IDs even if we can't get chapter info
      return NextResponse.json({ 
        questionIds,
        weakTopics: [],
        count: questionIds.length
      })
    }

    // Group by chapter to identify weak topics
    const topicCounts: Record<string, number> = {}
    questions?.forEach(q => {
      if (q.chapter_name) {
        topicCounts[q.chapter_name] = (topicCounts[q.chapter_name] || 0) + 1
      }
    })

    // Sort topics by frequency (most mistakes first)
    const weakTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, count }))

    console.log(`Generated revision pack: ${questionIds.length} questions from ${weakTopics.length} topics`)

    return NextResponse.json({
      questionIds,
      weakTopics,
      count: questionIds.length
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

