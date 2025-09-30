'use client'

import { motion } from 'framer-motion'
import { Database } from '@/types/database'
import { QuestionStatus } from './PracticeInterface'

type Question = Database['public']['Tables']['questions']['Row']

interface QuestionPaletteProps {
  questions: Question[]
  sessionStates: Array<{
    status: QuestionStatus
    user_answer: string | null
    time_taken: number
    is_bookmarked: boolean
  }>
  currentIndex: number
  onQuestionSelect: (index: number) => void
}

export default function QuestionPalette({
  questions,
  sessionStates,
  currentIndex,
  onQuestionSelect
}: QuestionPaletteProps) {
  const getQuestionColor = (index: number) => {
    const state = sessionStates[index]
    if (!state) return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'

    switch (state.status) {
      case 'not_visited':
        return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
      case 'unanswered':
        return 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
      case 'answered':
        return 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
      case 'marked_for_review':
        return 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
      default:
        return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
    }
  }

  const getQuestionBorderColor = (index: number) => {
    if (index === currentIndex) {
      return 'ring-2 ring-blue-500 dark:ring-blue-400'
    }
    return ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Questions
        </h3>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {sessionStates.filter(s => s.status === 'answered').length} / {questions.length}
        </div>
      </div>

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
                relative w-12 h-12 rounded-lg border-2 transition-all duration-200
                ${getQuestionColor(index)}
                ${getQuestionBorderColor(index)}
                hover:scale-105 active:scale-95
                ${isCurrent ? 'shadow-lg' : 'hover:shadow-md'}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-semibold text-sm">
                {index + 1}
              </span>
              
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

      {/* Legend */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700"></div>
          <span className="text-slate-600 dark:text-slate-400">Not visited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-red-200 dark:bg-red-800"></div>
          <span className="text-slate-600 dark:text-slate-400">Unanswered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-800"></div>
          <span className="text-slate-600 dark:text-slate-400">Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-purple-200 dark:bg-purple-800"></div>
          <span className="text-slate-600 dark:text-slate-400">Marked for review</span>
        </div>
      </div>
    </div>
  )
}
