import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, fullName, email, phone, dob, state, city, targetExam, studentCategory } = body

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and Email are required' }, { status: 400 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          full_name: fullName,
          email: email,
          phone_number: phone,
          date_of_birth: dob || null,
          state: state || null,
          city: city || null,
          target_exam: targetExam || null,
          student_category: studentCategory || null,
          status: 'pending',
          role: 'student',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving user profile during registration:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    console.error('Unexpected error in register route:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
