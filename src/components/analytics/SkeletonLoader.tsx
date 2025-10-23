'use client'

import React from 'react'
import { motion } from 'framer-motion'

// Base skeleton component
const SkeletonBase = ({ className = '', animate = true }: { className?: string; animate?: boolean }) => (
  <div className={`bg-slate-200 dark:bg-slate-700 rounded ${className} ${animate ? 'animate-pulse' : ''}`} />
)

// Streak Activity Card Skeleton
export const StreakActivityCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg col-span-full lg:col-span-2"
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <SkeletonBase className="h-6 w-6 rounded-full" />
        <SkeletonBase className="h-6 w-32" />
      </div>
      <SkeletonBase className="h-4 w-4 rounded-full" />
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="text-center">
          <SkeletonBase className="h-8 w-12 mx-auto mb-2" />
          <SkeletonBase className="h-4 w-16 mx-auto" />
        </div>
      ))}
    </div>

    {/* Heatmap Grid */}
    <div className="mb-4">
      <SkeletonBase className="h-4 w-24 mb-3" />
      <div className="grid grid-cols-13 gap-1">
        {Array.from({ length: 91 }).map((_, i) => (
          <SkeletonBase key={i} className="h-3 w-3 rounded-sm" />
        ))}
      </div>
    </div>

    {/* Legend */}
    <div className="flex items-center justify-between text-xs">
      <SkeletonBase className="h-3 w-16" />
      <div className="flex gap-2">
        <SkeletonBase className="h-3 w-3 rounded-sm" />
        <SkeletonBase className="h-3 w-3 rounded-sm" />
        <SkeletonBase className="h-3 w-3 rounded-sm" />
        <SkeletonBase className="h-3 w-3 rounded-sm" />
        <SkeletonBase className="h-3 w-3 rounded-sm" />
      </div>
    </div>
  </motion.div>
)

// Deck Mastery Chart Skeleton
export const DeckMasteryChartSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <SkeletonBase className="h-6 w-6 rounded-full" />
        <SkeletonBase className="h-6 w-32" />
      </div>
      <SkeletonBase className="h-4 w-4 rounded-full" />
    </div>

    {/* Progress Bars */}
    <div className="space-y-4 mb-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between items-center">
            <SkeletonBase className="h-4 w-20" />
            <SkeletonBase className="h-4 w-12" />
          </div>
          <SkeletonBase className="h-6 w-full rounded-lg" />
        </div>
      ))}
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <SkeletonBase className="h-6 w-8 mx-auto mb-1" />
          <SkeletonBase className="h-3 w-12 mx-auto" />
        </div>
      ))}
    </div>
  </motion.div>
)

