'use client'

import { motion } from 'framer-motion'

interface ActionBarProps {
  onSaveAndNext: () => void
  onMarkForReviewAndNext: () => void
  onClearResponse: () => void
  onSubmitTest: () => void
  isSubmitting: boolean
  isLastQuestion: boolean
}

export default function ActionBar({
  onSaveAndNext,
  onMarkForReviewAndNext,
  onClearResponse,
  onSubmitTest,
  isSubmitting,
  isLastQuestion
}: ActionBarProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg z-40"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation buttons */}
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={onSaveAndNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLastQuestion ? 'Save & Finish' : 'Save & Next'}
            </motion.button>

            <motion.button
              onClick={onMarkForReviewAndNext}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLastQuestion ? 'Mark & Finish' : 'Mark for Review & Next'}
            </motion.button>

            <motion.button
              onClick={onClearResponse}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-lg font-semibold transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear Response
            </motion.button>
          </div>

          {/* Right side - Submit button */}
          <motion.button
            onClick={onSubmitTest}
            disabled={isSubmitting}
            className={`
              px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg
              ${isSubmitting
                ? 'bg-slate-400 dark:bg-slate-600 text-slate-200 dark:text-slate-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
              }
            `}
            whileHover={!isSubmitting ? { scale: 1.05 } : {}}
            whileTap={!isSubmitting ? { scale: 0.95 } : {}}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Test'
            )}
          </motion.button>
        </div>

        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
            <span>Practice Session Progress</span>
            <span>Complete all questions to submit</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
