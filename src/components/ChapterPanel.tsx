'use client'

import React, { useMemo } from 'react'
import { Database } from '@/types/database'
import { formatPercentage } from '@/utils/formatNumber'

// --- Type Definitions ---
type AnswerLogRow = Database['public']['Tables']['answer_log']['Row']
type QuestionRow = Database['public']['Tables']['questions']['Row']

export interface ChapterPerformance {
  name: string
  totalQuestions: number
  accuracy: number
  correct: number
  incorrect: number
  avgTimePerQuestion: number // in seconds
}

interface ChapterPanelProps {
  answerLog: AnswerLogRow[]
  questions: QuestionRow[]
}

/**
 * Helper function to get gradient based on accuracy percentage
 * >85% = teal, 60-84% = yellow-amber, <60% = red
 */
const getAccuracyGradient = (accuracy: number): string => {
  if (accuracy >= 85) {
    return 'linear-gradient(to right, #2dd4bf, #0d9488)' // teal
  }
  if (accuracy >= 60) {
    return 'linear-gradient(to right, #fbbf24, #d97706)' // yellow-amber
  }
  return 'linear-gradient(to right, #f87171, #dc2626)' // red
}

/**
 * Calculate chapter-wise performance from answer log and questions
 */
const calculateChapterPerformance = (
  answerLog: AnswerLogRow[],
  questions: QuestionRow[]
): ChapterPerformance[] => {
  // Create a map of question_id to question for quick lookup
  const questionMap = new Map<number, QuestionRow>()
  questions.forEach(q => {
    questionMap.set(q.id, q)
  })

  // Group answer log by chapter
  const chapterMap = new Map<string, {
    correct: number
    incorrect: number
    skipped: number
    totalTime: number
  }>()

  answerLog.forEach(answer => {
    const question = questionMap.get(answer.question_id)
    if (!question || !question.chapter_name) return

    const chapter = question.chapter_name
    if (!chapterMap.has(chapter)) {
      chapterMap.set(chapter, { correct: 0, incorrect: 0, skipped: 0, totalTime: 0 })
    }

    const stats = chapterMap.get(chapter)!
    if (answer.status === 'correct') {
      stats.correct++
    } else if (answer.status === 'incorrect') {
      stats.incorrect++
    } else {
      stats.skipped++
    }
    stats.totalTime += answer.time_taken || 0
  })

  // Convert to ChapterPerformance array
  const chapters: ChapterPerformance[] = Array.from(chapterMap.entries()).map(([name, stats]) => {
    const attempted = stats.correct + stats.incorrect
    const accuracy = attempted > 0 ? (stats.correct / attempted) * 100 : 0
    const totalQuestions = stats.correct + stats.incorrect + stats.skipped
    const avgTime = attempted > 0 ? stats.totalTime / attempted : 0

    return {
      name,
      totalQuestions,
      accuracy,
      correct: stats.correct,
      incorrect: stats.incorrect,
      avgTimePerQuestion: avgTime
    }
  })

  // Sort by chapter name for consistent display
  return chapters.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * ChapterPanel Component
 * Displays chapter-wise performance in a table format with progress bars
 */
const ChapterPanel: React.FC<ChapterPanelProps> = ({ answerLog, questions }) => {
  const chapters = useMemo(
    () => calculateChapterPerformance(answerLog, questions),
    [answerLog, questions]
  )

  if (chapters.length === 0) {
    return (
      <div role="tabpanel" aria-labelledby="tab-chapters">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Chapter-wise Performance</h2>
        <p className="text-slate-600 text-center py-8">No chapter data available</p>
      </div>
    )
  }

  return (
    <div role="tabpanel" aria-labelledby="tab-chapters">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Chapter-wise Performance</h2>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
            <div className="col-span-4">Chapter</div>
            <div className="col-span-3 text-center">Accuracy</div>
            <div className="col-span-2 text-center">Correct</div>
            <div className="col-span-2 text-center">Incorrect</div>
            <div className="col-span-1 text-right">Avg Time/Q</div>
          </div>
          {/* Body */}
          <div className="divide-y divide-slate-200">
            {chapters.map((chapter) => (
              <div key={chapter.name} className="grid grid-cols-12 gap-4 p-4 items-center">
                <div className="col-span-4">
                  <p className="font-medium text-slate-800">{chapter.name}</p>
                  <p className="text-sm text-slate-500">{chapter.totalQuestions} questions</p>
                </div>
                <div className="col-span-3">
                  <p className="font-medium text-slate-800 text-center mb-1">
                    {formatPercentage(chapter.accuracy)}%
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${chapter.accuracy}%`,
                        background: getAccuracyGradient(chapter.accuracy)
                      }}
                    ></div>
                  </div>
                </div>
                <div className="col-span-2 text-center text-slate-700">{chapter.correct}</div>
                <div className="col-span-2 text-center text-slate-700">{chapter.incorrect}</div>
                <div className="col-span-1 text-right text-slate-700">
                  {Math.round(chapter.avgTimePerQuestion)}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChapterPanel
