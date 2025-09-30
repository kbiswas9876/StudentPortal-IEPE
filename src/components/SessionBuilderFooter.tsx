'use client'

import { motion } from 'framer-motion'
import { PlayIcon } from '@heroicons/react/24/solid'

interface SessionBuilderFooterProps {
  totalQuestions: number
  onStartSession: () => void
  loading?: boolean
}

export default function SessionBuilderFooter({
  totalQuestions,
  onStartSession,
  loading = false
}: SessionBuilderFooterProps) {
  const isDisabled = totalQuestions === 0 || loading
  
  console.log('SessionBuilderFooter render:', { totalQuestions, loading, isDisabled })
  console.log('SessionBuilderFooter: totalQuestions type:', typeof totalQuestions, 'value:', totalQuestions)

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg z-40"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Questions Selected:
            </div>
            <motion.div
              key={totalQuestions}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-2xl font-bold text-slate-900 dark:text-slate-100"
            >
              {totalQuestions}
            </motion.div>
          </div>

          <motion.button
            onClick={() => {
              console.log('Start session button clicked, calling onStartSession')
              onStartSession()
            }}
            disabled={isDisabled}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isDisabled
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PlayIcon className="w-5 h-5" />
            )}
            <span>
              {loading ? 'Preparing Session...' : 'Start Practice Session'}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
