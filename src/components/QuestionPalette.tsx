'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Database } from '@/types/database'
import { QuestionStatus } from './PracticeInterface'
import StatusLegend from './StatusLegend'
import type { MatrixCounts, QuadrantKey } from './StrategicPerformanceMatrix'

type Question = Database['public']['Tables']['questions']['Row']

type ReviewStatus = 'correct' | 'incorrect' | 'skipped'
type StatusFilter = 'all' | ReviewStatus
type DifficultyFilter =
  | 'all'
  | 'Easy'
  | 'Easy-Moderate'
  | 'Moderate'
  | 'Moderate-Hard'
  | 'Hard'
  | string

interface QuestionPaletteProps {
  questions: Question[]

  // Practice mode props (kept for backward compatibility)
  sessionStates?: Array<{
    status: QuestionStatus
    user_answer: string | null
    is_bookmarked: boolean
  }>

  // Review mode props
  reviewStates?: Array<{
    status: ReviewStatus
  }>

  // Shared navigation
  currentIndex: number
  onQuestionSelect: (index: number) => void

  // Optional submit button (practice)
  onSubmitTest?: () => void
  isSubmitting?: boolean

  // Optional custom action button (review mode)
  customActionButton?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }

  // New: Filtering support (provided by parent - Solutions page)
  // If provided, only these indices will be displayed and navigated
  filteredIndices?: number[]

  // New: Controls visibility (Solutions page enables this)
  showFilters?: boolean

  // New: Compact Strategic Matrix (counts + handler)
  matrixCounts?: MatrixCounts
  onQuadrantChange?: (quadrant: QuadrantKey | 'all') => void

  // New: Advanced filters (status, difficulty, bookmark-only)
  statusFilter?: StatusFilter
  onStatusFilterChange?: (filter: StatusFilter) => void

  difficultyFilter?: DifficultyFilter
  onDifficultyFilterChange?: (filter: DifficultyFilter) => void

  bookmarkOnly?: boolean
  onBookmarkOnlyChange?: (enabled: boolean) => void

  // New: Bookmark map for review palette badges (keyed by questions.question_id)
  bookmarkedMap?: Record<string, boolean>
}

