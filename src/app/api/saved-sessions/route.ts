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

// GET - Fetch saved sessions for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('saved_practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved sessions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Save a new session
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, sessionName, sessionState } = body

    if (!userId || !sessionName || !sessionState) {
      return NextResponse.json({ 
        error: 'User ID, session name, and session state are required' 
      }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('saved_practice_sessions')
      .insert({
        user_id: userId,
        session_name: sessionName,
        session_state: sessionState
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving session:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update an existing saved session
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    const body = await request.json()
    const { userId, sessionName, sessionState } = body

    if (!sessionId || !userId || !sessionName || !sessionState) {
      return NextResponse.json({ 
        error: 'Session ID, User ID, session name, and session state are required' 
      }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('saved_practice_sessions')
      .update({
        session_name: sessionName,
        session_state: sessionState,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating session:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a saved session
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    if (!sessionId || !userId) {
      return NextResponse.json({ 
        error: 'Session ID and User ID are required' 
      }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('saved_practice_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting session:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
