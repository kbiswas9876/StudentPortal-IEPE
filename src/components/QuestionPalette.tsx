'use client'

import { motion } from 'framer-motion'
import { Database } from '@/types/database'
import { QuestionStatus } from './PracticeInterface'
import StatusLegend from './StatusLegend'

type Question = Database['public']['Tables']['questions']['Row']

interface QuestionPaletteProps {
  questions: Question[]
  sessionStates: Array<{
    status: QuestionStatus
    user_answer: string | null
    is_bookmarked: boolean
  }>
  currentIndex: number
  onQuestionSelect: (index: number) => void
  onSubmitTest?: () => void
  isSubmitting?: boolean
}

export default function QuestionPalette({
  questions,
  sessionStates,
  currentIndex,
  onQuestionSelect,
  onSubmitTest,
  isSubmitting = false
}: QuestionPaletteProps) {
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

  // Calculate status counts for the StatusLegend
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
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl h-full flex flex-col"
    >
      {/* Section 1: Header - Dedicated header area with distinct background */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Questions
          </h3>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md">
            {answeredCount} / {questions.length}
          </div>
        </div>
      </div>

      {/* Section 2: Scrollable Question Grid - Dynamic height with proper flex layout */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, index) => {
            const state = sessionStates[index]
            const isCurrent = index === currentIndex
            const hasBookmark = state?.is_bookmarked

            return (
              <motion.button
                key={index}
                onClick={() => onQuestionSelect(index)}
                className={`
                  relative w-12 h-12 rounded-lg border-2 transition-all duration-200 font-bold text-sm
                  ${getQuestionColor(index)}
                  ${isCurrent ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg scale-105' : 'hover:shadow-md hover:scale-105'}
                  active:scale-95
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {index + 1}
                
                {/* Green dot indicator for "Marked and Answered" */}
                {state?.status === 'marked_for_review' && state?.user_answer && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full shadow-sm"></div>
                )}
                
                {/* Bookmark indicator */}
                {hasBookmark && (
                  <div className="absolute -top-1 -right-1">
                    <svg className="w-2.5 h-2.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Section 3: Status Legend - Fixed, Middle-Bottom */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-800/30">
        <StatusLegend
          answeredCount={answeredCount}
          notAnsweredCount={notAnsweredCount}
          notVisitedCount={notVisitedCount}
          markedCount={markedCount}
          markedAndAnsweredCount={markedAndAnsweredCount}
          bookmarkedCount={bookmarkedCount}
          className="bg-white dark:bg-slate-800 shadow-sm"
        />
      </div>

      {/* Section 4: Submit Button Container - Fixed, Absolute Bottom */}
      {onSubmitTest && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <motion.button
            onClick={onSubmitTest}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-400 disabled:to-red-500 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Submit Test</span>
              </>
            )}
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
