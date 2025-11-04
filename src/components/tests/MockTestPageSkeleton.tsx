'use client'

import React from 'react'

interface MockTestPageSkeletonProps {
  view?: 'list' | 'grid' // 'list' for All tab, 'grid' for other tabs
  count?: number // Number of skeleton items to show
}

const MockTestPageSkeleton: React.FC<MockTestPageSkeletonProps> = ({ 
  view = 'list', 
  count = 3 
}) => {
  // Skeleton for Search Bar and Refresh Button
  const SearchBarSkeleton = () => (
    <div className="mb-8 flex items-center gap-4">
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="w-full h-14 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse"></div>
        </div>
      </div>
      <div className="w-20 h-14 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse"></div>
    </div>
  )

  // Skeleton for Tabs
  const TabsSkeleton = () => (
    <div className="flex space-x-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm w-full max-w-2xl">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl">
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        </div>
      ))}
    </div>
  )

  // Skeleton for TestListItem (used in All tab)
  const TestListItemSkeleton = () => (
    <div className="group bg-white border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md transition-all duration-300 flex items-center justify-between px-4 py-3 gap-4">
      {/* Left Section */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-48 sm:w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Center Section (Desktop) */}
      <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        </div>
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
      </div>

      {/* Mobile Center Section */}
      <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>

      {/* Right Section: Action Button */}
      <div className="flex-shrink-0">
        <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
      </div>
    </div>
  )

  // Skeleton for TestCard (used in Upcoming, Live, Completed tabs)
  const TestCardSkeleton = () => (
    <div className="group relative bg-white border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md transition-all duration-300 h-full flex flex-col">
      {/* Status Badge */}
      <div className="absolute -top-2 -right-2">
        <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
      </div>

      {/* Header Section */}
      <div className="p-4 pr-24">
        <div className="h-6 w-full mb-2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>

      {/* Content Section */}
      <div className="p-3 flex flex-col flex-1 space-y-2">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>

        {/* Marking Scheme */}
        <div className="mb-2">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Score Display (for completed) */}
        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse mb-2"></div>

        {/* Percentile and Rank */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-3 pb-3">
        <div className="h-11 w-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-12">
          <SearchBarSkeleton />
          <div className="mt-8">
            <TabsSkeleton />
          </div>
        </div>

        <div className="mt-12">
          {view === 'list' ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: count }).map((_, index) => (
                <TestListItemSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: count }).map((_, index) => (
                <TestCardSkeleton key={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MockTestPageSkeleton

