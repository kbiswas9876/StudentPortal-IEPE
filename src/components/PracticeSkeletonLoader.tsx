'use client'

import { motion } from 'framer-motion'

interface PracticeSkeletonLoaderProps {
  loadingText?: string
}

export default function PracticeSkeletonLoader({
  loadingText = "Loading practice session..."
}: PracticeSkeletonLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Main Layout Container */}
      <div className="flex h-screen">
        {/* Left Panel - Question Display Window (3/4 width) */}
        <div className="flex-1 lg:w-3/4 flex flex-col">
          {/* Unified Header */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Left side - Back button and session info */}
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
                </div>
                
                {/* Right side - Timer and controls */}
                <div className="flex items-center space-x-3">
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 animate-pulse">
                  <div className="bg-blue-200 dark:bg-blue-700 h-2 rounded-full w-1/4 animate-pulse"></div>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                {/* Question Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40 animate-pulse"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Question Text */}
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center space-x-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions Footer */}
          <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center">
                {/* Left Actions */}
                <div className="flex space-x-3">
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse"></div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-40 animate-pulse"></div>
                </div>

                {/* Right Actions */}
                <div className="flex space-x-3">
                  <div className="h-10 bg-blue-200 dark:bg-blue-700 rounded-lg w-36 animate-pulse"></div>
                  <div className="h-10 bg-green-200 dark:bg-green-700 rounded-lg w-32 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Premium Status Panel (1/4 width) */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="hidden lg:block w-1/4 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700"
        >
          <div className="h-full overflow-y-auto">
            {/* Status Panel Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Matrix */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3 animate-pulse"></div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Question Palette */}
            <div className="p-4">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4 animate-pulse"></div>
              
              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 rounded-lg border-2 animate-pulse ${
                      i === 0 
                        ? 'bg-blue-200 dark:bg-blue-700 border-blue-300 dark:border-blue-600' 
                        : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                    }`}
                  ></div>
                ))}
              </div>

              {/* Legend */}
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                <div className="space-y-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="h-10 bg-green-200 dark:bg-green-700 rounded-lg w-full animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="fixed top-4 right-4 z-40 lg:hidden"
      >
        <div className="h-10 w-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg flex items-center justify-center">
          <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
      </motion.div>

      {/* Loading Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
      >
        <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {loadingText}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
