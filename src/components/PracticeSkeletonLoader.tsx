'use client'

import { motion } from 'framer-motion'

export default function PracticeSkeletonLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse">
                <div className="w-5 h-5 bg-slate-200 dark:bg-slate-600 rounded"></div>
              </div>
              {/* Session Title */}
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse"></div>
            </div>
            {/* Timer */}
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex pt-16">
        {/* Left Content - Question Area (3/4 width) */}
        <div className="flex-1 lg:w-3/4">
          <div className="h-screen overflow-y-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {/* Question Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6 animate-pulse">
                  <div className="bg-blue-200 dark:bg-blue-700 h-2 rounded-full w-1/4 animate-pulse"></div>
                </div>
              </div>

              {/* Question Content */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg">
                {/* Question Text */}
                <div className="mb-8">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5 animate-pulse"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-4 animate-pulse"></div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Question Palette (1/4 width) */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="hidden lg:block w-1/4 bg-slate-50 dark:bg-slate-900 h-screen flex flex-col"
        >
          <div className="flex-1 overflow-y-auto p-6">
            {/* Status Panel */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-lg">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4 animate-pulse"></div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2 animate-pulse"></div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 animate-pulse">
                  <div className="bg-blue-200 dark:bg-blue-700 h-2 rounded-full w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Question Palette */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-4 animate-pulse"></div>
              
              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-10 rounded-lg border-2 animate-pulse ${
                      i === 0 
                        ? 'bg-blue-200 dark:bg-blue-700 border-blue-300 dark:border-blue-600' 
                        : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                    }`}
                  ></div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Focus Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="fixed top-4 right-4 z-40 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg"
      >
        <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </motion.div>

      {/* Action Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="fixed bottom-6 left-6 right-6 z-40"
      >
        <div className="flex justify-between items-center">
          {/* Left Actions */}
          <div className="flex space-x-4">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-40 animate-pulse"></div>
          </div>

          {/* Right Action */}
          <div className="h-12 bg-green-200 dark:bg-green-700 rounded-lg w-48 animate-pulse"></div>
        </div>
      </motion.div>

      {/* Loading Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
      >
        <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Loading practice session...
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
