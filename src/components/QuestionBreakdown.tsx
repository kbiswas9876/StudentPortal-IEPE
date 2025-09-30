'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'

type AnswerLog = Database['public']['Tables']['answer_log']['Row']
type Question = Database['public']['Tables']['questions']['Row']

interface QuestionData extends AnswerLog {
  question: Question
}

interface QuestionBreakdownProps {
  questions: QuestionData[]
  onBookmark: (questionId: string) => void
  onReportError: (questionId: string) => void
  peerAverages: Record<number, number>
}

export default function QuestionBreakdown({ questions, onBookmark, onReportError, peerAverages }: QuestionBreakdownProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleSolution = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <span className="text-2xl text-green-600">✅</span>
      case 'incorrect':
        return <span className="text-2xl text-red-600">❌</span>
      case 'skipped':
        return <span className="text-2xl">⏭️</span>
      default:
        return <span className="text-2xl">❓</span>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'incorrect':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'skipped':
        return 'bg-gray-100 dark:bg-gray-800'
      default:
        return 'bg-gray-100 dark:bg-gray-800'
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getPerformanceSmiley = (questionData: QuestionData) => {
    const peerAverage = peerAverages[questionData.question_id]
    if (!peerAverage) return null

    const timeRatio = questionData.time_taken / peerAverage
    if (timeRatio <= 0.8) return { icon: '😊', color: 'text-green-600', tooltip: 'Faster than average' }
    if (timeRatio >= 1.2) return { icon: '😞', color: 'text-red-600', tooltip: 'Slower than average' }
    return { icon: '😐', color: 'text-yellow-600', tooltip: 'Average time' }
  }

  const getAttemptAnalysis = (questionData: QuestionData) => {
    // This would need to be enhanced when we implement attempt tracking
    // For now, we'll show a placeholder
    return null // Will be implemented when attempt tracking is added
  }

  if (questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-slate-500 dark:text-slate-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg">No questions match the current filter.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        Question Breakdown ({questions.length} questions)
      </h2>
      
      <div className="space-y-6">
        <AnimatePresence>
          {questions.map((item, index) => (
              <motion.div
                key={item.question_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-6 rounded-xl shadow-lg border-2 ${getStatusColor(item.status)}`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Q.{index + 1}
                      </h3>
                    </div>
                  </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center space-x-2">
                    <span>Time: {formatTime(item.time_taken)}</span>
                    {getPerformanceSmiley(item) && (
                      <span 
                        className={`text-lg ${getPerformanceSmiley(item)?.color}`}
                        title={getPerformanceSmiley(item)?.tooltip}
                      >
                        {getPerformanceSmiley(item)?.icon}
                      </span>
                    )}
                    {getAttemptAnalysis(item) && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {getAttemptAnalysis(item)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onBookmark(item.question_id)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      title="Bookmark for later"
                    >
                      <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onReportError(item.question_id)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      title="Report an error"
                    >
                      <span className="text-lg">🚩</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                  {item.question?.question_text}
                </p>
              </div>

              {/* Answer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Answer</h4>
                  <p className="text-slate-900 dark:text-slate-100">
                    {item.user_answer || 'Not answered'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Correct Answer</h4>
                  <p className="text-green-900 dark:text-green-100 font-medium">
                    {item.question?.correct_option}
                  </p>
                </div>
              </div>

              {/* Solution Toggle */}
              {item.question?.solution_text && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleSolution(item.question_id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <svg 
                      className={`w-4 h-4 transition-transform ${expandedQuestions.has(item.question_id) ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>View Solution</span>
                  </button>

                  <AnimatePresence>
                    {expandedQuestions.has(item.question_id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Solution</h4>
                        <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                          {item.question.solution_text}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
