import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, fullName, phone, dob, state, city, targetExam, studentCategory } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Reset status to 'pending', clear rejection_reason, and update corrected profile details
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        full_name: fullName,
        phone_number: phone,
        date_of_birth: dob || null,
        state: state || null,
        city: city || null,
        target_exam: targetExam || null,
        student_category: studentCategory || null,
        status: 'pending', // Re-enters Pending Approval queue in Admin Panel
        rejection_reason: null, // Clear past rejection message
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error resubmitting student profile:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    console.error('Unexpected error in resubmit route:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