// Retention Rate Chart Skeleton
export const RetentionRateChartSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <SkeletonBase className="h-6 w-6 rounded-full" />
        <SkeletonBase className="h-6 w-32" />
      </div>
      <SkeletonBase className="h-4 w-4 rounded-full" />
    </div>

    {/* Circular Progress */}
    <div className="flex justify-center mb-6">
      <div className="relative">
        <SkeletonBase className="h-32 w-32 rounded-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <SkeletonBase className="h-8 w-12 mb-1" />
          <SkeletonBase className="h-3 w-16" />
        </div>
      </div>
    </div>

    {/* Maturity Table */}
    <div className="mb-4">
      <SkeletonBase className="h-4 w-32 mb-3" />
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="px-3 py-2">
            <SkeletonBase className="h-3 w-16" />
          </div>
          <div className="px-3 py-2 text-center">
            <SkeletonBase className="h-3 w-20 mx-auto" />
          </div>
          <div className="px-3 py-2 text-center">
            <SkeletonBase className="h-3 w-20 mx-auto" />
          </div>
        </div>
        {/* Table Rows */}
        {[1, 2].map((i) => (
          <div key={i} className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <div className="px-3 py-3">
              <SkeletonBase className="h-4 w-24 mb-1" />
              <SkeletonBase className="h-3 w-16" />
            </div>
            <div className="px-3 py-3 text-center">
              <SkeletonBase className="h-4 w-8 mx-auto" />
            </div>
            <div className="px-3 py-3 text-center">
              <SkeletonBase className="h-4 w-8 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <SkeletonBase className="h-6 w-12 mx-auto mb-1" />
        <SkeletonBase className="h-3 w-16 mx-auto" />
      </div>
      <div className="text-center">
        <SkeletonBase className="h-6 w-12 mx-auto mb-1" />
        <SkeletonBase className="h-3 w-16 mx-auto" />
      </div>
    </div>
  </motion.div>
)

// Review Heatmap Calendar Skeleton
export const ReviewHeatmapCalendarSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.3 }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg col-span-full lg:col-span-1"
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <SkeletonBase className="h-6 w-6 rounded-full" />
        <SkeletonBase className="h-6 w-40" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBase className="h-8 w-8 rounded-full" />
        <SkeletonBase className="h-6 w-24" />
        <SkeletonBase className="h-8 w-8 rounded-full" />
      </div>
    </div>

    {/* Days of Week */}
    <div className="grid grid-cols-7 text-center text-xs mb-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
        <div key={day} className="py-1">
          <SkeletonBase className="h-3 w-6 mx-auto" />
        </div>
      ))}
    </div>

    {/* Calendar Grid */}
    <div className="grid grid-cols-7 gap-1 mb-6">
      {Array.from({ length: 35 }).map((_, i) => (
        <SkeletonBase key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>

    {/* Legend */}
    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
      <SkeletonBase className="h-4 w-24 mb-2" />
      <div className="flex flex-wrap gap-2 text-xs">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-1">
            <SkeletonBase className="h-4 w-4 rounded-sm" />
            <SkeletonBase className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  </motion.div>
)

// Actionable Insights Card Skeleton
export const ActionableInsightsCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.4 }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg col-span-full lg:col-span-1"
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <SkeletonBase className="h-6 w-6 rounded-full" />
        <SkeletonBase className="h-6 w-40" />
      </div>
      <SkeletonBase className="h-4 w-4 rounded-full" />
    </div>

    {/* Hardest Questions Section */}
    <div className="mb-6">
      <SkeletonBase className="h-5 w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <SkeletonBase className="h-4 w-full mb-2" />
            <div className="flex justify-between items-center">
              <SkeletonBase className="h-3 w-20" />
              <SkeletonBase className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Weakest Chapters Section */}
    <div className="mb-6">
      <SkeletonBase className="h-5 w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <SkeletonBase className="h-4 w-24" />
              <SkeletonBase className="h-4 w-12" />
            </div>
            <SkeletonBase className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>

    {/* Hourly Performance Section */}
    <div>
      <SkeletonBase className="h-5 w-40 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <SkeletonBase className="h-4 w-16" />
              <SkeletonBase className="h-3 w-20" />
            </div>
            <SkeletonBase className="h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </motion.div>
)

// Main Analytics Page Skeleton
export const AnalyticsPageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    {/* Header Skeleton */}
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SkeletonBase className="h-10 w-10 rounded-lg" />
            <div>
              <SkeletonBase className="h-8 w-32 mb-2" />
              <SkeletonBase className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak Activity Card */}
        <StreakActivityCardSkeleton />
        
        {/* Deck Mastery Chart */}
        <DeckMasteryChartSkeleton />
        
        {/* Retention Rate Chart */}
        <RetentionRateChartSkeleton />
        
        {/* Review Heatmap Calendar */}
        <ReviewHeatmapCalendarSkeleton />
        
        {/* Actionable Insights Card */}
        <ActionableInsightsCardSkeleton />
      </div>

      {/* Pro Tip Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl backdrop-blur-sm"
      >
        <div className="flex items-center justify-center gap-3">
          <SkeletonBase className="h-8 w-8 rounded-full" />
          <SkeletonBase className="h-4 w-80" />
        </div>
      </motion.div>
    </div>
  </div>
)
