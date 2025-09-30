import { NextResponse } from 'next/server'

// GET - Download template file for custom questions
export async function GET() {
  try {
    console.log('Generating template file for custom questions')

    // Create the template content
    const templateContent = `{"question_text": "What is 2+2?", "options": {"a": "3", "b": "4", "c": "5", "d": "6"}, "correct_option": "b", "solution_text": "The answer is 4 because it is a fundamental principle of arithmetic."}
{"question_text": "Which of the following is a prime number?", "options": {"a": "4", "b": "6", "c": "7", "d": "8"}, "correct_option": "c", "solution_text": "7 is a prime number because it has no positive divisors other than 1 and itself."}
{"question_text": "What is the capital of France?", "options": {"a": "London", "b": "Berlin", "c": "Paris", "d": "Madrid"}, "correct_option": "c", "solution_text": "Paris is the capital and largest city of France."}`

    // Create response with the template file
    const response = new NextResponse(templateContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="questions_template.jsonl"',
        'Cache-Control': 'no-cache'
      }
    })

    console.log('Template file generated successfully')
    return response
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
