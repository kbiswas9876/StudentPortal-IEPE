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
    is_bookmarked: boolean
  }>
  currentIndex: number
  onQuestionSelect: (index: number) => void
  onSubmitTest?: () => void
  isSubmitting?: boolean
  submitLabel?: string
  mockTestData?: any
}

export default function PremiumStatusPanel({
  questions,
  sessionStates,
  currentIndex,
  onQuestionSelect,
  onSubmitTest,
  isSubmitting = false,
  submitLabel = 'Submit Test',
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
          initial={{ x: '100%', opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: '100%', opacity: 0, scale: 0.95 }}
          transition={{ 
            type: 'spring', 
            duration: 0.5, 
            bounce: 0.1,
            ease: "easeOut"
          }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl h-full flex flex-col relative backdrop-blur-sm"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Premium Card Toggle Button - Always Visible (When Panel is Expanded) */}
          <motion.button
            onClick={() => setIsCollapsed(true)}
            className="absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-20 bg-gradient-to-br from-white to-slate-50 dark:from-slate-50 dark:to-slate-100 border border-slate-200/60 dark:border-slate-300/60 rounded-l-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 z-30 group backdrop-blur-md"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
            whileHover={{ 
              scale: 1.05,
              y: -2
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <motion.svg 
                className="w-5 h-5 text-slate-600 dark:text-slate-700 group-hover:text-slate-900 dark:group-hover:text-slate-900 transition-all duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ transform: 'rotate(180deg)' }}
                whileHover={{ scale: 1.2, rotate: 185 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </motion.svg>
            </div>
            {/* Premium card glow effect */}
            <motion.div 
              className="absolute inset-0 rounded-r-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500"
              whileHover={{ opacity: 1 }}
            />
            {/* Subtle inner highlight */}
            <motion.div 
              className="absolute top-0 left-0 right-0 h-1/2 rounded-r-2xl bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ opacity: 1 }}
            />
            {/* Premium shimmer effect */}
            <motion.div
              className="absolute inset-0 rounded-r-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />
          </motion.button>
      {/* Section 1: Premium Header */}
      <motion.div 
        className="p-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/40 dark:via-slate-800/40 dark:to-slate-700/40 rounded-t-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Questions
            </h3>
          </div>
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {answeredCount} / {questions.length}
          </motion.div>
        </div>
      </motion.div>

      {/* Section 2: Premium Question Grid */}
      <motion.div 
        className="flex-1 p-5 overflow-y-auto min-h-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="grid grid-cols-5 gap-3">
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
                  relative w-14 h-14 rounded-xl border-2 transition-all duration-300 font-bold text-sm
                  ${getQuestionColor(index)}
                  ${isCurrent ? 'ring-3 ring-blue-500/50 dark:ring-blue-400/50 shadow-2xl scale-110' : 'hover:shadow-xl hover:scale-105'}
                  active:scale-95 backdrop-blur-sm
                `}
                whileHover={{ 
                  scale: isCurrent ? 1.15 : 1.08,
                  y: isCurrent ? -4 : -2,
                  rotateX: isCurrent ? 8 : 3,
                  rotateY: isCurrent ? 4 : 2,
                  z: 10
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8, rotateX: -5, rotateY: -2 }}
                animate={{ 
                  opacity: 1, 
                  scale: isCurrent ? 1.1 : 1,
                  rotateX: isCurrent ? 3 : 1,
                  rotateY: isCurrent ? 2 : 0.5,
                  z: isCurrent ? 15 : 0
                }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.02,
                  ease: "easeOut"
                }}
                style={{
                  boxShadow: isCurrent 
                    ? '0 25px 50px -12px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(59, 130, 246, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.1)' 
                    : '0 10px 25px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                  zIndex: isCurrent ? 20 : 1
                }}
              >
                {index + 1}
                {state?.status === 'marked_for_review' && state?.user_answer && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
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
      </motion.div>

      {/* Section 3: Premium Status Legend */}
      <motion.div 
        className="p-5 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/30 dark:via-slate-800/30 dark:to-slate-700/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <StatusLegend
          answeredCount={answeredCount}
          notAnsweredCount={notAnsweredCount}
          notVisitedCount={notVisitedCount}
          markedCount={markedCount}
          markedAndAnsweredCount={markedAndAnsweredCount}
          bookmarkedCount={bookmarkedCount}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl border border-slate-200/60 dark:border-slate-700/60"
        />
      </motion.div>

      {/* Section 4: Premium Submit Button */}
      {onSubmitTest && (
        <motion.div 
          className="p-5 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/20 dark:via-slate-800/20 dark:to-slate-700/20 rounded-b-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <motion.button
            onClick={onSubmitTest}
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-base transition-colors duration-300 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-blue-500/25 disabled:shadow-none whitespace-nowrap"
            whileHover={{
              scale: isSubmitting ? 1 : 1.02,
              y: -2
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              boxShadow: isSubmitting
                ? '0 8px 25px -8px rgba(59, 130, 246, 0.3)'
                : '0 20px 40px -12px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="font-bold">Submitting...</span>
              </>
            ) : (
              <>
                <motion.svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </motion.svg>
                <span className="font-bold tracking-wide">{submitLabel}</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Mock Test Data Section */}
      {mockTestData && (
        <motion.div 
          className="p-4 border-t border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
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
        </motion.div>
      )}
        </motion.div>
      ) : (
        // --- Panel Collapsed State - Premium Toggle Button ---
        <motion.div
          key="panel-collapsed"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-30"
        >
          {/* Premium Card Toggle Button */}
          <motion.button
            onClick={() => setIsCollapsed(false)}
            className="w-10 h-20 bg-gradient-to-br from-white to-slate-50 dark:from-slate-50 dark:to-slate-100 border border-slate-200/60 dark:border-slate-300/60 rounded-l-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 group backdrop-blur-md"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
            whileHover={{ 
              scale: 1.05,
              y: -2
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <motion.svg 
                className="w-5 h-5 text-slate-600 dark:text-slate-700 group-hover:text-slate-900 dark:group-hover:text-slate-900 transition-all duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                whileHover={{ scale: 1.2, rotate: -5 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </motion.svg>
            </div>
            {/* Premium card glow effect */}
            <motion.div 
              className="absolute inset-0 rounded-l-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500"
              whileHover={{ opacity: 1 }}
            />
            {/* Subtle inner highlight */}
            <motion.div 
              className="absolute top-0 left-0 right-0 h-1/2 rounded-l-2xl bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ opacity: 1 }}
            />
            {/* Premium shimmer effect */}
            <motion.div
              className="absolute inset-0 rounded-l-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}