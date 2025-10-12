import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Accept both 'questionId' and legacy 'question_id'
    const rawQuestionId = body.questionId ?? body.question_id

    if (!rawQuestionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    // Get the current user using server client (support Bearer token from client)
    const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    const supabase = await createServerClient(token)
    // Prefer validating using the provided token to avoid reliance on cookie storage on server
    const { data: { user }, error: getUserError } = token
      ? await supabase.auth.getUser(token)
      : await supabase.auth.getUser()

    if (getUserError) {
      console.error('Auth getUser error:', getUserError)
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Resolve to canonical questions.question_id (text)
    let questionIdText: string | null = null

    // If a string is passed, use it directly; if a number (or numeric-string), resolve via questions.id -> question_id
    if (typeof rawQuestionId === 'string') {
      questionIdText = rawQuestionId
      // If string appears to be purely numeric, attempt to resolve via numeric id (defensive)
      if (/^\d+$/.test(rawQuestionId)) {
        const numericId = parseInt(rawQuestionId, 10)
        const { data: qNumData, error: qNumErr } = await supabase
          .from('questions')
          .select('question_id')
          .eq('id', numericId)
          .single()

        if (qNumErr && qNumErr.code !== 'PGRST116') {
          console.error('Error resolving numeric question id to question_id:', {
            error: qNumErr,
            code: qNumErr.code,
            details: (qNumErr as any)?.details,
            hint: (qNumErr as any)?.hint,
          })
          return NextResponse.json({ error: qNumErr.message }, { status: 500 })
        }
        {
          const resolved = qNumData as { question_id?: string } | null
          if (resolved?.question_id) {
            questionIdText = resolved.question_id
          }
        }
      }
    } else if (typeof rawQuestionId === 'number') {
      const { data: qNumData, error: qNumErr } = await supabase
        .from('questions')
        .select('question_id')
        .eq('id', rawQuestionId)
        .single()

      if (qNumErr && qNumErr.code !== 'PGRST116') {
        console.error('Error resolving numeric question id to question_id:', {
          error: qNumErr,
          code: qNumErr.code,
          details: (qNumErr as any)?.details,
          hint: (qNumErr as any)?.hint,
        })
        return NextResponse.json({ error: qNumErr.message }, { status: 500 })
      }
      {
        const resolved = qNumData as { question_id?: string } | null
        questionIdText = resolved?.question_id ?? null
      }
    }

    if (!questionIdText) {
      return NextResponse.json({ error: 'Invalid Question ID' }, { status: 400 })
    }

    // Verify the question_id exists to prevent FK violations
    const { data: qExists, error: qExistsErr } = await supabase
      .from('questions')
      .select('question_id')
      .eq('question_id', questionIdText)
      .single()

    if (qExistsErr && qExistsErr.code !== 'PGRST116') {
      console.error('Error verifying question_id existence:', {
        error: qExistsErr,
        code: qExistsErr.code,
        details: (qExistsErr as any)?.details,
        hint: (qExistsErr as any)?.hint,
      })
      return NextResponse.json({ error: qExistsErr.message }, { status: 500 })
    }

    if (!qExists) {
      // Not found => prevent FK violation with a clear message
      return NextResponse.json({ error: 'Question not found for provided ID' }, { status: 400 })
    }

    // Check if bookmark already exists
    const { data: existingBookmark, error: checkError } = await supabase
      .from('bookmarked_questions')
      .select('id')
      .eq('question_id', questionIdText)
      .eq('user_id', user.id)
      .maybeSingle()

    // Note: Using maybeSingle to avoid throwing on 0 rows; handle other errors explicitly
    if (checkError) {
      console.error('Error checking existing bookmark:', {
        error: checkError,
        code: checkError.code,
        details: (checkError as any)?.details,
        hint: (checkError as any)?.hint,
      })
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existingBookmark) {
      // Remove existing bookmark (toggle off)
      const { error: deleteError } = await supabase
        .from('bookmarked_questions')
        .delete()
        .eq('question_id', questionIdText)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error removing bookmark:', {
          error: deleteError,
          code: deleteError.code,
          details: (deleteError as any)?.details,
          hint: (deleteError as any)?.hint,
        })
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      return NextResponse.json({ message: 'Bookmark removed', bookmarked: false })
    } else {
      // Add new bookmark (toggle on)
      const { error: insertError } = await supabase
        .from('bookmarked_questions')
        // Cast payload to any to satisfy TS until generated types include this table under public.Tables
        .insert([{ question_id: questionIdText, user_id: user.id }] as any)

      if (insertError) {
        // Race condition handling: if duplicate key error (23505), treat as success
        // This happens when concurrent requests both try to insert the same bookmark
        if (insertError.code === '23505') {
          console.warn('Bookmark already exists (race condition handled):', {
            user_id: user.id,
            question_id: questionIdText
          })
          // Return success since the bookmark exists (which was the intended outcome)
          return NextResponse.json({ message: 'Bookmark already exists', bookmarked: true })
        }
        
        console.error('Error adding bookmark:', {
          error: insertError,
          code: insertError.code,
          details: (insertError as any)?.details,
          hint: (insertError as any)?.hint,
        })
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ message: 'Bookmark added', bookmarked: true })
    }
  } catch (error) {
    // Ensure full error visibility
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
