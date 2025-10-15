'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, PlayCircle, CheckCircle } from 'lucide-react'

interface DueQuestionsCardProps {
  dueCount: number
  totalBookmarks: number
  isLoading: boolean
  onStartReview: () => void
  onBrowseLibrary: () => void
}

export default function DueQuestionsCard({
  dueCount,
  totalBookmarks,
  isLoading,
  onStartReview,
  onBrowseLibrary,
}: DueQuestionsCardProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3"></div>
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div className="h-12 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
      </motion.div>
    )
  }

  // Case 1: Questions are due
  if (dueCount > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center justify-between gap-6">
          {/* Icon and Content */}
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Calendar className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Your Daily Review
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-lg">
                You have{' '}
                <span className="font-bold text-blue-700 dark:text-blue-400">
                  {dueCount}
                </span>{' '}
                question{dueCount !== 1 ? 's' : ''} ready for review today.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Keep the momentum going! Regular reviews strengthen your memory.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartReview}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 flex items-center gap-3 text-lg"
            >
              <PlayCircle className="h-6 w-6" strokeWidth={2.5} />
              Start Daily Review
            </motion.button>
            
            <button
              onClick={onBrowseLibrary}
              className="text-sm text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors hover:underline"
            >
              Browse Full Library →
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Case 2: No questions are due
  // Show different messages for first-time users vs. existing users
  
  // First-time user (has bookmarks but none are due yet)
  if (totalBookmarks > 0 && dueCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl p-6 mb-6 shadow-lg"
      >
        <div className="flex items-center justify-between gap-6">
          {/* Icon and Content */}
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Calendar className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                You&apos;re All Set!
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-lg">
                You have <span className="font-bold text-indigo-700 dark:text-indigo-400">{totalBookmarks}</span> question{totalBookmarks !== 1 ? 's' : ''} bookmarked.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Your first reviews will appear here when they are due. Keep bookmarking questions you want to master, and the SRS algorithm will schedule optimal review times for you!
              </p>
            </div>
          </div>

          {/* Secondary Action */}
          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBrowseLibrary}
              className="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              Browse Library
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }
  
  // All caught up (no due questions, experienced user)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 mb-6 shadow-lg"
    >
      <div className="flex items-center justify-between gap-6">
        {/* Icon and Content */}
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <CheckCircle className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              All Caught Up!
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-lg">
              Great work! You have no questions due for review today.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Come back tomorrow to keep the momentum going, or browse your library to create a custom session.
            </p>
          </div>
        </div>

        {/* Secondary Action */}
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBrowseLibrary}
            className="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Browse Full Library
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

