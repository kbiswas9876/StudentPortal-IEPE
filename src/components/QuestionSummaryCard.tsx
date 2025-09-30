'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Database } from '@/types/database'

type BookmarkedQuestion = Database['public']['Tables']['bookmarked_questions']['Row'] & {
  questions: Database['public']['Tables']['questions']['Row']
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
  const question = bookmark.questions

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 p-4"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Question Content */}
        <div className="flex-1 min-w-0">
          {/* Question Preview */}
          <div className="mb-3">
            <p className="text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
              {question.question_text}
            </p>
          </div>

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
            <div className="flex flex-wrap gap-2 mb-3">
              {bookmark.custom_tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Question Metadata */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Q{question.question_number_in_book}</span>
            {question.difficulty && (
              <span className={`px-2 py-1 rounded-full ${
                question.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                question.difficulty === 'Easy-Moderate' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                question.difficulty === 'Moderate' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {question.difficulty}
              </span>
            )}
            {question.exam_metadata && (
              <span>{question.exam_metadata}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            title="Edit note and tags"
          >
            <PencilIcon className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Remove from revision hub"
          >
            <TrashIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}