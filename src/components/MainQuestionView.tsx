'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import KatexRenderer from './ui/KatexRenderer'
import { Database } from '@/types/database'
import { Flag } from 'lucide-react'
import { getAdvancedSpeedCategory, getAdvancedThreeTierSpeedCategory, type AdvancedDifficulty, type AdvancedSpeedCategory } from '@/lib/speed-calculator'

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
  showBookmark?: boolean // New prop to control bookmark visibility
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
  filteredTotal,
  showBookmark = true // Default to true for backward compatibility
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

  const getQuestionHeaderClasses = (s: 'correct' | 'incorrect' | 'skipped') => {
    switch (s) {
      case 'correct':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'incorrect':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
    }
  }

  const getSpeedColor = (timeTakenSeconds: number, difficulty: string | null) => {
    // Only apply color-coding to correct answers
    if (status !== 'correct') {
      return 'text-gray-500 dark:text-gray-400'
    }
    
    const speedCategory = getAdvancedThreeTierSpeedCategory(timeTakenSeconds, difficulty as AdvancedDifficulty)
    
    // Three-tier color system for correct answers only
    if (speedCategory === 'Fast') {
      return 'text-green-600 dark:text-green-400' // Fast - Green
    } else if (speedCategory === 'Average') {
      return 'text-yellow-600 dark:text-yellow-400' // Average - Yellow/Amber
    } else if (speedCategory === 'Slow') {
      return 'text-red-600 dark:text-red-400' // Slow - Red
    }
    
    return 'text-gray-500 dark:text-gray-400'
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
          {/* Premium Bookmark Button - Only show in solution review context */}
          {showBookmark && onToggleBookmark && (
            <motion.button
              onClick={onToggleBookmark}
              className={`
                relative group p-3 rounded-xl border-2 transition-all duration-300
                ${isBookmarked 
                  ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30' 
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-md'
                }
              `}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.92 }}
              title={isBookmarked ? 'Remove from Revision Hub' : 'Save to Revision Hub'}
            >
              {/* Animated glow effect for bookmarked state */}
              {isBookmarked && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-amber-400/20 dark:bg-amber-500/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              
              <motion.svg
                className="w-6 h-6 relative z-10"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={isBookmarked ? 0 : 2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </motion.svg>
            </motion.button>
          )}

          <div className={`px-3 py-1 rounded-lg font-semibold ${getQuestionHeaderClasses(status)}`}>
            Question {currentIndex + 1} of {totalQuestions}
          </div>

          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusPillClasses(status)}`}>
            {getStatusLabel(status)}
          </div>

          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`font-mono text-base font-semibold ${getSpeedColor(timeTakenSeconds, question.difficulty)}`}>
              {formatTime(timeTakenSeconds)}
            </span>
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

        {/* Inline Actions: Report Error only (bookmark moved to top-left) */}
        <div className="flex items-center gap-1">
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
            'block p-4 rounded-xl transition-all duration-200'
          const stateClasses = isCorrect
            ? 'bg-green-50 dark:bg-green-900/20'
            : isIncorrectChoice
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-white dark:bg-slate-800'

        return (
            <motion.div
              key={key}
              className={`${baseClasses} ${stateClasses}`}
              style={{ boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)' }}
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

      {/* Professional Solution Box */}
      {question.solution_text && (
        <div className="mt-6">
          {/* Clean Solution Toggle Button */}
          <motion.button
            onClick={() => setShowSolution((prev) => !prev)}
            className={`
              group w-full flex items-center justify-between px-5 py-3 rounded-xl border transition-colors duration-200 shadow-sm
              ${showSolution 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500'
              }
            `}
            aria-expanded={showSolution}
          >
            <div className="flex items-center gap-3">
              {/* Simple icon */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${showSolution 
                  ? 'bg-white/20 text-white' 
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }
              `}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              
              <div className="text-left">
                <h3 className={`font-semibold ${showSolution ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                  {showSolution ? 'Hide Solution' : 'View Solution'}
                </h3>
              </div>
            </div>
            
            {/* Simple chevron */}
            <motion.div
              className={`
                w-6 h-6 rounded-md flex items-center justify-center transition-colors
                ${showSolution 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }
              `}
              animate={{ rotate: showSolution ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.button>

          {/* Clean Solution Card */}
          <AnimatePresence initial={false}>
            {showSolution && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="mt-4 overflow-hidden"
              >
                <div 
                  className="bg-white dark:bg-slate-800 rounded-xl p-6" 
                  style={{ 
                    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1) !important'
                  }}
                >
                  {/* Solution content */}
                  <KatexRenderer
                    content={question.solution_text}
                    className="text-slate-700 dark:text-slate-300 leading-relaxed"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  )
}