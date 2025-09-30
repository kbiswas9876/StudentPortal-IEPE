'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon, EyeIcon, BookmarkIcon } from '@heroicons/react/24/outline'

type BookmarkedQuestion = {
  id: number
  personal_note: string | null
  custom_tags: string[] | null
  created_at: string
  questions: any
}

interface QuestionSummaryCardProps {
  bookmark: BookmarkedQuestion
  onEdit: () => void
  onDelete: () => void
}

export default function QuestionSummaryCard({
  bookmark,
  onEdit,
  onDelete
}: QuestionSummaryCardProps) {
  const [showSolution, setShowSolution] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Q.{bookmark.questions.question_number_in_book}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-500">
              {formatDate(bookmark.created_at)}
            </span>
          </div>
          
          <p className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed mb-3">
            {truncateText(bookmark.questions.question_text)}
          </p>

          {/* Personal Note */}
          {bookmark.personal_note && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">Note:</span> {bookmark.personal_note}
              </p>
            </div>
          )}

          {/* Custom Tags */}
          {bookmark.custom_tags && bookmark.custom_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {bookmark.custom_tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSolution(!showSolution)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            title="View Solution"
          >
            <EyeIcon className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
            title="Edit Note/Tags"
          >
            <PencilIcon className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Remove Bookmark"
          >
            <TrashIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Solution Preview */}
      {showSolution && bookmark.questions.solution_text && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600"
        >
          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Solution:
          </h5>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {bookmark.questions.solution_text}
          </p>
        </motion.div>
      )}

      {/* Question Options Preview */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(bookmark.questions.options || {}).map(([key, value]) => (
            <div key={key} className="text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                {key.toUpperCase()}:
              </span>
              <span className="ml-1 text-slate-500 dark:text-slate-500">
                {typeof value === 'string' ? value : String(value)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs">
          <span className="font-medium text-green-600 dark:text-green-400">
            Correct: {bookmark.questions.correct_option?.toUpperCase()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
