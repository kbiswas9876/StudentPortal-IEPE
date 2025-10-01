'use client'

import { motion } from 'framer-motion'
import { Database } from '@/types/database'
import { QuestionStatus } from './PracticeInterface'
import Timer from './Timer'
import StatusLegend from './StatusLegend'

type Question = Database['public']['Tables']['questions']['Row']

interface PremiumStatusPanelProps {
  questions: Question[]
  sessionStates: Array<{
    status: QuestionStatus
    user_answer: string | null
    time_taken: number
    is_bookmarked: boolean
  }>
  currentIndex: number
  sessionStartTime: number
  timeLimitInMinutes?: number
  onQuestionSelect: (index: number) => void
  isSubmitting?: boolean
}

export default function PremiumStatusPanel({
  questions,
  sessionStates,
  currentIndex,
  sessionStartTime,
  timeLimitInMinutes,
  onQuestionSelect,
  isSubmitting = false
}: PremiumStatusPanelProps) {
  const getQuestionColor = (index: number) => {
    const state = sessionStates[index]
    if (!state) return 'bg-slate-400 text-white border-slate-400'

    // Check for "Marked and Answered" state first
    if (state.status === 'marked_for_review' && state.user_answer) {
      return 'bg-purple-500 text-white border-purple-500'
    }

    switch (state.status) {
      case 'not_visited':
        return 'bg-slate-400 text-white border-slate-400'
      case 'unanswered':
        return 'bg-red-500 text-white border-red-500'
      case 'answered':
        return 'bg-green-500 text-white border-green-500'
      case 'marked_for_review':
        return 'bg-purple-500 text-white border-purple-500'
      default:
        return 'bg-slate-400 text-white border-slate-400'
    }
  }

  // Five-state tracking to match the reference image
  const answeredCount = sessionStates.filter(s => s.status === 'answered').length
  const notAnsweredCount = sessionStates.filter(s => s.status === 'unanswered').length
  const notVisitedCount = sessionStates.filter(s => s.status === 'not_visited').length
  const markedCount = sessionStates.filter(s => s.status === 'marked_for_review').length
  const markedAndAnsweredCount = sessionStates.filter(s => s.status === 'marked_for_review' && s.user_answer).length
  const bookmarkedCount = sessionStates.filter(s => s.is_bookmarked).length

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >


      {/* Question Palette */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Questions
          </h3>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {answeredCount} / {questions.length}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {questions.map((_, index) => {
            const state = sessionStates[index]
            const isCurrent = index === currentIndex
            const hasBookmark = state?.is_bookmarked

            return (
              <motion.button
                key={index}
                onClick={() => onQuestionSelect(index)}
                className={`
                  relative w-14 h-14 rounded-xl border-2 transition-all duration-300 font-bold text-base shadow-sm
                  ${getQuestionColor(index)}
                  ${isCurrent ? 'ring-4 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400 shadow-xl scale-105' : 'hover:shadow-lg hover:scale-105'}
                  active:scale-95
                `}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                {index + 1}
                
                {/* Green dot indicator for "Marked and Answered" - Even larger and more prominent */}
                {state?.status === 'marked_for_review' && state?.user_answer && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
                )}
                
                {/* Bookmark indicator */}
                {hasBookmark && (
                  <div className="absolute -top-1 -right-1">
                    <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Status Legend - Using the exact component */}
        <div className="mt-6">
          <StatusLegend
            answeredCount={answeredCount}
            notAnsweredCount={notAnsweredCount}
            notVisitedCount={notVisitedCount}
            markedCount={markedCount}
            markedAndAnsweredCount={markedAndAnsweredCount}
            bookmarkedCount={bookmarkedCount}
          />
        </div>
        
      </div>
    </motion.div>
  )
}
