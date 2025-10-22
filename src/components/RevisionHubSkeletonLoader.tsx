'use client'

import { motion } from 'framer-motion'

export default function RevisionHubSkeletonLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex justify-end gap-3"
        >
          {/* SRS Settings Button */}
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse"></div>
          {/* Analytics Button */}
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-28 animate-pulse"></div>
        </motion.div>

        {/* Due Questions Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                <div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-24 animate-pulse"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ height: 'calc(100vh - 280px)', maxHeight: 'none', minHeight: '650px' }}>
          {/* Left Column - Chapter Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 flex flex-col h-full"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col overflow-hidden">
              {/* Chapter Navigation Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4 animate-pulse"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
              </div>

              {/* Chapter List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                      </div>
                      <div className="h-6 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Session Button */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="h-12 bg-blue-200 dark:bg-blue-700 rounded-lg w-full animate-pulse"></div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Question Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-9 flex flex-col h-full"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col overflow-hidden backdrop-blur-sm">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50/50 to-blue-50/30 dark:from-slate-900/50 dark:to-slate-800/30 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-3 animate-pulse"></div>
                    
                    {/* Difficulty Breakdown */}
                    <div className="flex space-x-2 mb-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                    
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                  </div>

                  {/* Filter Button */}
                  <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {/* Question Cards */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Question Text */}
                      <div className="mb-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5 animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Options */}
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="flex items-center space-x-3">
                            <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Performance Stats */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex space-x-4">
                          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                        </div>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
