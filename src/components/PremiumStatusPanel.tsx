'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'
import { QuestionStatus } from './PracticeInterface'
// The 'Timer' import is removed as it's not part of this component's responsibility.
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
  onQuestionSelect: (index: number) => void
  onSubmitTest?: () => void
  isSubmitting?: boolean
  mockTestData?: any
}

export default function PremiumStatusPanel({
  questions,
  sessionStates,
  currentIndex,
  onQuestionSelect,
  onSubmitTest,
  isSubmitting = false,
  mockTestData
}: PremiumStatusPanelProps) {
  // State for panel collapse/expand
  const [isCollapsed, setIsCollapsed] = useState(false)

  // --- NO CHANGES TO THIS FUNCTION ---
  // The color and state logic is preserved exactly as it was.
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

  // --- NO CHANGES TO THIS LOGIC ---
  // The calculation of counts for the legend is preserved exactly.
  const answeredCount = sessionStates.filter(s => s.status === 'answered').length
  const notAnsweredCount = sessionStates.filter(s => s.status === 'unanswered').length
  const notVisitedCount = sessionStates.filter(s => s.status === 'not_visited').length
  const markedCount = sessionStates.filter(s => s.status === 'marked_for_review').length
  const markedAndAnsweredCount = sessionStates.filter(s => s.status === 'marked_for_review' && s.user_answer).length
  const bookmarkedCount = sessionStates.filter(s => s.is_bookmarked).length

  return (
    <AnimatePresence>
      {!isCollapsed ? (
        // --- Panel Visible State ---
        <motion.div
          key="panel-visible"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl h-full flex flex-col relative"
        >
          {/* Collapse Toggle Button - Inside the panel */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 p-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-l-xl shadow-lg hover:shadow-xl transition-all duration-300 z-10 group"
          >
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
      {/* Section 1: Header - Fixed, Top (No Changes Here) */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Questions
          </h3>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
            {answeredCount} / {questions.length}
          </div>
        </div>
      </div>

      {/* Section 2: Question Grid - The ONLY Scrollable Area */}
      {/* --- FIX #2: Dynamic Scrollable Area Height --- */}
      {/* Removed hardcoded `maxHeight`. `flex-1` and `min-h-0` make this area
      dynamically fill all available space and scroll when its content overflows. */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, index) => {
            const state = sessionStates[index]
            const isCurrent = index === currentIndex
            const hasBookmark = state?.is_bookmarked

            // --- NO CHANGES TO THE BUTTON LOGIC OR STYLING ---
            // All indicators (green dot, bookmark) are preserved.
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
              >
                {index + 1}
                {state?.status === 'marked_for_review' && state?.user_answer && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                )}
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

      {/* Section 3: Status Legend - Fixed, Middle-Bottom (No Changes Here) */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <StatusLegend
          answeredCount={answeredCount}
          notAnsweredCount={notAnsweredCount}
          notVisitedCount={notVisitedCount}
          markedCount={markedCount}
          markedAndAnsweredCount={markedAndAnsweredCount}
          bookmarkedCount={bookmarkedCount}
        />
      </div>

      {/* Section 4: Submit Button Container - Fixed, Absolute Bottom */}
      {/* --- FIX #3: Simplified and Cleaner Submit Section Styling --- */}
      {/* The structure is simplified for better readability, but functionality and button style are preserved. */}
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

      {/* Mock Test Data Section */}
      {mockTestData && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">Scoring Rules</h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <div className="flex justify-between">
              <span>Correct Answer:</span>
              <span className="font-semibold">+{mockTestData.test.marks_per_correct} marks</span>
            </div>
            <div className="flex justify-between">
              <span>Incorrect Answer:</span>
              <span className="font-semibold">{mockTestData.test.marks_per_incorrect} marks</span>
            </div>
          </div>
        </div>
      )}
        </motion.div>
      ) : (
        // --- Panel Collapsed State ---
        <motion.button
          key="panel-collapsed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsCollapsed(false)}
          className="fixed right-0 top-1/2 -translate-y-1/2 p-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-l-xl shadow-lg hover:shadow-xl transition-all duration-300 z-10 group"
        >
          <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}