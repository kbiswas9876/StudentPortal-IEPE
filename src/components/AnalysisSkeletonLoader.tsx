'use client'

import { motion } from 'framer-motion'

interface AnalysisSkeletonLoaderProps {
  retryCount?: number
  showRetryMessage?: boolean
  isMockTest?: boolean
}

export default function AnalysisSkeletonLoader({ 
  retryCount = 0, 
  showRetryMessage = false,
  isMockTest = false
}: AnalysisSkeletonLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Tab Interface Skeleton for Mock Tests */}
        {isMockTest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="flex space-x-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {[1, 2].map((i) => (
                <div key={i} className="w-full rounded-lg py-2.5 px-4 bg-white dark:bg-slate-700 shadow-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* KPI Cards Skeleton - Matching the actual 7-card layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Questions Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-blue-200 dark:bg-blue-700 rounded w-24 animate-pulse"></div>
                <div className="h-8 w-8 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-800/50 dark:to-cyan-800/50 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-blue-300 dark:bg-blue-600 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 bg-blue-200 dark:bg-blue-700 rounded w-8 mb-2 animate-pulse"></div>
              <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-32 animate-pulse"></div>
            </div>

            {/* Attempted Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-blue-200 dark:bg-blue-700 rounded w-20 animate-pulse"></div>
                <div className="h-8 w-8 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-800/50 dark:to-cyan-800/50 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-blue-300 dark:bg-blue-600 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 bg-blue-200 dark:bg-blue-700 rounded w-6 mb-2 animate-pulse"></div>
              <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-20 animate-pulse"></div>
            </div>

            {/* Correct Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-green-200 dark:bg-green-700 rounded w-16 animate-pulse"></div>
                <div className="h-8 w-8 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-800/50 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-300 dark:bg-green-600 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 bg-green-200 dark:bg-green-700 rounded w-6 mb-2 animate-pulse"></div>
              <div className="h-4 bg-green-200 dark:bg-green-700 rounded w-16 animate-pulse"></div>
            </div>

            {/* Incorrect Card */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200/50 dark:border-orange-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-orange-200 dark:bg-orange-700 rounded w-20 animate-pulse"></div>
                <div className="h-8 w-8 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-800/50 dark:to-red-800/50 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-orange-300 dark:bg-orange-600 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 bg-orange-200 dark:bg-orange-700 rounded w-6 mb-2 animate-pulse"></div>
              <div className="h-4 bg-orange-200 dark:bg-orange-700 rounded w-20 animate-pulse"></div>
            </div>

            {/* Accuracy Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-green-200 dark:bg-green-700 rounded w-16 animate-pulse"></div>
                <div className="h-8 w-8 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-800/50 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-300 dark:bg-green-600 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 bg-green-200 dark:bg-green-700 rounded w-12 mb-2 animate-pulse"></div>
              <div className="h-4 bg-green-200 dark:bg-green-700 rounded w-16 animate-pulse"></div>
            </div>

            {/* Percentage Card */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-purple-200 dark:bg-purple-700 rounded w-20 animate-pulse"></div>
                <div className="h-8 w-8 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-800/50 dark:to-violet-800/50 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-purple-300 dark:bg-purple-600 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 bg-purple-200 dark:bg-purple-700 rounded w-12 mb-2 animate-pulse"></div>
              <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-20 animate-pulse"></div>
            </div>

            {/* Time Taken Card */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-purple-200 dark:bg-purple-700 rounded w-20 animate-pulse"></div>
                <div className="h-8 w-8 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-800/50 dark:to-violet-800/50 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-purple-300 dark:bg-purple-600 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 bg-purple-200 dark:bg-purple-700 rounded w-12 mb-2 animate-pulse"></div>
              <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </motion.div>

        {/* Chapter-wise Performance Table Skeleton - Matching the actual table structure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8 shadow-lg"
        >
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6 animate-pulse"></div>
          
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-12 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-12 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-20 animate-pulse"></div>
          </div>
          
          {/* Table Rows */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-6 gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-32 animate-pulse"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-8 animate-pulse"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-8 animate-pulse"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-8 animate-pulse"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-12 animate-pulse"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-12 animate-pulse"></div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* View Solutions Button Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 rounded-xl shadow-lg">
            <div className="h-5 w-5 bg-blue-300 rounded animate-pulse"></div>
            <div className="h-5 bg-blue-300 rounded w-32 animate-pulse"></div>
          </div>
        </motion.div>

        {/* Loading Indicator - Enhanced */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-8"
        >
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-slate-800 px-8 py-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <div className="text-center">
              <span className="text-slate-600 dark:text-slate-300 font-medium text-lg">
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
