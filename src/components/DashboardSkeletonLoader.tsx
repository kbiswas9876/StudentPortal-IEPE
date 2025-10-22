'use client'

import { motion } from 'framer-motion'

export default function DashboardSkeletonLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full px-6 py-8 max-w-[1920px] mx-auto">
        {/* Tab Navigation Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-32 animate-pulse"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-36 animate-pulse"></div>
          </div>
        </motion.div>

        {/* Main Content Layout */}
        <div className="w-full px-0 py-0 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="space-y-4 sm:space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 lg:min-h-[calc(100vh-12rem)] pb-24 sm:pb-20">
            {/* Left Column - Books & Chapters (9/12 width) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="lg:col-span-9 flex flex-col"
            >
              <div className="flex-1 flex flex-col">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6 animate-pulse"></div>
                
                {/* Books Grid Skeleton */}
                <div className="flex-1 lg:overflow-y-auto lg:pr-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg"
                      >
                        {/* Book Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40 animate-pulse"></div>
                          <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        </div>
                        
                        {/* Book Code */}
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4 animate-pulse"></div>
                        
                        {/* Selected Tag */}
                        <div className="h-6 bg-blue-200 dark:bg-blue-700 rounded w-20 mb-4 animate-pulse"></div>
                        
                        {/* Chapters List */}
                        <div className="space-y-3">
                          {[1, 2, 3, 4, 5].map((j) => (
                            <div key={j} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                              <div className="w-4 h-4 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4 mb-2 animate-pulse"></div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2 animate-pulse"></div>
                              </div>
                              <div className="h-8 bg-slate-200 dark:bg-slate-600 rounded w-16 animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Settings & Summary (3/12 width) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="lg:col-span-3 flex flex-col"
            >
              <div className="space-y-6">
                {/* Session Settings Skeleton */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg"
                >
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-6 animate-pulse"></div>
                  
                  {/* Question Order */}
                  <div className="mb-6">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3 animate-pulse"></div>
                    <div className="flex space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Test Mode */}
                  <div className="mb-6">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-3 animate-pulse"></div>
                    <div className="flex space-x-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
                      ))}
                    </div>
                  </div>

                  {/* Time Limit */}
                  <div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3 animate-pulse"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                  </div>
                </motion.div>

                {/* Session Summary Skeleton */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg"
                >
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-6 animate-pulse"></div>
                  
                  {/* Selected Chapters */}
                  <div className="mb-6">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-36 mb-3 animate-pulse"></div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-600 rounded mr-2 animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-32 animate-pulse"></div>
                      </div>
                      <div className="ml-6 space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-24 animate-pulse"></div>
                            <div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-16 animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Session Settings */}
                  <div className="mb-6">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-3 animate-pulse"></div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-12 animate-pulse"></div>
                        <div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-20 animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-8 animate-pulse"></div>
                        <div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Start Session Button */}
                  <div className="h-12 bg-blue-200 dark:bg-blue-700 rounded-lg w-full animate-pulse"></div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sticky Footer Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg z-50"
        >
          <div className="flex items-center justify-between max-w-[1920px] mx-auto px-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-12 bg-blue-200 dark:bg-blue-700 rounded-lg w-48 animate-pulse"></div>
          </div>
        </motion.div>

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-8"
        >
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Loading practice setup...
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
