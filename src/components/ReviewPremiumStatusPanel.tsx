'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'
import ReviewStatusLegend from './ReviewStatusLegend'

type Question = Database['public']['Tables']['questions']['Row']
type ReviewStatus = 'correct' | 'incorrect' | 'skipped'

interface ReviewPremiumStatusPanelProps {
  questions: Question[]
  reviewStates: Array<{
    status: ReviewStatus
  }>
  currentIndex: number
  onQuestionSelect: (index: number) => void
  onViewAllQuestions?: () => void
  bookmarkedMap?: Record<string, boolean>
  hideInternalToggle?: boolean
}

export default function ReviewPremiumStatusPanel({
  questions,
  reviewStates,
  currentIndex,
  onQuestionSelect,
  onViewAllQuestions,
  bookmarkedMap,
  hideInternalToggle = false,
}: ReviewPremiumStatusPanelProps) {
  // State for panel collapse/expand
  const [isCollapsed, setIsCollapsed] = useState(false)
  // When external page controls collapse, hide internal toggle UI and keep panel visible
  const showCollapsed = !hideInternalToggle && isCollapsed

  // Color logic for review mode
  const getQuestionColor = (index: number) => {
    const state = reviewStates[index]
    if (!state) return 'bg-slate-400 text-white border-slate-400'

    switch (state.status) {
      case 'correct':
        return 'bg-green-500 text-white border-green-500'
      case 'incorrect':
        return 'bg-red-500 text-white border-red-500'
      case 'skipped':
      default:
        return 'bg-slate-400 text-white border-slate-400'
    }
  }

  // Calculate counts for review mode
  const correctCount = reviewStates.filter(s => s.status === 'correct').length
  const incorrectCount = reviewStates.filter(s => s.status === 'incorrect').length
  const skippedCount = reviewStates.filter(s => s.status === 'skipped').length

  return (
    <AnimatePresence>
      {!showCollapsed ? (
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
          {!hideInternalToggle && (
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
          )}

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
                {questions.length} / {questions.length}
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
                const isCurrent = index === currentIndex
                const hasBookmark = bookmarkedMap && questions[index]?.question_id
                  ? !!bookmarkedMap[String(questions[index].question_id)]
                  : false

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

          {/* Section 3: Premium Status Legend for Review Mode */}
          <motion.div 
            className="p-5 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/30 dark:via-slate-800/30 dark:to-slate-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <ReviewStatusLegend
              correctCount={correctCount}
              incorrectCount={incorrectCount}
              skippedCount={skippedCount}
            />
          </motion.div>

          {/* Section 4: Premium Action Button */}
          {onViewAllQuestions && (
            <motion.div 
              className="p-5 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/20 dark:via-slate-800/20 dark:to-slate-700/20 rounded-b-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <motion.button
                onClick={onViewAllQuestions}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-blue-500/25 whitespace-nowrap"
                whileHover={{ 
                  scale: 1.02,
                  y: -2
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  boxShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
              >
                <motion.svg 
                  className="w-6 h-6 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </motion.svg>
                <span className="font-bold tracking-wide">View All Questions</span>
              </motion.button>
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
