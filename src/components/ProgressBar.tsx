'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  currentQuestion: number
  totalQuestions: number
  answeredQuestions: number
}

export default function ProgressBar({
  currentQuestion,
  totalQuestions,
  answeredQuestions
}: ProgressBarProps) {
  const progressPercentage = (answeredQuestions / totalQuestions) * 100

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"
    >
      <div className="h-1 bg-slate-200 dark:bg-slate-700">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {/* Clean progress bar - no extra text */}
    </motion.div>
  )
}
