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

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    console.log('Fetching practice plan:', planId)

    const { data, error } = await supabaseAdmin
      .from('practice_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error) {
      console.error('Error fetching practice plan:', error)
      return NextResponse.json({ error: 'Practice plan not found' }, { status: 404 })
    }

    console.log('Successfully fetched practice plan:', data)

    return NextResponse.json({ data })
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
    const { userId, name, planType, content } = body

    if (!planId || !userId) {
      return NextResponse.json({ error: 'Plan ID and User ID are required' }, { status: 400 })
    }

    console.log('Updating practice plan:', { planId, userId, name, planType })

    const updateData: any = {}
    if (name) updateData.name = name
    if (planType) updateData.plan_type = planType
    if (content) updateData.content = content

    const { data, error } = await supabaseAdmin
      .from('practice_plans')
      .update(updateData)
      .eq('id', planId)
      .eq('user_id', userId) // Ensure user can only update their own plans
      .select()

    if (error) {
      console.error('Error updating practice plan:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Practice plan not found or access denied' }, { status: 404 })
    }

    console.log('Successfully updated practice plan:', data[0])

    return NextResponse.json({ 
      data: data[0],
      message: 'Practice plan updated successfully' 
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

    if (!planId || !userId) {
      return NextResponse.json({ error: 'Plan ID and User ID are required' }, { status: 400 })
    }

    console.log('Deleting practice plan:', { planId, userId })

    const { error } = await supabaseAdmin
      .from('practice_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', userId) // Ensure user can only delete their own plans

    if (error) {
      console.error('Error deleting practice plan:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Successfully deleted practice plan:', planId)

    return NextResponse.json({ 
      message: 'Practice plan deleted successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
