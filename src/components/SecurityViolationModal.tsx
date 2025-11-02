'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'

// A map to get user-friendly messages for each violation type
const violationMessages: Record<string, string> = {
  fullscreen_exit: 'You have exited full-screen mode.',
  visibility_change: 'You have switched to another tab or application.',
  window_blur: 'You have switched to another window.',
  refresh_attempt_f5: 'You have attempted to refresh the page.',
  refresh_attempt_ctrl_r: 'You have attempted to refresh the page.',
  default: 'A security rule has been violated.',
}

interface SecurityViolationModalProps {
  isOpen: boolean
  violationType: string | null
  onCancel: () => void
  onSubmit: () => void
}

export default function SecurityViolationModal({ isOpen, violationType, onCancel, onSubmit }: SecurityViolationModalProps) {
  if (!isOpen || !violationType) return null

  const message = violationMessages[violationType] || violationMessages.default

  return (
    // This should be a full-screen overlay to prevent any other interaction
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-lg w-full text-center">
        <AlertTriangle className="mx-auto h-14 w-14 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">Security Violation Detected</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
        <p className="mt-4 text-sm font-bold text-red-700 dark:text-red-400">
          Continuing will IMMEDIATELY SUBMIT your test and your session will end. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Return to Test
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Submit My Test
          </button>
        </div>
      </div>
    </div>
  )
}
