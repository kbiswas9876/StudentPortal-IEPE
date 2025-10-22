'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings, Brain, Calendar, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import RadialPacingControl from './RadialPacingControl'

interface SrsSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export default function SrsSettingsModal({ isOpen, onClose, userId }: SrsSettingsModalProps) {
  // State for pacing control (section 1)
  const [pacingMode, setPacingMode] = useState<number>(0)
  const [isLoadingPacing, setIsLoadingPacing] = useState(true)
  const [isSavingPacing, setIsSavingPacing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [pacingMessage, setPacingMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // State for delay control (section 2)
  const [delayDays, setDelayDays] = useState<number>(3)
  const [isDelaying, setIsDelaying] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [delayMessage, setDelayMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Fetch pacing preference when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchPacing()
    }
  }, [isOpen, userId])

  // Reset messages when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPacingMessage(null)
      setDelayMessage(null)
    }
  }, [isOpen])

  const fetchPacing = async () => {
    try {
      setIsLoadingPacing(true)
      const response = await fetch(`/api/user/srs-preferences?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setPacingMode(data.srs_pacing_mode)
      }
    } catch (error) {
      console.error('Error fetching pacing:', error)
    } finally {
      setIsLoadingPacing(false)
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    setPacingMode(newValue)
    setHasChanges(true)
    setPacingMessage(null)
  }

  const handleSavePacing = async () => {
    setIsSavingPacing(true)
    setPacingMessage(null)

    try {
      const response = await fetch('/api/user/srs-preferences/update-pacing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pacingMode })
      })

      const result = await response.json()

      if (response.ok) {
        setPacingMessage({
          type: 'success',
          text: `Updated! ${result.updatedCount} cards recalculated. ${result.newlyDueCount} cards now due.`
        })
        setHasChanges(false)
        
        // Trigger due count refresh
        window.dispatchEvent(new CustomEvent('srs-review-complete'))
      } else {
        setPacingMessage({ type: 'error', text: result.error || 'Failed to update pacing' })
      }
    } catch (error) {
      setPacingMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSavingPacing(false)
    }
  }

  const handleDelayReviews = async () => {
    setIsDelaying(true)
    setDelayMessage(null)
    setShowConfirmModal(false)

    try {
      const response = await fetch('/api/user/srs-preferences/delay-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, delayDays })
      })

      const result = await response.json()

      if (response.ok) {
        setDelayMessage({
          type: 'success',
          text: `Success! ${result.updatedCount} reviews delayed by ${delayDays} days.`
        })
        
        // Trigger due count refresh
        window.dispatchEvent(new CustomEvent('srs-review-complete'))
      } else {
        setDelayMessage({ type: 'error', text: result.error || 'Failed to delay reviews' })
      }
    } catch (error) {
      setDelayMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsDelaying(false)
    }
  }

  const getPacingLabel = (value: number): string => {
    if (value <= -0.75) return 'Very Intensive'
    if (value <= -0.25) return 'Intensive'
    if (value <= 0.25) return 'Standard'
    if (value <= 0.75) return 'Relaxed'
    return 'Very Relaxed'
  }

  const getPacingDescription = (value: number): string => {
    if (value < -0.5) return 'Maximum review frequency. Ideal for exam preparation.'
    if (value < 0) return 'Increased review frequency. Good for challenging material.'
    if (value === 0) return 'Balanced approach. Optimized for long-term retention.'
    if (value < 0.5) return 'Reduced review frequency. Suitable for familiar material.'
    return 'Minimum review frequency. Best for well-mastered concepts.'
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showConfirmModal) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, showConfirmModal, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 py-3 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  SRS Settings
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Card 1: Learning Pace */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <Brain className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Learning Pace
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Adjust how frequently you review your bookmarked questions
                    </p>
                  </div>
                </div>

                {isLoadingPacing ? (
                  <div className="py-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 dark:border-slate-700 border-t-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Radial Control */}
                    <div className="flex justify-center">
                      <RadialPacingControl
                        value={pacingMode}
                        onChange={(value) => {
                          setPacingMode(value)
                          setHasChanges(true)
                          setPacingMessage(null)
                        }}
                        disabled={isSavingPacing}
                      />
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={handleSavePacing}
                        disabled={!hasChanges || isSavingPacing}
                        className="px-5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSavingPacing ? (
                          <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent"></div>
                            Saving...
                          </>
                        ) : (
                          'Apply Changes'
                        )}
                      </button>
                    </div>

                    {/* Message */}
                    {pacingMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                          pacingMessage.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-200'
                            : 'bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {pacingMessage.type === 'success' ? (
                          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        {pacingMessage.text}
                      </motion.div>
                    )}

                    {/* Warning */}
                    <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        <strong>Note:</strong> Changes apply immediately to all existing schedules and cannot be undone.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Delay All Reviews */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                    <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Delay All Reviews
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Postpone your entire review schedule (vacation mode)
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Delay Input & Button */}
                  <div className="flex flex-col sm:flex-row gap-2 items-end">
                    <div className="flex-1 sm:flex-initial">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Delay by how many days?
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={delayDays}
                          onChange={(e) => setDelayDays(parseInt(e.target.value) || 1)}
                          className="w-20 px-2.5 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">days</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      disabled={isDelaying || delayDays < 1}
                      className="w-full sm:w-auto px-4 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {isDelaying ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent"></div>
                          Delaying...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-3.5 w-3.5" />
                          Delay Reviews
                        </>
                      )}
                    </button>
                  </div>

                  {/* Example */}
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Example:</strong> A question due tomorrow will be moved to {new Date(Date.now() + (delayDays + 1) * 24 * 60 * 60 * 1000).toLocaleDateString()}.
                    </p>
                  </div>

                  {/* Message */}
                  {delayMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                        delayMessage.type === 'success'
                          ? 'bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-200'
                          : 'bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {delayMessage.type === 'success' ? (
                        <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      {delayMessage.text}
                    </motion.div>
                  )}

                  {/* Info */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      This delays all existing bookmarks (SRS and custom reminders). New bookmarks are not affected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </motion.div>

          {/* Confirmation Modal for Delay */}
          <AnimatePresence>
            {showConfirmModal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 flex items-center justify-center z-[60] p-4"
              >
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 max-w-md w-full">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Confirm Delay
                  </h3>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4 text-xs">
                  This will delay <strong>all your existing review schedules</strong> by <strong>{delayDays} day{delayDays !== 1 ? 's' : ''}</strong>. This action cannot be undone (but you can delay again if needed).
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelayReviews}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    Confirm
                  </button>
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}

