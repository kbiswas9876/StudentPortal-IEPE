'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  StarIcon, 
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import KatexRenderer from './ui/KatexRenderer'
import { Database } from '@/types/database'

interface BookmarkedQuestion {
  id: string
  user_id: string
  question_id: string
  personal_note: string | null
  custom_tags: string[] | null
  created_at: string
  updated_at: string
  questions: Database['public']['Tables']['questions']['Row']
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

interface BookmarkedQuestionCardProps {
  question: BookmarkedQuestion
  index: number
}

export default function BookmarkedQuestionCard({ question, index }: BookmarkedQuestionCardProps) {
  // Placeholder for user difficulty rating (5-star system)
  // This will be added in a later phase
  const userDifficultyRating = 0 // 0-5 scale

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'text-green-600 dark:text-green-400'
      case 'incorrect':
        return 'text-red-600 dark:text-red-400'
      case 'skipped':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-slate-500 dark:text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'incorrect':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      case 'skipped':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-slate-400" />
    }
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'Easy-Moderate':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'Moderate':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
      case 'Moderate-Hard':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      case 'Hard':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                {question.questions.book_source} #{question.questions.question_number_in_book}
              </span>
              {question.questions.difficulty && (
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getDifficultyColor(question.questions.difficulty)}`}>
                  {question.questions.difficulty}
                </span>
              )}
            </div>
            
            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-4">
              <span className="flex items-center">
                <BookOpenIcon className="h-3 w-3 mr-1" />
                {question.questions.chapter_name}
              </span>
              <span className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Bookmarked: {formatDate(question.created_at)}
              </span>
            </div>
          </div>

          {/* Personal Difficulty Rating (Read-only for now) */}
          <div className="ml-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 text-center">
              My Rating
            </div>
            <div className="flex space-x-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star}>
                  {star <= userDifficultyRating ? (
                    <StarSolidIcon className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <StarIcon className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="px-6 py-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Question:
          </h3>
          <div className="text-slate-900 dark:text-slate-100">
            <KatexRenderer 
              content={question.questions.question_text || 'Question text not available'}
              className="text-base leading-relaxed"
            />
          </div>
        </div>

        {/* Options */}
        {question.questions.options && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Options:
            </h4>
            {Object.entries(question.questions.options).map(([key, value]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border ${
                  key === question.questions.correct_option
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30'
                }`}
              >
                <div className="flex items-start">
                  <span className={`font-semibold mr-3 ${
                    key === question.questions.correct_option
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {key}.
                  </span>
                  <div className="flex-1">
                    <KatexRenderer 
                      content={value as string}
                      className="text-sm"
                    />
                  </div>
                  {key === question.questions.correct_option && (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata Section */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
        {/* Custom Tags */}
        {question.custom_tags && question.custom_tags.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              My Tags:
            </h4>
            <div className="flex flex-wrap gap-2">
              {question.custom_tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Personal Note */}
        {question.personal_note && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              My Note:
            </h4>
            <div className="bg-white dark:bg-slate-800 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                &ldquo;{question.personal_note}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Success Rate</div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold ${
                question.performance.success_rate >= 80 ? 'text-green-600 dark:text-green-400' :
                question.performance.success_rate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                question.performance.success_rate > 0 ? 'text-red-600 dark:text-red-400' :
                'text-slate-400 dark:text-slate-500'
              }`}>
                {question.performance.success_rate}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({question.performance.correct_attempts}/{question.performance.total_attempts})
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Last Attempt</div>
            {question.performance.last_attempt_status !== 'never_attempted' ? (
              <div>
                <div className={`flex items-center space-x-2 mb-1 ${getStatusColor(question.performance.last_attempt_status)}`}>
                  {getStatusIcon(question.performance.last_attempt_status)}
                  <span className="text-sm font-semibold capitalize">
                    {question.performance.last_attempt_status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {formatTime(question.performance.last_attempt_time)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 dark:text-slate-500">
                Never attempted
              </div>
            )}
          </div>
        </div>

        {/* Exam Metadata */}
        {question.questions.exam_metadata && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
              Exam Appearance:
            </h4>
            <p className="text-sm text-blue-900 dark:text-blue-200">
              {question.questions.exam_metadata}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

