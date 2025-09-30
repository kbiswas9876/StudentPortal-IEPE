import { NextResponse } from 'next/server'

// GET - Download template file for custom questions
export async function GET() {
  try {
    console.log('Generating template file for custom questions')

    // Create the template content with LaTeX examples
    const templateContent = `{"question_text": "What is $2+2$?", "options": {"a": "3", "b": "4", "c": "5", "d": "6"}, "correct_option": "b", "solution_text": "The answer is 4 because it is a fundamental principle of arithmetic."}
{"question_text": "Which of the following is a prime number?", "options": {"a": "4", "b": "6", "c": "7", "d": "8"}, "correct_option": "c", "solution_text": "7 is a prime number because it has no positive divisors other than 1 and itself."}
{"question_text": "Solve for $x$: $2x + 3 = 7$", "options": {"a": "$x = 1$", "b": "$x = 2$", "c": "$x = 3$", "d": "$x = 4$"}, "correct_option": "b", "solution_text": "To solve $2x + 3 = 7$: Subtract 3 from both sides to get $2x = 4$, then divide by 2 to get $x = 2$."}
{"question_text": "What is the derivative of $f(x) = x^2$?", "options": {"a": "$f'(x) = x$", "b": "$f'(x) = 2x$", "c": "$f'(x) = x^2$", "d": "$f'(x) = 2$"}, "correct_option": "b", "solution_text": "Using the power rule: $\\frac{d}{dx}[x^2] = 2x^{2-1} = 2x$"}
{"question_text": "Find the area of a circle with radius $r = 5$", "options": {"a": "$25\\pi$", "b": "$10\\pi$", "c": "$5\\pi$", "d": "$50\\pi$"}, "correct_option": "a", "solution_text": "The area of a circle is $A = \\pi r^2$. With $r = 5$, we get $A = \\pi(5)^2 = 25\\pi$"}`

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
