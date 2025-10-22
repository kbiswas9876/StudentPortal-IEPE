'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Target, Clock } from 'lucide-react'

interface SrsPacingControlProps {
  userId: string
}

export default function SrsPacingControl({ userId }: SrsPacingControlProps) {
  const [pacingMode, setPacingMode] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Fetch current pacing preference
  useEffect(() => {
    const fetchPacing = async () => {
      try {
        const response = await fetch(`/api/user/srs-preferences?userId=${userId}`)
        const data = await response.json()
        
        if (response.ok) {
          setPacingMode(data.srs_pacing_mode)
        }
      } catch (error) {
        console.error('Error fetching pacing:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPacing()
  }, [userId])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    setPacingMode(newValue)
    setHasChanges(true)
    setMessage(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/srs-preferences/update-pacing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pacingMode })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Updated! ${result.updatedCount} cards recalculated. ${result.newlyDueCount} cards now due.`
        })
        setHasChanges(false)
        
        // Trigger due count refresh
        window.dispatchEvent(new CustomEvent('srs-review-complete'))
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update pacing' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSaving(false)
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
    if (value < -0.5) return 'Maximum review frequency. Ideal for exam preparation and rapid learning.'
    if (value < 0) return 'Increased review frequency. Good for challenging material.'
    if (value === 0) return 'Balanced approach. The default algorithm optimized for long-term retention.'
    if (value < 0.5) return 'Reduced review frequency. Suitable for familiar material.'
    return 'Minimum review frequency. Best for well-mastered concepts.'
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-slate-200 dark:border-slate-700 p-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
          <Target className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Learning Pace
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Adjust how frequently you review your bookmarked questions
          </p>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Intensive
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Relaxed
            </span>
          </div>
        </div>

        <input
          type="range"
          min="-1"
          max="1"
          step="0.05"
          value={pacingMode}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        />

        <div className="mt-4 text-center">
          <motion.div
            key={pacingMode}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-bold"
          >
            {getPacingLabel(pacingMode)}
          </motion.div>
        </div>
      </div>

      {/* Description */}
      <motion.div
        key={pacingMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {getPacingDescription(pacingMode)}
        </p>
      </motion.div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!hasChanges || isSaving}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            Recalculating...
          </>
        ) : (
          'Apply Changes'
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

      {/* Warning */}
      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg">
        <p className="text-xs text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> Changing this setting will immediately recalculate all your existing review schedules. This operation cannot be undone.
        </p>
      </div>
    </div>
  )
}

