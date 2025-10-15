'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'
import { QuestionStatus } from './PracticeInterface'
// The 'Timer' import is removed as it's not part of this component's responsibility.
import StatusLegend from './StatusLegend'
import ReviewStatusLegend from './ReviewStatusLegend'
import { getAdvancedSpeedCategory, type AdvancedDifficulty, type SpeedCategory } from '@/lib/speed-calculator'
import { Bookmark } from 'lucide-react'

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
  isReviewMode?: boolean // New prop to control which features are shown
  timePerQuestion?: Record<string, number> // CRITICAL FIX: Actual timing data (in milliseconds)
}

export default function PremiumStatusPanel({
  questions,
  sessionStates,
  currentIndex,
  onQuestionSelect,
  onSubmitTest,
  isSubmitting = false,
  submitLabel = 'Submit Test',
  mockTestData,
  isReviewMode = false,
  timePerQuestion = {} // CRITICAL FIX: Default to empty object if not provided
}: PremiumStatusPanelProps) {
  // State for panel collapse/expand
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Filter states
  const [activePerformanceFilter, setActivePerformanceFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All')
  const [bookmarksOnly, setBookmarksOnly] = useState(false)

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

  // CRITICAL FIX: Performance Matrix calculations using ACTUAL timing data
  // This calculation is now stable and deterministic - depends only on questions, sessionStates, and timePerQuestion
  const performanceMatrix = useMemo(() => {
    let correctFast = 0, correctSlow = 0, incorrectFast = 0, incorrectSlow = 0

    questions.forEach((question, index) => {
      const state = sessionStates[index]
      if (!state || !state.user_answer) return

      // Determine if answer is correct
      const isCorrect = state.user_answer === question.correct_option
      
      // CRITICAL FIX: Get ACTUAL time taken from timePerQuestion prop
      const timeInMs = timePerQuestion[question.id.toString()] || 0
      const timeTakenInSeconds = Math.floor(timeInMs / 1000)
      
      // Use the advanced 5-tier algorithm for accurate speed categorization
      const difficulty = question.difficulty as AdvancedDifficulty
      const speedCategory = getAdvancedSpeedCategory(timeTakenInSeconds, difficulty)

      if (isCorrect && speedCategory === 'Fast') correctFast++
      else if (isCorrect && speedCategory === 'Slow') correctSlow++
      else if (!isCorrect && speedCategory === 'Fast') incorrectFast++
      else if (!isCorrect && speedCategory === 'Slow') incorrectSlow++
    })

    return { correctFast, correctSlow, incorrectFast, incorrectSlow }
  }, [questions, sessionStates, timePerQuestion])

  // CRITICAL FIX: Filter questions based on active filters with ACTUAL timing data
  // This ensures consistent and accurate filtering across all filter types
  const filteredQuestions = useMemo(() => {
    return questions.map((question, index) => {
      const state = sessionStates[index]
      if (!state) return { index, question, state, visible: false }

      let visible = true

      // Performance Matrix filter - USES ACTUAL TIMING DATA NOW
      // CRITICAL FIX: When Performance Matrix filter is active, exclude ALL questions that don't match the criteria
      if (activePerformanceFilter) {
        // If no user answer (skipped), hide the question when any Performance Matrix filter is active
        if (!state.user_answer) {
          visible = false
        } else {
          const isCorrect = state.user_answer === question.correct_option
          
          // CRITICAL FIX: Get ACTUAL time taken from timePerQuestion prop
          const timeInMs = timePerQuestion[question.id.toString()] || 0
          const timeTakenInSeconds = Math.floor(timeInMs / 1000)
          
          // Use the advanced 5-tier algorithm for accurate speed categorization
          const difficulty = question.difficulty as AdvancedDifficulty
          const speedCategory = getAdvancedSpeedCategory(timeTakenInSeconds, difficulty)

          if (activePerformanceFilter === 'correct-fast' && !(isCorrect && speedCategory === 'Fast')) visible = false
          else if (activePerformanceFilter === 'correct-slow' && !(isCorrect && speedCategory === 'Slow')) visible = false
          else if (activePerformanceFilter === 'incorrect-fast' && !(!isCorrect && speedCategory === 'Fast')) visible = false
          else if (activePerformanceFilter === 'incorrect-slow' && !(!isCorrect && speedCategory === 'Slow')) visible = false
        }
      }

      // Status filter
      if (statusFilter !== 'All') {
        const statusMap: Record<string, string> = {
          'Correct': 'answered',
          'Incorrect': 'unanswered',
          'Skipped': 'not_visited'
        }
        if (statusMap[statusFilter] && state.status !== statusMap[statusFilter]) visible = false
      }

      // Difficulty filter
      if (difficultyFilter !== 'All' && question.difficulty !== difficultyFilter) visible = false

      // CRITICAL FIX: Bookmarks filter - Fixed to work correctly
      if (bookmarksOnly && !state.is_bookmarked) visible = false

      return { index, question, state, visible }
    })
  }, [questions, sessionStates, activePerformanceFilter, statusFilter, difficultyFilter, bookmarksOnly, timePerQuestion])

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
          {/* Apple-Inspired Toggle Button - Always Visible (When Panel is Expanded) */}
          <motion.button
            onClick={() => setIsCollapsed(true)}
            className="absolute -left-12 top-1/2 -translate-y-1/2 z-30 group relative w-12 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
            whileHover={{ 
              scale: 1.08,
              y: -1
            }}
            whileTap={{ scale: 0.96 }}
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {/* Subtle background glow */}
            <motion.div 
              className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            
            {/* Main icon container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.svg 
                className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 3
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </motion.svg>
            </div>

            {/* Subtle pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-500/20 opacity-0"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut"
              }}
            />

            {/* Premium indicator dot */}
            <motion.div 
              className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shadow-sm"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
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

      {/* Section 2: Performance Matrix - Only in Review Mode */}
      {isReviewMode && (
        <motion.div 
          className="p-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/30 dark:via-slate-800/30 dark:to-slate-700/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Performance Matrix</h4>
        <div className="grid grid-cols-2 gap-2">
          {/* Correct & Fast */}
          <motion.button
            onClick={() => setActivePerformanceFilter(activePerformanceFilter === 'correct-fast' ? null : 'correct-fast')}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              activePerformanceFilter === 'correct-fast' 
                ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:border-green-400 dark:text-green-300' 
                : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Correct & Fast</span>
              <span className="text-sm font-bold">{performanceMatrix.correctFast}</span>
            </div>
          </motion.button>

          {/* Correct & Slow */}
          <motion.button
            onClick={() => setActivePerformanceFilter(activePerformanceFilter === 'correct-slow' ? null : 'correct-slow')}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              activePerformanceFilter === 'correct-slow' 
                ? 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-400 dark:text-yellow-300' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/30'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Correct & Slow</span>
              <span className="text-sm font-bold">{performanceMatrix.correctSlow}</span>
            </div>
          </motion.button>

          {/* Incorrect & Fast */}
          <motion.button
            onClick={() => setActivePerformanceFilter(activePerformanceFilter === 'incorrect-fast' ? null : 'incorrect-fast')}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              activePerformanceFilter === 'incorrect-fast' 
                ? 'bg-orange-100 border-orange-500 text-orange-800 dark:bg-orange-900/30 dark:border-orange-400 dark:text-orange-300' 
                : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/30'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Incorrect & Fast</span>
              <span className="text-sm font-bold">{performanceMatrix.incorrectFast}</span>
            </div>
          </motion.button>

          {/* Incorrect & Slow */}
          <motion.button
            onClick={() => setActivePerformanceFilter(activePerformanceFilter === 'incorrect-slow' ? null : 'incorrect-slow')}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              activePerformanceFilter === 'incorrect-slow' 
                ? 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-400 dark:text-red-300' 
                : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Incorrect & Slow</span>
              <span className="text-sm font-bold">{performanceMatrix.incorrectSlow}</span>
            </div>
          </motion.button>
        </div>
        </motion.div>
      )}

      {/* Section 3: Advanced Filter Controls - Only in Review Mode */}
      {isReviewMode && (
        <motion.div 
          className="p-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/20 dark:via-slate-800/20 dark:to-slate-700/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Advanced Filters</h4>
        <div className="space-y-3">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All</option>
              <option value="Correct">Correct</option>
              <option value="Incorrect">Incorrect</option>
              <option value="Skipped">Skipped</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Filter by Difficulty</label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Bookmarks Only Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Bookmarks only</label>
            <button
              onClick={() => setBookmarksOnly(!bookmarksOnly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                bookmarksOnly ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  bookmarksOnly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        </motion.div>
      )}

      {/* Section 4: Premium Question Grid */}
      <motion.div 
        className="flex-1 p-5 overflow-y-auto min-h-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <div className="grid grid-cols-5 gap-3">
          {/* CRITICAL FIX: ALWAYS use filteredQuestions for consistent filtering in both practice and review modes */}
          {filteredQuestions.map(({ index, question, state, visible }) => {
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
                  ${!visible ? 'opacity-30 grayscale' : ''}
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
                {/* Small bookmark overview indicator - top-left corner */}
                {hasBookmark && (
                  <div className="absolute -top-1 -left-1">
                    <Bookmark className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Section 5: Premium Status Legend */}
      <motion.div 
        className="p-5 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/30 dark:via-slate-800/30 dark:to-slate-700/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {isReviewMode ? (
          <ReviewStatusLegend
            correctCount={answeredCount}
            incorrectCount={notAnsweredCount}
            skippedCount={notVisitedCount}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl border border-slate-200/60 dark:border-slate-700/60"
          />
        ) : (
          <StatusLegend
            answeredCount={answeredCount}
            notAnsweredCount={notAnsweredCount}
            notVisitedCount={notVisitedCount}
            markedCount={markedCount}
            markedAndAnsweredCount={markedAndAnsweredCount}
            bookmarkedCount={bookmarkedCount}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl border border-slate-200/60 dark:border-slate-700/60"
          />
        )}
      </motion.div>

      {/* Section 6: Premium Submit Button */}
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
        // --- Panel Collapsed State - Apple-Inspired Toggle Button ---
        <motion.div
          key="panel-collapsed"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-30"
        >
          {/* Apple-Inspired Minimal Toggle Button */}
          <motion.button
            onClick={() => setIsCollapsed(false)}
            className="group relative w-12 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
            whileHover={{ 
              scale: 1.08,
              y: -1
            }}
            whileTap={{ scale: 0.96 }}
          >
            {/* Subtle background glow */}
            <motion.div 
              className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            
            {/* Main icon container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.svg 
                className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
                whileHover={{ 
                  scale: 1.1,
                  rotate: -3
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </motion.svg>
            </div>

            {/* Subtle pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-500/20 opacity-0"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut"
              }}
            />

            {/* Premium indicator dot */}
            <motion.div 
              className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shadow-sm"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}