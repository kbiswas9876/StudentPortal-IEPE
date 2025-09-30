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

    const { data: plans, error: plansError } = await supabaseAdmin
      .from('practice_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (plansError) {
      console.error('Error fetching practice plans:', plansError)
      return NextResponse.json({ error: plansError.message }, { status: 500 })
    }

    console.log(`Successfully fetched ${plans?.length || 0} practice plans`)

    return NextResponse.json({
      data: plans || []
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new practice plan
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, name, plan_type, content } = body

    if (!user_id || !name || !plan_type || !content) {
      return NextResponse.json({ 
        error: 'User ID, name, plan type, and content are required' 
      }, { status: 400 })
    }

    console.log('Creating practice plan:', { user_id, name, plan_type })

    const { data: plan, error: planError } = await supabaseAdmin
      .from('practice_plans')
      .insert({
        user_id,
        name,
        plan_type,
        content
      })
      .select('*')
      .single()

    if (planError) {
      console.error('Error creating practice plan:', planError)
      return NextResponse.json({ error: planError.message }, { status: 500 })
    }

    console.log('Practice plan created successfully:', plan.id)

    return NextResponse.json({
      data: plan
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}