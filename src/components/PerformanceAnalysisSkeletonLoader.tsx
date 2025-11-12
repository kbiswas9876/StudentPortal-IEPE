'use client'

import React from 'react'

const PerformanceAnalysisSkeletonLoader: React.FC = () => {
  return (
    <div className="min-h-[60vh] relative animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-1 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="h-10 w-80 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded mt-2"></div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Primary Metrics Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Secondary Metrics Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Answer Status Card */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-10 w-10 mx-auto mb-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="h-7 w-12 mx-auto bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                    <div className="h-3 w-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Secondary Metrics */}
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex items-center space-x-3 border border-transparent"
              >
                <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabbed Interface Skeleton */}
          <div className="w-full">
            {/* Tabs */}
            <div className="flex border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-lg p-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="px-5 py-3 rounded-t-lg"
                >
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8 bg-white dark:bg-slate-800 rounded-b-lg rounded-tr-lg shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <div className="space-y-8">
                {/* Chapter-wise Performance Table Skeleton */}
                <div>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="h-8 w-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                    <div className="min-w-full">
                      {/* Table Header */}
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 px-6 py-4 flex space-x-4">
                        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                      {/* Table Rows */}
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center space-x-4"
                        >
                          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          <div className="h-3 w-full max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Difficulty Breakdown Skeleton */}
                <div>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="h-8 w-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="h-7 w-72 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Chart Skeleton */}
                    <div className="h-72 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                      <div className="h-full flex items-center justify-center">
                        <div className="space-y-4 w-full">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-4">
                              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                              <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Table Skeleton */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 px-5 py-3 flex space-x-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        ))}
                      </div>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex space-x-4"
                        >
                          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Question Breakdown Chart Skeleton */}
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>

            {/* Doughnut Chart Skeleton */}
            <div className="w-full h-[280px] flex items-center justify-center">
              <div className="relative">
                <div className="h-48 w-48 rounded-full border-8 border-slate-200 dark:border-slate-700"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-8 w-12 mx-auto bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                    <div className="h-3 w-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Summary Skeleton */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="h-7 w-8 mx-auto bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                  <div className="h-3 w-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Insights Skeleton */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 bg-amber-200 dark:bg-amber-800 rounded-xl"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-6 w-40 bg-amber-200 dark:bg-amber-800 rounded"></div>
                  <div className="h-6 w-8 bg-amber-200 dark:bg-amber-800 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-amber-200/50 dark:border-amber-700/50"
                    >
                      <div className="h-6 w-6 bg-amber-200 dark:bg-amber-800 rounded-full flex-shrink-0 mt-0.5"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-full bg-amber-200 dark:bg-amber-800 rounded"></div>
                        <div className="h-3 w-4/5 bg-amber-200 dark:bg-amber-800 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button Skeleton */}
      <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50">
        <div className="h-14 w-56 bg-slate-300 dark:bg-slate-700 rounded-full shadow-xl"></div>
      </div>
    </div>
  )
}

export default PerformanceAnalysisSkeletonLoader
