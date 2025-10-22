'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'

interface BulkDelayControlProps {
  userId: string
}

export default function BulkDelayControl({ userId }: BulkDelayControlProps) {
  const [delayDays, setDelayDays] = useState<number>(3)
  const [isDelaying, setIsDelaying] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleDelay = async () => {
    setIsDelaying(true)
    setMessage(null)
    setShowConfirmModal(false)

    try {
      const response = await fetch('/api/user/srs-preferences/delay-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, delayDays })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Success! ${result.updatedCount} reviews delayed by ${delayDays} days.`
        })
        
        // Trigger due count refresh
        window.dispatchEvent(new CustomEvent('srs-review-complete'))
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delay reviews' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsDelaying(false)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Delay All Reviews
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Postpone your entire review schedule (vacation mode)
            </p>
          </div>
        </div>

        {/* Days Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Delay by how many days?
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="365"
              value={delayDays}
              onChange={(e) => setDelayDays(parseInt(e.target.value) || 1)}
              className="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">days</span>
            </div>
          </div>
        </div>

        {/* Example Display */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Example:</strong> A question scheduled for tomorrow will be moved to {new Date(Date.now() + (delayDays + 1) * 24 * 60 * 60 * 1000).toLocaleDateString()}.
          </p>
        </div>

        {/* Delay Button */}
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={isDelaying || delayDays < 1}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isDelaying ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Delaying...
            </>
          ) : (
            <>
              <Calendar className="h-5 w-5" />
              Delay All Reviews
            </>
          )}
        </button>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This action delays all existing bookmarks, including both SRS-scheduled and custom reminders. New bookmarks created after this action will not be affected.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-6 max-w-md w-full z-50"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Confirm Delay
                </h3>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                This will delay <strong>all your existing review schedules</strong> by <strong>{delayDays} day{delayDays !== 1 ? 's' : ''}</strong>. This action cannot be undone (but you can delay again if needed).
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelay}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all"
                >
                  Confirm Delay
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

