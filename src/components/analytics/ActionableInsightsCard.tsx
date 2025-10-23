'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, TrendingDown, PlayCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HardQuestion {
  bookmarkId: string
  questionId: string
  questionText: string
  chapter: string
  stat: string
  difficultyScore: number
}

interface WeakChapter {
  chapter: string
  questionCount: number
  successRate: number
  totalAttempts: number
}

interface ActionableInsightsCardProps {
  hardestQuestions: HardQuestion[]
  weakestChapters: WeakChapter[]
}

export default function ActionableInsightsCard({
  hardestQuestions,
  weakestChapters,
}: ActionableInsightsCardProps) {
  const router = useRouter()

  const handleReviewNow = (questionId: string) => {
    // Navigate to revision hub with filter for this specific question
    router.push(`/revision-hub?focus=${questionId}`)
  }

  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400'
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getSuccessRateBgColor = (rate: number): string => {
    if (rate >= 80) return 'bg-green-500'
    if (rate >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const hasData = hardestQuestions.length > 0 || weakestChapters.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg col-span-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
          <AlertCircle className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Topics to Strengthen
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Focus on these areas to improve faster
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <TrendingDown className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Not enough data yet
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Complete more reviews to see personalized insights about your hardest questions and weakest topics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hardest Questions Section */}
          {hardestQuestions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Your Hardest Questions
              </h4>
              <div className="space-y-3">
                {hardestQuestions.map((question, index) => (
                  <motion.div
                    key={question.questionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-1">
                          {question.questionText}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {question.chapter}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                        {question.stat}
                      </span>
                      <button
                        onClick={() => handleReviewNow(question.questionId)}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Review Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Weakest Chapters Section */}
          {weakestChapters.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Your Weakest Chapters
              </h4>
              <div className="space-y-3">
                {weakestChapters.map((chapter, index) => (
                  <motion.div
                    key={chapter.chapter}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {chapter.chapter}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {chapter.questionCount} question{chapter.questionCount !== 1 ? 's' : ''} • {chapter.totalAttempts} attempt{chapter.totalAttempts !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className={`text-lg font-bold ${getSuccessRateColor(chapter.successRate)}`}>
                        {chapter.successRate}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${chapter.successRate}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                        className={`h-full ${getSuccessRateBgColor(chapter.successRate)}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Call to Action */}
      {hasData && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            💡 <strong>Pro Tip:</strong> Focusing on your weak areas yields faster improvement than reviewing what you already know well.
          </p>
        </div>
      )}
    </motion.div>
  )
}

