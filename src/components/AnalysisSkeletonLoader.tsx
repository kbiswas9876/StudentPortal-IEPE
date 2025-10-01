'use client'

import { motion } from 'framer-motion'

interface AnalysisSkeletonLoaderProps {
  retryCount?: number
  showRetryMessage?: boolean
}

export default function AnalysisSkeletonLoader({ 
  retryCount = 0, 
  showRetryMessage = false 
}: AnalysisSkeletonLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Performance Dashboard Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-16 animate-pulse"></div>
                <div className="h-6 w-6 bg-blue-200 dark:bg-blue-700 rounded animate-pulse"></div>
              </div>
              <div className="h-8 bg-blue-200 dark:bg-blue-700 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-24 animate-pulse"></div>
            </div>

            {/* Accuracy Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-green-200 dark:bg-green-700 rounded w-20 animate-pulse"></div>
                <div className="h-6 w-6 bg-green-200 dark:bg-green-700 rounded animate-pulse"></div>
              </div>
              <div className="h-8 bg-green-200 dark:bg-green-700 rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-3 bg-green-200 dark:bg-green-700 rounded w-28 animate-pulse"></div>
            </div>

            {/* Time Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-12 animate-pulse"></div>
                <div className="h-6 w-6 bg-purple-200 dark:bg-purple-700 rounded animate-pulse"></div>
              </div>
              <div className="h-8 bg-purple-200 dark:bg-purple-700 rounded w-18 mb-2 animate-pulse"></div>
              <div className="h-3 bg-purple-200 dark:bg-purple-700 rounded w-20 animate-pulse"></div>
            </div>

            {/* Questions Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-orange-200 dark:bg-orange-700 rounded w-24 animate-pulse"></div>
                <div className="h-6 w-6 bg-orange-200 dark:bg-orange-700 rounded animate-pulse"></div>
              </div>
              <div className="h-8 bg-orange-200 dark:bg-orange-700 rounded w-14 mb-2 animate-pulse"></div>
              <div className="h-3 bg-orange-200 dark:bg-orange-700 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </motion.div>

        {/* Strategic Performance Matrix Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8 shadow-lg"
        >
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-24 mb-3 animate-pulse"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-600 rounded w-12 mb-2 animate-pulse"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-20 animate-pulse"></div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filter Toolbar Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8 shadow-lg"
        >
          <div className="flex flex-wrap gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-24 animate-pulse"></div>
            ))}
          </div>
        </motion.div>

        {/* Question Breakdown Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="space-y-4"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="ml-4 flex space-x-2">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-6 mb-2 animate-pulse"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-8"
        >
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            <div className="text-center">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Processing your analysis...
              </span>
              {showRetryMessage && retryCount > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Attempt {retryCount + 1} - Data is being processed
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
