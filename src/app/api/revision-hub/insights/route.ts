import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * GET /api/revision-hub/insights
 * 
 * Returns actionable insights for the user:
 * - Hardest Questions: Top 3 questions with poor performance
 * - Weakest Chapters: Top 3 chapters with lowest success rates
 * 
 * @query userId - The ID of the user (required)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching insights for user:', userId);

    // ============================================================================
    // STEP 1: Fetch User's Bookmarked Questions with Question Details
    // ============================================================================

    const { data: bookmarks, error: bookmarksError } = await supabaseAdmin
      .from('bookmarked_questions')
      .select(`
        id,
        question_id,
        user_difficulty_rating,
        srs_ease_factor,
        srs_repetitions,
        questions (
          id,
          question_text,
          chapter_name,
          book_code
        )
      `)
      .eq('user_id', userId);

    if (bookmarksError) {
      console.error('❌ Error fetching bookmarks:', bookmarksError);
      return NextResponse.json(
        { error: bookmarksError.message },
        { status: 500 }
      );
    }

    if (!bookmarks || bookmarks.length === 0) {
      // No bookmarks, return empty insights
      return NextResponse.json({
        success: true,
        data: {
          hardestQuestions: [],
          weakestChapters: [],
        },
      });
    }

    // ============================================================================
    // STEP 2: Fetch Answer Log for Performance Analysis
    // ============================================================================

    const questionIds = bookmarks.map(b => b.question_id);

    const { data: answerLogs, error: logsError } = await supabaseAdmin
      .from('answer_log')
      .select('question_id, is_correct, time_taken')
      .eq('user_id', userId)
      .in('question_id', questionIds);

    if (logsError) {
      console.error('❌ Error fetching answer logs:', logsError);
      return NextResponse.json(
        { error: logsError.message },
        { status: 500 }
      );
    }

    // ============================================================================
    // STEP 3: Calculate Hardest Questions
    // ============================================================================
    // Difficulty score based on:
    // - Low ease factor (indicates difficulty)
    // - Low repetitions (hasn't been mastered)
    // - User difficulty rating

    const questionScores = bookmarks.map(bookmark => {
      const question = bookmark.questions as any;
      if (!question) return null;

      // Calculate difficulty score (higher = harder)
      const easeFactor = bookmark.srs_ease_factor || 2.5;
      const repetitions = bookmark.srs_repetitions || 0;
      const userRating = bookmark.user_difficulty_rating || 3;

      // Normalize scores to 0-1 range
      const easeScore = (3.0 - easeFactor) / 1.7; // Lower ease = harder (1.3 to 3.0 range)
      const repScore = Math.max(0, 1 - (repetitions / 10)); // Fewer reps = harder
      const ratingScore = userRating / 5; // User's subjective rating

      // Weighted combination
      const difficultyScore = (easeScore * 0.4) + (repScore * 0.3) + (ratingScore * 0.3);

      // Count attempts and correctness from answer log
      const attempts = answerLogs?.filter(log => log.question_id === bookmark.question_id) || [];
      const totalAttempts = attempts.length;
      const incorrectAttempts = attempts.filter(log => !log.is_correct).length;

      return {
        bookmarkId: bookmark.id,
        questionId: bookmark.question_id,
        questionText: question.question_text || '',
        chapter: question.chapter_name || 'Unknown',
        difficultyScore,
        easeFactor: bookmark.srs_ease_factor,
        repetitions: bookmark.srs_repetitions,
        totalAttempts,
        incorrectAttempts,
        userRating: bookmark.user_difficulty_rating,
      };
    }).filter(Boolean) as any[];

    // Sort by difficulty score and take top 3
    const hardestQuestions = questionScores
      .sort((a, b) => b.difficultyScore - a.difficultyScore)
      .slice(0, 3)
      .map(q => ({
        bookmarkId: q.bookmarkId,
        questionId: q.questionId,
        questionText: q.questionText.substring(0, 150) + (q.questionText.length > 150 ? '...' : ''),
        chapter: q.chapter,
        stat: q.incorrectAttempts > 0 
          ? `Struggled ${q.incorrectAttempts} time${q.incorrectAttempts !== 1 ? 's' : ''}`
          : q.repetitions === 0
          ? 'New question'
          : `Ease: ${q.easeFactor.toFixed(1)}`,
        difficultyScore: Math.round(q.difficultyScore * 100),
      }));

    // ============================================================================
    // STEP 4: Calculate Weakest Chapters
    // ============================================================================

    // Group bookmarks by chapter
    const chapterMap = new Map<string, {
      totalAttempts: number;
      correctAttempts: number;
      questionCount: number;
    }>();

    for (const bookmark of bookmarks) {
      const question = bookmark.questions as any;
      if (!question || !question.chapter_name) continue;

      const chapter = question.chapter_name;
      
      if (!chapterMap.has(chapter)) {
        chapterMap.set(chapter, {
          totalAttempts: 0,
          correctAttempts: 0,
          questionCount: 0,
        });
      }

      const chapterData = chapterMap.get(chapter)!;
      chapterData.questionCount++;

      // Count attempts for this question
      const attempts = answerLogs?.filter(log => log.question_id === bookmark.question_id) || [];
      chapterData.totalAttempts += attempts.length;
      chapterData.correctAttempts += attempts.filter(log => log.is_correct).length;
    }

    // Calculate success rates and sort
    const weakestChapters = Array.from(chapterMap.entries())
      .filter(([, data]) => data.totalAttempts > 0) // Only chapters with attempts
      .map(([chapter, data]) => ({
        chapter,
        questionCount: data.questionCount,
        successRate: Math.round((data.correctAttempts / data.totalAttempts) * 100),
        totalAttempts: data.totalAttempts,
      }))
      .sort((a, b) => a.successRate - b.successRate) // Sort by lowest success rate
      .slice(0, 3);

    // ============================================================================
    // STEP 4.5: Fetch Hourly Performance Data
    // ============================================================================

    let hourlyPerformance = null;

    try {
      const hourlyResponse = await fetch(
        `${env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/revision-hub/hourly-performance?userId=${userId}`,
        { cache: 'no-store' }
      );
      
      if (hourlyResponse.ok) {
        hourlyPerformance = await hourlyResponse.json();
        console.log('✅ Hourly performance fetched for insights');
      }
    } catch (error) {
      console.error('⚠️ Error fetching hourly performance (non-critical):', error);
    }

    // ============================================================================
    // STEP 5: Return Results
    // ============================================================================

    console.log('✅ Insights calculated:', {
      hardestQuestions: hardestQuestions.length,
      weakestChapters: weakestChapters.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        hardestQuestions,
        weakestChapters,
        hourlyPerformance,
      },
    });

  } catch (error) {
    console.error('❌ Unexpected error in insights endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

