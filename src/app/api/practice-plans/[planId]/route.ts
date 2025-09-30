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

// GET - Fetch a specific practice plan
export async function GET(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Fetching practice plan:', planId, 'for user:', userId)

    const { data: plan, error: planError } = await supabaseAdmin
      .from('practice_plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', userId)
      .single()

    if (planError) {
      console.error('Error fetching practice plan:', planError)
      return NextResponse.json({ error: planError.message }, { status: 500 })
    }

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    console.log('Practice plan fetched successfully:', plan.name)

    return NextResponse.json({
      data: plan
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a practice plan
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params
    const body = await request.json()
    const { user_id, name, plan_type, content } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    if (!user_id || !name || !plan_type || !content) {
      return NextResponse.json({ 
        error: 'User ID, name, plan type, and content are required' 
      }, { status: 400 })
    }

    console.log('Updating practice plan:', planId)

    const { data: plan, error: planError } = await supabaseAdmin
      .from('practice_plans')
      .update({
        name,
        plan_type,
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)
      .eq('user_id', user_id)
      .select('*')
      .single()

    if (planError) {
      console.error('Error updating practice plan:', planError)
      return NextResponse.json({ error: planError.message }, { status: 500 })
    }

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    console.log('Practice plan updated successfully:', plan.name)

    return NextResponse.json({
      data: plan
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a practice plan
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Deleting practice plan:', planId, 'for user:', userId)

    const { error: deleteError } = await supabaseAdmin
      .from('practice_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error deleting practice plan:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    console.log('Practice plan deleted successfully:', planId)

    return NextResponse.json({
      message: 'Practice plan deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}