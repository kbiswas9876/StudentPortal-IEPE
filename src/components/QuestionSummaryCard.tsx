'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  StarIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Database } from '@/types/database'
import KatexRenderer from './ui/KatexRenderer'

type BookmarkedQuestion = {
  id: number
  question_id: string
  book_source: string
  chapter_name: string
  question_number_in_book: number
  question_text: string
  options: any
  correct_option: string
  solution_text: string | null
  exam_metadata: any
  admin_tags: string[] | null
  difficulty: string | null
  personal_note: string | null
  custom_tags: string[] | null
  bookmark_id: string
  performance: {
    total_attempts: number
    correct_attempts: number
    success_rate: number
    last_attempt_status: string
    last_attempt_time: number | null
    last_attempt_date: string | null
    time_trend: 'faster' | 'slower' | 'none' | null
  }
}

interface QuestionSummaryCardProps {
  question: BookmarkedQuestion
  onEdit: (question: BookmarkedQuestion) => void
  onDelete: (bookmarkId: string) => void
  onViewSolution: (question: BookmarkedQuestion) => void
}

export default function QuestionSummaryCard({
  question,
  onEdit,
  onDelete,
  onViewSolution
}: QuestionSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'incorrect':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      case 'skipped':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'text-green-600 dark:text-green-400'
      case 'incorrect':
        return 'text-red-600 dark:text-red-400'
      case 'skipped':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never attempted'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTimeTrendIcon = (trend: 'faster' | 'slower' | 'none' | null) => {
    if (!trend) return null
    
    switch (trend) {
      case 'faster':
        return <span className="text-green-600 dark:text-green-400" title="Getting faster">↑</span>
      case 'slower':
        return <span className="text-red-600 dark:text-red-400" title="Getting slower">↓</span>
      case 'none':
        return <span className="text-gray-500 dark:text-gray-400" title="No significant change">→</span>
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm font-medium">
                Q.{question.question_number_in_book}
              </span>
              {question.difficulty && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  question.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                  question.difficulty === 'Easy-Moderate' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                  question.difficulty === 'Moderate' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                  question.difficulty === 'Moderate-Hard' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                  'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                }`}>
                  {question.difficulty}
                </span>
              )}
            </div>
            
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
              <KatexRenderer 
                content={question.question_text || 'Question text not available'}
                className="text-sm"
              />
            </div>

            {/* Performance Metrics */}
            <div className="flex items-center space-x-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-1">
                <span className="font-medium">📈 Success Rate:</span>
                <span className={`font-semibold ${
                  question.performance.success_rate >= 80 ? 'text-green-600 dark:text-green-400' :
                  question.performance.success_rate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {question.performance.success_rate}%
                </span>
                <span>({question.performance.correct_attempts}/{question.performance.total_attempts})</span>
              </div>
              
              {question.performance.last_attempt_status !== 'never_attempted' && (
                <div className="flex items-center space-x-1">
                  <span className="font-medium">⏱️ Last Attempt:</span>
                  <span className={`font-semibold ${getStatusColor(question.performance.last_attempt_status)}`}>
                    {question.performance.last_attempt_status === 'correct' ? 'Correct' :
                     question.performance.last_attempt_status === 'incorrect' ? 'Incorrect' : 'Skipped'}
                  </span>
                  <span>({formatTime(question.performance.last_attempt_time)})</span>
                  {getTimeTrendIcon(question.performance.time_trend)}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewSolution(question)}
              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="View Solution"
            >
              <EyeIcon className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(question)}
              className="p-2 text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Edit Note & Tags"
            >
              <PencilIcon className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(question.bookmark_id)}
              className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Remove from Revision Hub"
            >
              <TrashIcon className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Personal Note and Tags */}
        {(question.personal_note || (question.custom_tags && question.custom_tags.length > 0)) && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            {question.personal_note && (
              <div className="mb-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Personal Note:</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  {question.personal_note}
                </p>
              </div>
            )}
            
            {question.custom_tags && question.custom_tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {question.custom_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400">Book Source:</span>
              <p className="text-slate-900 dark:text-slate-100">{question.book_source}</p>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400">Chapter:</span>
              <p className="text-slate-900 dark:text-slate-100">{question.chapter_name}</p>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400">Last Attempted:</span>
              <p className="text-slate-900 dark:text-slate-100">{formatDate(question.performance.last_attempt_date)}</p>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400">Total Attempts:</span>
              <p className="text-slate-900 dark:text-slate-100">{question.performance.total_attempts}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toggle Button */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          {isExpanded ? 'Show Less' : 'Show More Details'}
        </motion.button>
      </div>
    </motion.div>
  )
}