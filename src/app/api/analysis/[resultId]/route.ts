import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { calculateActualScore, calculateTotalMarks } from '@/lib/scoring'

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

// Helper function for safe accuracy calculation
const calculateAccuracy = (correct: number, incorrect: number): number => {
    const attempted = correct + incorrect;
    if (attempted === 0) return 0;
    return (correct / attempted) * 100;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params

    if (!resultId) {
      return NextResponse.json({ error: 'Result ID is required' }, { status: 400 })
    }

    // Fetch current user's test result
    const { data: testResult, error: testError } = await supabaseAdmin
      .from('test_results')
      .select('*')
      .eq('id', resultId)
      .single()

    if (testError) {
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
    }

    // --- START: Refined Rank, Percentile, and Topper Comparison Logic ---
    let resultsData = {}
    let topperComparisonData = null
    let topperData = null

    if (testResult.session_type === 'mock_test' && testResult.mock_test_id) {
        const marksObtained = await calculateActualScore(supabaseAdmin as any, Number(resultId), Number(testResult.mock_test_id))
        const totalMarks = await calculateTotalMarks(supabaseAdmin as any, Number(testResult.mock_test_id))

        const { data: allTestResults, error: rankError } = await supabaseAdmin
          .from('test_results')
          .select('id, user_id, score_percentage, total_correct, total_incorrect, total_skipped, mock_test_id')
          .eq('mock_test_id', testResult.mock_test_id)
          .eq('session_type', 'mock_test')
          .order('score_percentage', { ascending: false })

        if (!rankError && allTestResults) {
            const totalTestTakers = allTestResults.length
            const userIndex = allTestResults.findIndex((result: any) => result.id === testResult.id)
            const userRank = userIndex !== -1 ? userIndex + 1 : 0
            const percentile = totalTestTakers > 1 ? ((totalTestTakers - userRank) / (totalTestTakers - 1)) * 100 : 100
            
            resultsData = {
                marks_obtained: marksObtained,
                total_marks: totalMarks,
                percentile: percentile,
                rank: userRank,
                total_test_takers: totalTestTakers
            }
            testResult.results = resultsData;
            testResult.accuracy = calculateAccuracy(testResult.total_correct, testResult.total_incorrect);

            // --- Refined Topper Logic ---
            const topperResult = allTestResults[0];
            if (topperResult && topperResult.id !== testResult.id) {
                const topperMarksObtained = await calculateActualScore(supabaseAdmin as any, topperResult.id, topperResult.mock_test_id);

                const { data: topperAnswerLog, error: topperAnswerLogError } = await supabaseAdmin
                    .from('answer_log').select('*').eq('result_id', topperResult.id)
                const { data: userAnswerLog, error: userAnswerLogError } = await supabaseAdmin
                    .from('answer_log').select('question_id, status').eq('result_id', testResult.id)

                if (!topperAnswerLogError && !userAnswerLogError) {
                    const userAnswers = new Map(userAnswerLog.map(a => [a.question_id, a.status]));
                    const topperAnswers = new Map(topperAnswerLog.map(a => [a.question_id, a.status]));
                    const allQuestionIds = new Set([...userAnswers.keys(), ...topperAnswers.keys()]);

                    const buckets: {
                        userRightTopperRight: number[];
                        userWrongTopperRight: number[];
                        userRightTopperWrong: number[];
                        userWrongTopperWrong: number[];
                    } = {
                        userRightTopperRight: [],
                        userWrongTopperRight: [],
                        userRightTopperWrong: [],
                        userWrongTopperWrong: [],
                    };

                    for (const qid of allQuestionIds) {
                        const userStatus = userAnswers.get(qid);
                        const topperStatus = topperAnswers.get(qid);
                        if (userStatus === 'correct' && topperStatus === 'correct') buckets.userRightTopperRight.push(qid);
                        else if (userStatus !== 'correct' && topperStatus === 'correct') buckets.userWrongTopperRight.push(qid);
                        else if (userStatus === 'correct' && topperStatus !== 'correct') buckets.userRightTopperWrong.push(qid);
                        else if (userStatus !== 'correct' && topperStatus !== 'correct') buckets.userWrongTopperWrong.push(qid);
                    }

                    topperComparisonData = {
                        summary: {
                            user: { 
                                score: marksObtained, 
                                accuracy: calculateAccuracy(testResult.total_correct, testResult.total_incorrect), 
                                correct: testResult.total_correct, incorrect: testResult.total_incorrect, skipped: testResult.total_skipped 
                            },
                            topper: { 
                                score: topperMarksObtained, 
                                accuracy: calculateAccuracy(topperResult.total_correct, topperResult.total_incorrect), 
                                correct: topperResult.total_correct, incorrect: topperResult.total_incorrect, skipped: topperResult.total_skipped 
                            },
                        },
                        strategicAnalysis: buckets,
                    };

                    // Store topper data for new dashboard
                    topperData = {
                        testResult: {
                            ...topperResult,
                            results: {
                                marks_obtained: topperMarksObtained,
                                total_marks: totalMarks,
                                percentile: 100, // Topper is always 100th percentile
                                rank: 1,
                                total_test_takers: totalTestTakers
                            },
                            accuracy: calculateAccuracy(topperResult.total_correct, topperResult.total_incorrect)
                        },
                        answerLog: topperAnswerLog
                    };
                }
            }
        }
    }
    // --- END: Logic ---

    const { data: answerLog, error: answerError } = await supabaseAdmin.from('answer_log').select('*').eq('result_id', resultId)
    if (answerError) return NextResponse.json({ error: 'Answer log not found' }, { status: 404 });

    const questionIds = answerLog.map(answer => answer.question_id);
    if (questionIds.length === 0) return NextResponse.json({ data: { testResult, answerLog: [], questions: [], topperComparison: topperComparisonData } });

    const { data: questions, error: questionsError } = await supabaseAdmin.from('questions').select('*').in('id', questionIds);
    if (questionsError) return NextResponse.json({ error: 'Questions not found' }, { status: 404 });

    return NextResponse.json({
      data: {
        testResult,
        answerLog,
        questions,
        topperComparison: topperComparisonData,
        topperResult: topperData,
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}