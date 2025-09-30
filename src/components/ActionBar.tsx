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
    <>
      {/* Left Action Buttons - Mark for Review & Clear Response */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 left-6 z-40"
      >
        <div className="flex items-center space-x-3">
          {/* Mark for Review & Next - Purple with N icon */}
          <motion.button
            onClick={onMarkForReviewAndNext}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-white font-bold">N</span>
            <span>Mark for Review & Next</span>
          </motion.button>

          {/* Clear Response - White with gray border */}
          <motion.button
            onClick={onClearResponse}
            className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 px-4 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Clear Response
          </motion.button>
        </div>
      </motion.div>

      {/* Right Action Button - Save & Next */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="fixed bottom-6 right-[500px] z-40"
      >
        <motion.button
          onClick={onSaveAndNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Save & Next
        </motion.button>
      </motion.div>

      {/* Submit Test Button - Far Right */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          onClick={onSubmitTest}
          disabled={isSubmitting}
          className={`
            px-12 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg min-w-[210px]
            ${isSubmitting
              ? 'bg-slate-400 dark:bg-slate-600 text-slate-200 dark:text-slate-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
            }
          `}
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
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
      </motion.div>
    </>
  )
}
