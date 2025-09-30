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

// GET - Export practice plan to PDF
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

    console.log('Exporting practice plan to PDF:', planId, 'for user:', userId)

    // Fetch the practice plan
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

    // For now, return a simple JSON response indicating PDF export is not yet implemented
    // In a full implementation, this would:
    // 1. Fetch all questions referenced in the plan
    // 2. Generate a PDF using a library like pdf-lib or Puppeteer
    // 3. Return the PDF as a downloadable file

    console.log('PDF export requested for plan:', plan.name)
    
    return NextResponse.json({
      message: 'PDF export functionality is not yet implemented',
      plan: {
        id: plan.id,
        name: plan.name,
        plan_type: plan.plan_type,
        days_count: plan.content?.days?.length || 0
      }
    })

    // TODO: Implement actual PDF generation
    // This would involve:
    // 1. Fetching all questions referenced in the plan
    // 2. Creating a PDF document with the questions
    // 3. Including an answer key
    // 4. Returning the PDF as a downloadable file

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
