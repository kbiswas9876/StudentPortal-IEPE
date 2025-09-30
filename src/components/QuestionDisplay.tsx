'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database } from '@/types/database'
import { FlagIcon } from '@heroicons/react/24/outline'

type Question = Database['public']['Tables']['questions']['Row']

interface QuestionDisplayProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  userAnswer: string | null
  isBookmarked: boolean
  onAnswerChange: (answer: string) => void
  onBookmark: () => void
  onReportError?: () => void
}

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  isBookmarked,
  onAnswerChange,
  onBookmark,
  onReportError
}: QuestionDisplayProps) {
  const [isBookmarking, setIsBookmarking] = useState(false)

  const handleBookmark = async () => {
    if (isBookmarking) return
    
    setIsBookmarking(true)
    await onBookmark()
    setIsBookmarking(false)
  }

  const options = question.options as Record<string, string> || {}

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg font-semibold">
            Question {questionNumber} of {totalQuestions}
          </div>
          {onReportError && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReportError}
              className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Report an issue with this question (Alt + R)"
            >
              <FlagIcon className="h-4 w-4" />
            </motion.button>
          )}
          {question.difficulty && (
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
              question.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
              question.difficulty === 'Easy-Moderate' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
              question.difficulty === 'Moderate' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
              question.difficulty === 'Moderate-Hard' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
              'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {question.difficulty}
            </div>
          )}
        </div>
        
        <motion.button
          onClick={handleBookmark}
          disabled={isBookmarking}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200
            ${isBookmarked 
              ? 'bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200' 
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.svg
            className="w-5 h-5"
            fill={isBookmarked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={isBookmarking ? { rotate: 360 } : {}}
            transition={{ duration: 0.5 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </motion.svg>
          <span className="font-medium">
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </span>
        </motion.button>
      </div>

      {/* Question Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 mb-8 shadow-sm"
      >
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div 
            className="text-slate-900 dark:text-slate-100 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.question_text }}
          />
        </div>
      </motion.div>

      {/* Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        {Object.entries(options).map(([key, value]) => (
          <motion.label
            key={key}
            className={`
              block p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md
              ${userAnswer === key
                ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600 shadow-md'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-600'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-4">
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center font-semibold text-sm
                ${userAnswer === key
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                }
              `}>
                {userAnswer === key && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                )}
              </div>
              
              <input
                type="radio"
                name="answer"
                value={key}
                checked={userAnswer === key}
                onChange={(e) => onAnswerChange(e.target.value)}
                className="sr-only"
              />
              
              <div className="flex-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {key.toUpperCase()}
                </div>
                <div 
                  className="text-slate-700 dark:text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              </div>
            </div>
          </motion.label>
        ))}
      </motion.div>

      {/* Question Metadata */}
      {(question.exam_metadata || question.admin_tags) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            Question Details
          </h4>
          
          {question.exam_metadata && (
            <div className="mb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Source: </span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{question.exam_metadata}</span>
            </div>
          )}
          
          {question.admin_tags && question.admin_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Tags: </span>
              {question.admin_tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
