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

// GET - Fetch mock test data and questions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    console.log('Fetching mock test data for test ID:', testId)

    // Multi-table JOIN query to get test rules and questions with per-question marking
    const { data: testData, error: testError } = await supabaseAdmin
      .from('test_questions')
      .select(`
        test_id,
        question_id,
        marks_per_correct,
        penalty_per_incorrect,
        tests!inner(
          id,
          name,
          description,
          total_time_minutes,
          marks_per_correct,
          negative_marks_per_incorrect,
          status,
          is_dynamically_shuffled
        ),
        questions!inner(
          id,
          question_id,
          book_source,
          chapter_name,
          question_number_in_book,
          question_text,
          options,
          correct_option,
          solution_text,
          exam_metadata,
          admin_tags,
          difficulty,
          created_at
        )
      `)
      .eq('test_id', testId)
      .order('id', { ascending: true })

    if (testError) {
      console.error('Error fetching mock test data:', testError)
      return NextResponse.json({ error: testError.message }, { status: 500 })
    }

    if (!testData || testData.length === 0) {
      return NextResponse.json({ error: 'Test not found or no questions available' }, { status: 404 })
    }

    // Extract test information from the first row
    // testInfo might be an array or object depending on Supabase response
    const testInfoRaw = testData[0].tests
    const testInfo = Array.isArray(testInfoRaw) ? testInfoRaw[0] : testInfoRaw
    // Map questions with their per-question marking (fallback to test-level if null)
    const globalMpc = Number(testInfo?.marks_per_correct) || 0
    const globalPpi = Math.abs(Number(testInfo?.negative_marks_per_incorrect) || 0)
    
    const baseQuestions = testData.map((item: any) => ({
      ...item.questions,
      // Include per-question marking with fallback to test-level
      marks_per_correct: item.marks_per_correct !== null && item.marks_per_correct !== undefined 
        ? Number(item.marks_per_correct) 
        : globalMpc,
      penalty_per_incorrect: item.penalty_per_incorrect !== null && item.penalty_per_incorrect !== undefined 
        ? Math.abs(Number(item.penalty_per_incorrect)) 
        : globalPpi
    }))

    // Dynamic per-user shuffling
    const isDynamicallyShuffled = Boolean(testInfo?.is_dynamically_shuffled)

    // Seeded RNG helpers
    const mulberry32 = (seed: number) => {
      return function() {
        let t = (seed += 0x6d2b79f5)
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }
    const hashString = (s: string) => {
      let h = 2166136261
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
      }
      return h >>> 0
    }
    const shuffleWith = <T,>(arr: T[], rnd: () => number) => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    let questions = baseQuestions
    let question_order: number[] = baseQuestions.map(q => q.id)
    const option_order: Record<string, string[]> = {}

    if (isDynamicallyShuffled) {
      // Derive a deterministic seed using cookies (best-effort) + test id
      const cookiesHeader = request.headers.get('cookie') || ''
      const anonToken = (cookiesHeader.match(/sb:token=([^;]+)/)?.[1]) || 'anon'
      const seedStr = `${anonToken}:${testId}`
      const rnd = mulberry32(hashString(seedStr))

      questions = shuffleWith(baseQuestions, rnd)
      question_order = questions.map(q => q.id)

      for (const q of questions) {
        const keys = Object.keys(q.options || {})
        option_order[String(q.id)] = shuffleWith(keys, rnd)
      }
    } else {
      for (const q of baseQuestions) {
        option_order[String(q.id)] = Object.keys(q.options || {})
      }
    }

    console.log(`Successfully fetched mock test: ${testInfo?.name} with ${questions.length} questions`)

    return NextResponse.json({
      data: {
        test: testInfo,
        questions,
        question_order,
        option_order
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
