'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database } from '@/types/database'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import KatexRenderer from './ui/KatexRenderer'
import TimerDisplay from './TimerDisplay'

type Question = Database['public']['Tables']['questions']['Row']

interface QuestionDisplayProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  userAnswer: string | null
  isBookmarked: boolean
  onAnswerChange: (answer: string) => void
  onBookmark: () => void
  onReportError?: () => void
  sessionStartTime?: number
  timeLimitInMinutes?: number
  currentQuestionStartTime?: number
  cumulativeTime?: number
  isPaused?: boolean
  showBookmark?: boolean // New prop to control bookmark visibility
  hideMetadata?: boolean // New prop to control metadata visibility
}

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  isBookmarked,
  onAnswerChange,
  onBookmark,
  onReportError,
  sessionStartTime,
  timeLimitInMinutes,
  currentQuestionStartTime,
  cumulativeTime,
  isPaused = false,
  showBookmark = true, // Default to true for backward compatibility
  hideMetadata = false // Default to false for backward compatibility
}: QuestionDisplayProps) {
  const [isBookmarking, setIsBookmarking] = useState(false)

  const handleBookmark = async () => {
    if (isBookmarking) return
    
    setIsBookmarking(true)
    await onBookmark()
    setIsBookmarking(false)
  }

  const options = question.options as Record<string, string> || {}

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg font-semibold">
              Question {questionNumber} of {totalQuestions}
            </div>
            
            {/* Per-Question Timer - Immediately to the right of Question X of Y */}
            {currentQuestionStartTime && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg className="w-3 h-3 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <TimerDisplay
                  milliseconds={cumulativeTime || 0}
                  size="small"
                  className="text-slate-600 dark:text-slate-400"
                  isPaused={isPaused}
                />
              </div>
            )}
          </div>
          
          {question.difficulty && (
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
              question.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
              question.difficulty === 'Easy-Moderate' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
              question.difficulty === 'Moderate' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
              question.difficulty === 'Moderate-Hard' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
              'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {question.difficulty}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Bookmark Button - Only show in solution review context */}
          {showBookmark && (
            <motion.button
              onClick={handleBookmark}
              disabled={isBookmarking}
              className={`
                relative group p-2.5 rounded-xl border-2 transition-all duration-300
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
                className="w-5 h-5 relative z-10"
                fill={isBookmarked ? 'currentColor' : 'none'}
                stroke={isBookmarked ? 'none' : 'currentColor'}
                viewBox="0 0 24 24"
                animate={isBookmarking ? { rotate: [0, -10, 10, -10, 10, 0], y: [0, -2, 0] } : {}}
                transition={{ duration: 0.6 }}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={isBookmarked ? 0 : 2.5} 
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                />
              </motion.svg>
              
              {/* Tooltip on hover */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 dark:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-50"
              >
                {isBookmarked ? 'Remove from Revision Hub' : 'Save to Revision Hub'}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45" />
              </motion.div>
            </motion.button>
          )}

          {/* Report Error - Premium Ghost Button */}
          {onReportError && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onReportError}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
              title="Report an issue with this question (Alt + R)"
              aria-label="Report error for this question"
            >
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-sm">Report</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Question Text - Premium Card Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-8"
        style={{
          boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <KatexRenderer 
            content={question.question_text}
            className="text-slate-800 dark:text-slate-100 leading-relaxed text-lg font-medium"
          />
        </div>
      </motion.div>

      {/* Options - Redesigned without labels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        {Object.entries(options).map(([key, value]) => (
          <motion.label
            key={key}
            className={`
              block p-6 rounded-2xl cursor-pointer transition-colors duration-200 ease-out mb-4 relative overflow-hidden
              ${userAnswer === key
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30'
                : 'bg-white dark:bg-slate-800'
              }
            `}
            style={{
              boxShadow: userAnswer === key 
                ? '0 4px 8px 0 rgba(59, 130, 246, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
                : '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
              transition: 'border-color 200ms ease-out, background-color 200ms ease-out, box-shadow 200ms ease-out'
            }}
          >
            {/* Premium accent line for selected option */}
            {userAnswer === key && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-2xl" />
            )}
            
            <div className="flex items-start space-x-4">
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ease-out
                ${userAnswer === key
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500 text-white shadow-md'
                  : 'border-slate-300 dark:border-slate-500 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800'
                }
              `}>
                {userAnswer === key && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                )}
              </div>
              
              <input
                type="radio"
                name="answer"
                value={key}
                checked={userAnswer === key}
                onChange={(e) => onAnswerChange(e.target.value)}
                className="sr-only"
              />
              
              <div className="flex-1 min-h-0">
                <KatexRenderer 
                  content={value}
                  className={`leading-relaxed text-lg font-medium ${
                    userAnswer === key 
                      ? 'text-slate-800 dark:text-slate-100' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                />
              </div>
            </div>
          </motion.label>
        ))}
      </motion.div>

      {/* Question Metadata */}
      {!hideMetadata && (question.exam_metadata || question.admin_tags) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl"
          style={{ boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)' }}
        >
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            Question Details
          </h4>
          
          {question.exam_metadata && (
            <div className="mb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Source: </span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{question.exam_metadata}</span>
            </div>
          )}
          
          {question.admin_tags && question.admin_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Tags: </span>
              {question.admin_tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
