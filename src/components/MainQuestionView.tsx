'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import KatexRenderer from './ui/KatexRenderer'
import { Database } from '@/types/database'
import { Star, Bookmark, Flag } from 'lucide-react'

type TestResult = Database['public']['Tables']['test_results']['Row']
type AnswerLog = Database['public']['Tables']['answer_log']['Row']
type Question = Database['public']['Tables']['questions']['Row']

interface SessionDataInput {
  testResult?: TestResult
  answerLog: AnswerLog[]
  questions: Question[]
  peerAverages?: Record<number, number>
}

interface MainQuestionViewProps {
  session: SessionDataInput
  currentIndex: number
  onPrev: () => void
  onNext: () => void
  // Unified Solutions interface inline actions and state
  isBookmarked?: boolean
  onToggleBookmark?: () => void
  onReportError?: () => void
  // Filtered navigation support
  canPrev?: boolean
  canNext?: boolean
  filteredPosition?: number
  filteredTotal?: number
}

/**
 * MainQuestionView
 * Left column component for Detailed Solution Review page.
 *
 * Sections:
 * - Question Header: number, status pill, time taken
 * - Question Body: KatexRenderer for question math/text
 * - Answer Options Display: highlights correct (green) and incorrect user choice (red)
 * - Solution Box: shows solution (with collapsible toggle)
 * - Navigation Controls: Previous/Next buttons with progress indicator
 */
export default function MainQuestionView({
  session,
  currentIndex,
  onPrev,
  onNext,
  isBookmarked = false,
  onToggleBookmark,
  onReportError,
  canPrev,
  canNext,
  filteredPosition,
  filteredTotal
}: MainQuestionViewProps) {
  const totalQuestions = session.questions.length
  const question = session.questions[currentIndex]

  const answerLogEntry: AnswerLog | undefined = question
    ? session.answerLog.find((a) => a.question_id === question.id)
    : undefined

  const status = (answerLogEntry?.status ?? 'skipped') as 'correct' | 'incorrect' | 'skipped'
  const userAnswerKey = answerLogEntry?.user_answer ?? null
  const timeTakenSeconds = answerLogEntry?.time_taken ?? 0
  const [showSolution, setShowSolution] = useState(true)

  // Helpers
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  const getStatusPillClasses = (s: 'correct' | 'incorrect' | 'skipped') => {
    switch (s) {
      case 'correct':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'incorrect':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
    }
  }

  const getStatusLabel = (s: 'correct' | 'incorrect' | 'skipped') => {
    switch (s) {
      case 'correct':
        return 'Correct'
      case 'incorrect':
        return 'Incorrect'
      default:
        return 'Skipped'
    }
  }

  const progressPercentage = totalQuestions > 0 ? Math.min(100, Math.max(0, ((currentIndex + 1) / totalQuestions) * 100)) : 0
  // Filtered navigation derived state
  const isPrevDisabled = canPrev !== undefined ? !canPrev : currentIndex === 0
  const isNextDisabled = canNext !== undefined ? !canNext : currentIndex >= totalQuestions - 1
  const displayPosition = filteredPosition ?? (currentIndex + 1)
  const displayTotal = filteredTotal ?? totalQuestions
  const filteredProgress = displayTotal > 0 ? Math.min(100, Math.max(0, (displayPosition / displayTotal) * 100)) : 0
  const options: Record<string, string> = (question?.options as Record<string, string>) || {}
  const correctKey = question?.correct_option

  if (!question) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md p-6">
        <div className="text-slate-600 dark:text-slate-300">No question available.</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md p-6">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg font-semibold">
            Question {currentIndex + 1} of {totalQuestions}
          </div>

          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusPillClasses(status)}`}>
            {getStatusLabel(status)}
          </div>

          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono text-sm">{formatTime(timeTakenSeconds)}</span>
          </div>

          {question.difficulty && (
            <div className={`px-3 py-1 rounded-lg text-sm font-medium
              ${question.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                question.difficulty === 'Easy-Moderate' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                question.difficulty === 'Moderate' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                question.difficulty === 'Moderate-Hard' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}
            `}>
              {question.difficulty}
            </div>
          )}
        </div>

        {/* Inline Actions: Bookmark + Report Error */}
        <div className="flex items-center gap-1">
          {/* Bookmark star (amber when active) */}
          <button
            onClick={onToggleBookmark}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarked ? (
              <Star className="w-5 h-5 text-amber-500" />
            ) : (
              <Bookmark className="w-5 h-5 text-slate-500 dark:text-slate-300" />
            )}
          </button>

          {/* Report error flag */}
          <button
            onClick={onReportError}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Report error"
            title="Report error"
          >
            <Flag className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Question Body */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-sm"
      >
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <KatexRenderer
            content={question.question_text}
            className="text-slate-900 dark:text-slate-100 leading-relaxed"
          />
        </div>
      </motion.div>

      {/* Answer Options Display */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="space-y-3"
      >
        {Object.entries(options).map(([key, value]) => {
          const isCorrect = key === correctKey
          const isUserChoice = userAnswerKey === key
          const isIncorrectChoice = isUserChoice && !isCorrect

          const baseClasses =
            'block p-4 rounded-xl border-2 transition-all duration-200'
          const stateClasses = isCorrect
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
            : isIncorrectChoice
              ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'

        return (
            <motion.div
              key={key}
              className={`${baseClasses} ${stateClasses}`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start gap-3">
                {/* Option key badge */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                  ${isCorrect ? 'bg-green-600 border-green-600 text-white'
                    : isIncorrectChoice ? 'bg-red-600 border-red-600 text-white'
                    : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'}
                `}>
                  <span className="text-xs font-bold">{key}</span>
                </div>

                <div className="flex-1 min-h-0">
                  <KatexRenderer
                    content={value}
                    className="text-slate-700 dark:text-slate-300 leading-relaxed"
                  />
                </div>

                {/* Labels */}
                <div className="flex flex-col items-end gap-2">
                  {isCorrect && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">
                      Correct
                    </span>
                  )}
                  {isIncorrectChoice && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200">
                      Your Answer
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Solution Box */}
      {question.solution_text && (
        <div className="mt-6">
          <button
            onClick={() => setShowSolution((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            aria-expanded={showSolution}
          >
            <svg
              className={`w-4 h-4 transition-transform ${showSolution ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{showSolution ? 'Hide Solution' : 'View Solution'}</span>
          </button>

          <AnimatePresence initial={false}>
            {showSolution && (
              <motion.div
                layout
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'top', willChange: 'transform, opacity' }}
                className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden"
              >
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Solution</h4>
                <KatexRenderer
                  content={question.solution_text}
                  className="text-blue-800 dark:text-blue-200 leading-relaxed"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={isPrevDisabled}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2
                ${isPrevDisabled
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}
              `}
              aria-label="Previous question"
              title="Previous"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Previous</span>
            </button>

            <button
              onClick={onNext}
              disabled={isNextDisabled}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2
                ${isNextDisabled
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}
              `}
              aria-label="Next question"
              title="Next"
            >
              <span className="text-sm">Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {displayPosition} / {displayTotal}
            </span>
            <div className="w-32 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                style={{ width: `${filteredProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}