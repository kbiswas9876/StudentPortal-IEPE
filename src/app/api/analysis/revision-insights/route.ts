import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resultId = searchParams.get('resultId')
    
    if (!resultId) {
      return NextResponse.json({ error: 'Result ID is required' }, { status: 400 })
    }

    console.log('Fetching revision insights for result ID:', resultId)
    
    // Get the test result
    const { data: testResult, error: testError } = await supabaseAdmin
      .from('test_results')
      .select('*')
      .eq('id', resultId)
      .single()

    if (testError || !testResult) {
      console.error('Error fetching test result:', testError)
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
    }

    // Get answer log for this test result
    const { data: answerLog, error: answerError } = await supabaseAdmin
      .from('answer_log')
      .select('*')
      .eq('result_id', resultId)

    if (answerError) {
      console.error('Error fetching answer log:', answerError)
      return NextResponse.json({ error: 'Failed to fetch answer log' }, { status: 500 })
    }

    if (!answerLog || answerLog.length === 0) {
      return NextResponse.json({ error: 'No answer log found' }, { status: 404 })
    }

    // Get questions for this test result
    const questionIds = answerLog.map(log => log.question_id)
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .in('id', questionIds)

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    const userId = testResult.user_id
    const testCreatedAt = testResult.created_at

    // Calculate mastery insights for each question
    const masteryInsights = await Promise.all(
      answerLog.map(async (log: any) => {
        const questionId = log.question_id
        
        // Get the most recent previous attempt for this question
        const { data: previousAttempt } = await supabaseAdmin
          .from('answer_log')
          .select('status, time_taken, created_at')
          .eq('user_id', userId)
          .eq('question_id', questionId)
          .lt('created_at', testCreatedAt)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Calculate mastery scores
        const getMasteryScore = (status: string) => {
          switch (status) {
            case 'correct': return 2
            case 'incorrect': return -1
            case 'skipped': return 0
            default: return 0
          }
        }

        const currentScore = getMasteryScore(log.status)
        const previousScore = previousAttempt ? getMasteryScore(previousAttempt.status) : null

        // Determine mastery momentum
        let momentum: 'improved' | 'declined' | 'maintained' | 'first-attempt' = 'first-attempt'
        if (previousScore !== null) {
          if (currentScore > previousScore) {
            momentum = 'improved'
          } else if (currentScore < previousScore) {
            momentum = 'declined'
          } else {
            momentum = 'maintained'
          }
        }

        // Calculate speed improvement (only for correct answers in both attempts)
        let speedImprovement: number | null = null
        if (previousAttempt && log.status === 'correct' && previousAttempt.status === 'correct') {
          speedImprovement = previousAttempt.time_taken - log.time_taken
        }

        // Find the question details
        const question = questions?.find(q => q.id === questionId)

        return {
          questionId,
          questionText: question?.question_text || '',
          chapter: question?.chapter || '',
          currentStatus: log.status,
          currentTime: log.time_taken,
          currentScore,
          previousStatus: previousAttempt?.status || null,
          previousTime: previousAttempt?.time_taken || null,
          previousScore,
          momentum,
          speedImprovement,
          isFirstAttempt: !previousAttempt
        }
      })
    )

    // Calculate overall metrics
    const totalQuestions = masteryInsights.length
    const questionsWithHistory = masteryInsights.filter(q => !q.isFirstAttempt)
    const firstAttemptQuestions = masteryInsights.filter(q => q.isFirstAttempt)

    // Mastery momentum breakdown
    const momentumBreakdown = {
      improved: masteryInsights.filter(q => q.momentum === 'improved').length,
      declined: masteryInsights.filter(q => q.momentum === 'declined').length,
      maintained: masteryInsights.filter(q => q.momentum === 'maintained').length,
      firstAttempt: firstAttemptQuestions.length
    }

    // Calculate overall mastery improvement
    const totalMasteryChange = masteryInsights.reduce((sum, q) => {
      if (q.isFirstAttempt) return sum
      return sum + (q.currentScore - (q.previousScore || 0))
    }, 0)

    const averageMasteryImprovement = questionsWithHistory.length > 0 
      ? Math.round((totalMasteryChange / questionsWithHistory.length) * 50) // Convert to percentage-like scale
      : 0

    // Calculate speed trends
    const speedComparisons = masteryInsights.filter(q => q.speedImprovement !== null)
    const averageSpeedImprovement = speedComparisons.length > 0
      ? Math.round(speedComparisons.reduce((sum, q) => sum + (q.speedImprovement || 0), 0) / speedComparisons.length)
      : 0

    // Find biggest improvement and persistent weakness
    const biggestImprovement = masteryInsights
      .filter(q => q.momentum === 'improved')
      .sort((a, b) => (b.currentScore - (b.previousScore || 0)) - (a.currentScore - (a.previousScore || 0)))[0]

    const persistentWeakness = masteryInsights
      .filter(q => q.currentStatus === 'incorrect' && q.momentum === 'maintained')
      .sort((a, b) => (b.previousScore || 0) - (a.previousScore || 0))[0]

    // Generate key takeaway
    const generateKeyTakeaway = () => {
      if (questionsWithHistory.length === 0) {
        return "Great start! This is your first review of these questions. Complete another session to unlock detailed performance trends."
      }

      const accuracyTrend = momentumBreakdown.improved > momentumBreakdown.declined ? 'improving' : 'declining'
      const speedTrend = averageSpeedImprovement > 0 ? 'faster' : 'slower'
      
      if (momentumBreakdown.improved > 0 && averageSpeedImprovement > 0) {
        return `Excellent progress! You're getting more questions correct and solving them faster. Keep up the great work!`
      } else if (momentumBreakdown.improved > 0 && averageSpeedImprovement < 0) {
        return `Your accuracy is improving, but you're taking longer to solve questions. Focus on speed for familiar concepts.`
      } else if (momentumBreakdown.declined > momentumBreakdown.improved) {
        return `Some concepts need more review. Focus on understanding the questions you got wrong.`
      } else {
        return `You're maintaining your performance level. Consider challenging yourself with more difficult questions.`
      }
    }

    const insights = {
      totalQuestions,
      questionsWithHistory: questionsWithHistory.length,
      firstAttemptQuestions: firstAttemptQuestions.length,
      momentumBreakdown,
      averageMasteryImprovement,
      averageSpeedImprovement,
      biggestImprovement,
      persistentWeakness,
      keyTakeaway: generateKeyTakeaway(),
      hasHistoricalData: questionsWithHistory.length > 0
    }

    console.log('Revision insights calculated successfully:', insights)
    return NextResponse.json({ data: insights })

  } catch (error) {
    console.error('Error fetching revision insights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
