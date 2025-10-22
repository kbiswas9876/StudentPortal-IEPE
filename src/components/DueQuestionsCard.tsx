'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, PlayCircle, CheckCircle, Sparkles, Zap, Settings } from 'lucide-react'
import SrsSettingsModal from './SrsSettingsModal'

interface DueQuestionsCardProps {
  dueCount: number
  totalBookmarks: number
  isLoading: boolean
  onStartReview: () => void
  onBrowseLibrary: () => void
  compact?: boolean
  userId?: string
}

export default function DueQuestionsCard({
  dueCount,
  totalBookmarks,
  isLoading,
  onStartReview,
  onBrowseLibrary,
  compact = false,
  userId,
}: DueQuestionsCardProps) {
  const [isSrsSettingsOpen, setIsSrsSettingsOpen] = useState(false)
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3"></div>
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div className="h-12 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
      </motion.div>
    )
  }

  // Case 1: Questions are due
  if (dueCount > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative mb-6"
      >
        {/* Borderless Premium Card with Subtle Gradient Background */}
        <div className="relative bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 backdrop-blur-sm rounded-2xl px-6 py-3.5 hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:via-indigo-950/30 dark:hover:to-purple-950/30 transition-all duration-300">
          <div className="flex items-center justify-between gap-8">
            {/* Left: Badge-style count with icon */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Floating Badge */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25">
                <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                <span className="text-xs font-bold text-white tabular-nums">
                  {dueCount}
                </span>
              </div>
              
              {/* Text Content - Side by side layout */}
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Daily Review
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  • {dueCount === 1 ? '1 question' : `${dueCount} questions`} waiting
                </span>
              </div>
            </div>

            {/* Right: Settings Icon + Action Button */}
            <div className="flex items-center gap-2">
              {/* Settings Icon */}
              {userId && (
                <button
                  onClick={() => setIsSrsSettingsOpen(true)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                  title="SRS Settings"
                  aria-label="Open SRS Settings"
                >
                  <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                </button>
              )}

              {/* Start Button */}
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartReview}
                className="group/btn relative flex-shrink-0 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-xs rounded-full transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-purple-500/30"
              >
                <span className="relative z-10">Start Now</span>
                <Zap className="h-3.5 w-3.5 relative z-10 group-hover/btn:rotate-12 transition-transform duration-200" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* SRS Settings Modal */}
        {userId && (
          <SrsSettingsModal
            isOpen={isSrsSettingsOpen}
            onClose={() => setIsSrsSettingsOpen(false)}
            userId={userId}
          />
        )}
      </motion.div>
    )
  }

  // Case 2: No questions are due
  // Show different messages for first-time users vs. existing users
  
  // First-time user (has bookmarks but none are due yet)
  if (totalBookmarks > 0 && dueCount === 0) {
    if (compact) {
      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400" strokeWidth={2.5} />
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">
              You&apos;re all set!
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {totalBookmarks} question{totalBookmarks !== 1 ? 's' : ''} bookmarked.
            </span>
          </div>
        </motion.div>
      )
    }

    return (
      <div className="flex justify-end mb-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-300 dark:border-indigo-700 rounded-xl p-4 shadow-sm max-w-md"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
              <Calendar className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                You&apos;re All Set!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                <span className="font-semibold text-indigo-700 dark:text-indigo-400">{totalBookmarks}</span> question{totalBookmarks !== 1 ? 's' : ''} bookmarked. Reviews will appear when due.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }
  
  // All caught up (no due questions, experienced user)
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm"
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-green-500 dark:text-green-400" strokeWidth={2.5} />
          <span className="text-green-700 dark:text-green-300 font-medium">
            All caught up!
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            No questions due for review today.
          </span>
        </div>
      </motion.div>
    )
  }

  const caughtUpContent = (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-300 dark:border-green-700 rounded-xl p-4 shadow-sm max-w-md"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm">
          <CheckCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            All Caught Up!
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
            Great work! No questions due for review today.
          </p>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="flex justify-end mb-6">
      {caughtUpContent}
    </div>
  )
}

