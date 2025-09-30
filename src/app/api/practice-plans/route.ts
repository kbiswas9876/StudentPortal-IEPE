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

// GET - Fetch all practice plans for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching practice plans for user:', userId)

    const { data, error } = await supabaseAdmin
      .from('practice_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching practice plans:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Successfully fetched ${data?.length || 0} practice plans`)

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new practice plan
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, name, planType, content } = body

    if (!userId || !name || !planType || !content) {
      return NextResponse.json({ 
        error: 'User ID, name, plan type, and content are required' 
      }, { status: 400 })
    }

    console.log('Creating practice plan:', { userId, name, planType })

    const { data, error } = await supabaseAdmin
      .from('practice_plans')
      .insert({
        user_id: userId,
        name,
        plan_type: planType,
        content
      })
      .select()

    if (error) {
      console.error('Error creating practice plan:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Successfully created practice plan:', data[0])

    return NextResponse.json({ 
      data: data[0],
      message: 'Practice plan created successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
