'use client'

import React from 'react'

/**
 * Skeleton loader that accurately mirrors the NewPerformanceAnalysisDashboard layout
 * Shows placeholders for KPI cards, tabs, and chart areas
 */
const NewPerformanceAnalysisSkeletonLoader: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      {/* Header Section */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-9 w-80 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="h-12 w-40 bg-indigo-200 dark:bg-indigo-800 rounded-lg"></div>
        </div>
      </header>

      {/* KPI Dashboard Grid - 8 cards in responsive grid */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {/* First 5 KPI cards */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/80 shadow-lg"
            >
              <div className="flex flex-col space-y-3">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-8 w-16 bg-slate-300 dark:bg-slate-600 rounded"></div>
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              {/* Icon placeholder */}
              <div className="absolute right-0 bottom-0 h-24 w-24 bg-slate-100 dark:bg-slate-800 opacity-20 rounded-full transform translate-x-8 translate-y-8"></div>
            </div>
          ))}
          
          {/* Attempt Summary Card (spans 2 columns on lg) */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 relative overflow-hidden p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/80 shadow-lg">
            <div className="flex flex-col space-y-3">
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="flex items-center justify-around mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-10 w-10 mx-auto mb-2 bg-slate-300 dark:bg-slate-600 rounded-lg"></div>
                    <div className="h-3 w-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Last 2 KPI cards */}
          {[6, 7].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/80 shadow-lg"
            >
              <div className="flex flex-col space-y-3">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-8 w-16 bg-slate-300 dark:bg-slate-600 rounded"></div>
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="absolute right-0 bottom-0 h-24 w-24 bg-slate-100 dark:bg-slate-800 opacity-20 rounded-full transform translate-x-8 translate-y-8"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabbed Analysis Section */}
      <section className="bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-lg">
        {/* Tab Navigation */}
        <nav className="flex flex-wrap border-b border-slate-200 mb-6" aria-label="Tabs">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-3 sm:p-4 border-b-2 border-transparent"
            >
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </nav>

        {/* Tab Content Area */}
        <div className="pt-6">
          {/* Overview Panel Skeleton (default tab) */}
          <div>
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            
            {/* Doughnut Chart Skeleton */}
            <div className="h-64 md:h-80 flex items-center justify-center">
              <div className="relative">
                <div className="h-48 w-48 md:h-64 md:w-64 rounded-full border-8 border-slate-200 dark:border-slate-700"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-8 w-12 mx-auto bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                    <div className="h-3 w-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center items-center space-x-4 md:space-x-6 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-4 h-3 bg-slate-200 dark:bg-slate-700 rounded-sm"></div>
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NewPerformanceAnalysisSkeletonLoader
