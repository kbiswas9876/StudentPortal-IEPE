'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface ReviewStreakCardProps {
  currentStreak: number
  totalQuestions: number
}

export default function ReviewStreakCard({ currentStreak, totalQuestions }: ReviewStreakCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Review Streak
        </h3>
        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
          <Flame className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Streak Display */}
      <div className="flex flex-col items-center justify-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-2"
        >
          {currentStreak}
        </motion.div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          {currentStreak === 1 ? 'day' : 'days'} in a row
        </p>
      </div>

      {/* Stats */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Total Questions</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{totalQuestions}</span>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
        <p className="text-xs text-center text-slate-700 dark:text-slate-300">
          {currentStreak === 0 
            ? "Start your streak today! Complete your daily review." 
            : currentStreak < 7
            ? "Keep it up! You're building a great habit."
            : currentStreak < 30
            ? "Impressive streak! You're making real progress."
            : "🔥 Legendary! You're a review master!"}
        </p>
      </div>
    </motion.div>
  )
}

