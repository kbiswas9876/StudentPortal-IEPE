'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'
import ReviewStatusLegend from './ReviewStatusLegend'
import { getAdvancedSpeedCategory, type AdvancedDifficulty, type SpeedCategory } from '@/lib/speed-calculator'
import { Bookmark } from 'lucide-react'

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
  timePerQuestion?: Record<string, number> // CRITICAL FIX: Actual timing data (in seconds from answer_log)
}

export default function ReviewPremiumStatusPanel({
  questions,
  reviewStates,
  currentIndex,
  onQuestionSelect,
  onViewAllQuestions,
  bookmarkedMap,
  hideInternalToggle = false,
  timePerQuestion = {} // CRITICAL FIX: Default to empty object if not provided
}: ReviewPremiumStatusPanelProps) {
  // State for panel collapse/expand
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Filter states
  const [activePerformanceFilter, setActivePerformanceFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All')
  const [bookmarksOnly, setBookmarksOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
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

  // CRITICAL FIX: Performance Matrix calculations using ACTUAL timing data
  // This calculation is now stable and deterministic - depends only on questions, reviewStates, and timePerQuestion
  const performanceMatrix = useMemo(() => {
    let correctFast = 0, correctSlow = 0, incorrectFast = 0, incorrectSlow = 0

    questions.forEach((question, index) => {
      const state = reviewStates[index]
      if (!state || state.status === 'skipped') return

      // Determine if answer is correct
      const isCorrect = state.status === 'correct'
      
      // CRITICAL FIX: Get ACTUAL time taken from timePerQuestion prop (already in seconds)
      const timeTakenInSeconds = timePerQuestion[question.id.toString()] || 0
      
      // Use the advanced 5-tier algorithm for accurate speed categorization
      const difficulty = question.difficulty as AdvancedDifficulty
      const speedCategory = getAdvancedSpeedCategory(timeTakenInSeconds, difficulty)

      if (isCorrect && speedCategory === 'Fast') correctFast++
      else if (isCorrect && speedCategory === 'Slow') correctSlow++
      else if (!isCorrect && speedCategory === 'Fast') incorrectFast++
      else if (!isCorrect && speedCategory === 'Slow') incorrectSlow++
    })

    return { correctFast, correctSlow, incorrectFast, incorrectSlow }
  }, [questions, reviewStates, timePerQuestion])

  // CRITICAL FIX: Filter questions based on active filters with ACTUAL timing data
  // This ensures consistent and accurate filtering across all filter types
  const filteredQuestions = useMemo(() => {
    return questions.map((question, index) => {
      const state = reviewStates[index]
      if (!state) return { index, question, state, visible: false }

      let visible = true

      // Performance Matrix filter - USES ACTUAL TIMING DATA NOW
      // CRITICAL FIX: When Performance Matrix filter is active, exclude ALL questions that don't match the criteria
      if (activePerformanceFilter) {
        // If skipped, hide the question when any Performance Matrix filter is active
        if (state.status === 'skipped') {
          visible = false
        } else {
          const isCorrect = state.status === 'correct'
          
          // CRITICAL FIX: Get ACTUAL time taken from timePerQuestion prop (already in seconds)
          const timeTakenInSeconds = timePerQuestion[question.id.toString()] || 0
          
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
          'Correct': 'correct',
          'Incorrect': 'incorrect',
          'Skipped': 'skipped'
        }
        if (statusMap[statusFilter] && state.status !== statusMap[statusFilter]) visible = false
      }

      // Difficulty filter
      if (difficultyFilter !== 'All' && question.difficulty !== difficultyFilter) visible = false

      // CRITICAL FIX: Bookmarks filter - Fixed to work correctly
      // Use question.question_id (string) as the key, not question.id (number)
      if (bookmarksOnly && !bookmarkedMap?.[question.question_id]) visible = false

      return { index, question, state, visible }
    })
  }, [questions, reviewStates, activePerformanceFilter, statusFilter, difficultyFilter, bookmarksOnly, bookmarkedMap, timePerQuestion])

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
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl h-full flex flex-col relative backdrop-blur-sm overflow-visible"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Apple-Inspired Toggle Button - Always Visible (When Panel is Expanded) */}
          {!hideInternalToggle && (
            <motion.button
              onClick={() => setIsCollapsed(true)}
              className="absolute -left-14 top-1/2 -translate-y-1/2 z-[60] group relative w-12 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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
          )}

          {/* Section 1: Premium Header */}
          <motion.div 
            className="px-5 pt-0 pb-2 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/40 dark:via-slate-800/40 dark:to-slate-700/40"
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight m-0">
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

          {/* Section 2: Performance Matrix */}
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
                    ? 'bg-green-500 border-green-600 text-white shadow-lg' 
                    : 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:border-green-600 dark:text-green-200 dark:hover:bg-green-900/60'
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
                    ? 'bg-yellow-500 border-yellow-600 text-white shadow-lg' 
                    : 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:border-yellow-600 dark:text-yellow-200 dark:hover:bg-yellow-900/60'
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
                    ? 'bg-orange-500 border-orange-600 text-white shadow-lg' 
                    : 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/40 dark:border-orange-600 dark:text-orange-200 dark:hover:bg-orange-900/60'
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
                    ? 'bg-red-500 border-red-600 text-white shadow-lg' 
                    : 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200 dark:bg-red-900/40 dark:border-red-600 dark:text-red-200 dark:hover:bg-red-900/60'
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

          {/* Section 3: Compact Filter Button */}
          <motion.div 
            className="p-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/20 dark:via-slate-800/20 dark:to-slate-700/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="relative">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Advanced Filters</span>
                </div>
                <svg 
                  className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              {/* Filter Popover */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-lg z-50"
                  >
                    <div className="space-y-3">
                      {/* Two-column layout for Status and Difficulty filters */}
                      <div className="grid grid-cols-2 gap-3">
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
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Section 4: Premium Question Grid */}
          <motion.div 
            className="flex-1 px-5 pt-3 pb-3 overflow-y-auto min-h-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="grid grid-cols-5 gap-3">
              {filteredQuestions
                .filter(({ visible }) => visible) // Only show visible questions
                .map(({ index, question, state, visible }) => {
                const isCurrent = index === currentIndex
                const hasBookmark = bookmarkedMap && questions[index]?.question_id
                  ? !!bookmarkedMap[String(questions[index].question_id)]
                  : false

                return (
                  <motion.button
                    key={index}
                    onClick={() => onQuestionSelect(index)}
                  className={`
                    relative w-14 h-14 rounded-xl border-2 transition-colors duration-300 font-bold text-sm
                    ${getQuestionColor(index)}
                    ${isCurrent ? 'ring-3 ring-blue-500/50 dark:ring-blue-400/50 shadow-2xl scale-110' : 'hover:shadow-xl hover:scale-105'}
                    backdrop-blur-sm
                  `}
                  whileHover={{ 
                    scale: isCurrent ? 1.15 : 1.08,
                    y: isCurrent ? -4 : -2,
                    rotateX: isCurrent ? 8 : 3,
                    rotateY: isCurrent ? 4 : 2,
                    z: 10
                  }}
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

        </motion.div>
      ) : (
        // --- Panel Collapsed State - Apple-Inspired Toggle Button ---
        <motion.div
          key="panel-collapsed"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed right-12 top-1/2 -translate-y-1/2 z-50 mr-4"
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