export default function QuestionPalette({
  questions,
  sessionStates,
  reviewStates,
  currentIndex,
  onQuestionSelect,
  onSubmitTest,
  isSubmitting = false,
  customActionButton,

  // New props with sensible defaults
  filteredIndices,
  showFilters = false,
  matrixCounts,
  onQuadrantChange,
  statusFilter = 'all',
  onStatusFilterChange,
  difficultyFilter = 'all',
  onDifficultyFilterChange,
  bookmarkOnly = false,
  onBookmarkOnlyChange,
  bookmarkedMap
}: QuestionPaletteProps) {
  const hasReview = Array.isArray(reviewStates) && reviewStates.length > 0

  // Determine which indices to display (fallback to all)
  const indicesToShow = useMemo(() => {
    if (Array.isArray(filteredIndices) && filteredIndices.length > 0) {
      return filteredIndices
    }
    return questions.map((_, idx) => idx)
  }, [filteredIndices, questions])

  const getQuestionColor = (index: number) => {
    // Detailed Solution Review mode (correct/incorrect/skipped)
    const review = reviewStates?.[index]
    if (review) {
      switch (review.status) {
        case 'correct':
          return 'bg-green-500 text-white border-green-500'
        case 'incorrect':
          return 'bg-red-500 text-white border-red-500'
        case 'skipped':
        default:
          return 'bg-slate-400 text-white border-slate-400'
      }
    }

    // Practice mode (visited/answered/marked)
    const state = sessionStates?.[index]
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

  // Counts for headers/legend
  const correctCount = hasReview ? (reviewStates?.filter(s => s.status === 'correct').length ?? 0) : 0
  const incorrectCount = hasReview ? (reviewStates?.filter(s => s.status === 'incorrect').length ?? 0) : 0
  const skippedCount = hasReview ? (reviewStates?.filter(s => s.status === 'skipped').length ?? 0) : 0

  const answeredCount = sessionStates?.filter(s => s.status === 'answered').length ?? 0
  const notAnsweredCount = sessionStates?.filter(s => s.status === 'unanswered').length ?? 0
  const notVisitedCount = sessionStates?.filter(s => s.status === 'not_visited').length ?? 0
  const markedCount = sessionStates?.filter(s => s.status === 'marked_for_review').length ?? 0
  const markedAndAnsweredCount = sessionStates?.filter(s => s.status === 'marked_for_review' && s.user_answer).length ?? 0
  const bookmarkedCountPractice = sessionStates?.filter(s => s.is_bookmarked).length ?? 0

  const headerDisplay = `${indicesToShow.length} / ${questions.length}`

  const difficulties: DifficultyFilter[] = [
    'all',
    'Easy',
    'Easy-Moderate',
    'Moderate',
    'Moderate-Hard',
    'Hard'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl h-full flex flex-col"
    >
      {/* Section 1: Header + Filters (Solutions mode) */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Questions
          </h3>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md">
            {headerDisplay}
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 space-y-3">
            {/* Compact Strategic Matrix Row */}
            {matrixCounts && (
              <div className="grid grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => onQuadrantChange?.('all')}
                  className="col-span-1 px-2 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                  title="Show All"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => onQuadrantChange?.('strengths')}
                  className="px-2 py-2 text-xs rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100/70"
                  title="Strengths (Correct & Fast)"
                >
                  S: {matrixCounts.strengths}
                </button>
                <button
                  type="button"
                  onClick={() => onQuadrantChange?.('needsSpeed')}
                  className="px-2 py-2 text-xs rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100/70"
                  title="Needs Speed (Correct & Slow)"
                >
                  NS: {matrixCounts.needsSpeed}
                </button>
                <button
                  type="button"
                  onClick={() => onQuadrantChange?.('carelessErrors')}
                  className="px-2 py-2 text-xs rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100/70"
                  title="Careless Errors (Incorrect & Fast)"
                >
                  CE: {matrixCounts.carelessErrors}
                </button>
                <button
                  type="button"
                  onClick={() => onQuadrantChange?.('weaknesses')}
                  className="px-2 py-2 text-xs rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100/70"
                  title="Weaknesses (Incorrect & Slow)"
                >
                  W: {matrixCounts.weaknesses}
                </button>
              </div>
            )}

            {/* Advanced Filters Row */}
            <div className="grid grid-cols-3 gap-2">
              {/* Status Filter */}
              <div className="col-span-1">
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange?.(e.target.value as StatusFilter)}
                  className="w-full text-sm px-2 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">All</option>
                  <option value="correct">Correct</option>
                  <option value="incorrect">Incorrect</option>
                  <option value="skipped">Skipped</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="col-span-1">
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => onDifficultyFilterChange?.(e.target.value as DifficultyFilter)}
                  className="w-full text-sm px-2 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  {difficulties.map(d => (
                    <option key={d} value={d}>{d === 'all' ? 'All' : d}</option>
                  ))}
                </select>
              </div>

              {/* Bookmark Only */}
              <div className="col-span-1 flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={!!bookmarkOnly}
                    onChange={(e) => onBookmarkOnlyChange?.(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                  Bookmarks only
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Scrollable Question Grid - respects filters */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        <div className="grid grid-cols-5 gap-2">
          {indicesToShow.map((index) => {
            const isCurrent = index === currentIndex

            // Practice bookmark indicator
            const practiceState = sessionStates?.[index]
            const practiceBookmark = practiceState?.is_bookmarked

            // Review bookmark indicator (from map keyed by question_id)
            const reviewBookmark = bookmarkedMap && questions[index]?.question_id
              ? !!bookmarkedMap[String(questions[index].question_id)]
              : false

            const showBookmarkBadge = hasReview ? reviewBookmark : !!practiceBookmark

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
                title={`Question ${index + 1}`}
              >
                {index + 1}

                {/* "Marked and Answered" dot in practice mode */}
                {!hasReview && practiceState?.status === 'marked_for_review' && practiceState?.user_answer && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full shadow-sm"></div>
                )}

                {/* Bookmark badge for both modes */}
                {showBookmarkBadge && (
                  <div className="absolute -top-1 -right-1">
                    <svg className="w-2.5 h-2.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Section 3: Status Summary / Legend */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-800/30">
        {hasReview ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-6 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{correctCount}</span>
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300">Correct</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-6 bg-red-500 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{incorrectCount}</span>
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300">Incorrect</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-6 bg-slate-400 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{skippedCount}</span>
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300">Skipped</span>
              </div>
            </div>
          </div>
        ) : (
          <StatusLegend
            answeredCount={answeredCount}
            notAnsweredCount={notAnsweredCount}
            notVisitedCount={notVisitedCount}
            markedCount={markedCount}
            markedAndAnsweredCount={markedAndAnsweredCount}
            bookmarkedCount={bookmarkedCountPractice}
            className="bg-white dark:bg-slate-800 shadow-sm"
          />
        )}
      </div>

      {/* Section 4: Submit Button (practice mode only) */}
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
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Submit Test</span>
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Section 5: Custom Action Button (review mode) */}
      {customActionButton && !onSubmitTest && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <motion.button
            onClick={customActionButton.onClick}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl ${
              customActionButton.variant === 'secondary'
                ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>{customActionButton.label}</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
