'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface PreTestInstructionsProps {
  test: {
    id: number
    name: string
    description: string | null
    total_time_minutes: number
    marks_per_correct: number
    negative_marks_per_incorrect: number
    total_questions: number
  }
}

export default function PreTestInstructions({ test }: PreTestInstructionsProps) {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)

  const handleStartTest = () => {
    if (!agreed) return

    // Navigate with consent flag and timestamp
    router.push(`/practice?mockTestId=${test.id}&testMode=mock&agreedToInstructions=true&sessionStart=${Date.now()}`)
  }

  const handleCancel = () => {
    router.push('/mock-tests')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {test.name}
          </h1>
          {test.description && (
            <p className="text-slate-600 dark:text-slate-400">
              {test.description}
            </p>
          )}
        </div>

        {/* Test Overview */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Test Overview
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Questions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{test.total_questions}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Time</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{test.total_time_minutes} min</p>
            </div>
          </div>
        </div>

        {/* Marking Scheme */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Marking Scheme
          </h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
              <span>Each correct answer: <strong>+{test.marks_per_correct} mark(s)</strong></span>
            </li>
            {test.negative_marks_per_incorrect > 0 && (
              <li className="flex items-start">
                <span className="text-red-600 dark:text-red-400 mr-2">✗</span>
                <span>Each incorrect answer: <strong>-{test.negative_marks_per_incorrect} mark(s)</strong></span>
              </li>
            )}
            <li className="flex items-start">
              <span className="text-slate-600 dark:text-slate-400 mr-2">○</span>
              <span>Unanswered questions: <strong>0 marks</strong></span>
            </li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            General Instructions
          </h2>
          <ol className="space-y-2 list-decimal list-inside">
            <li>The timer will start immediately when you begin the test.</li>
            <li>You cannot pause the timer once started.</li>
            <li>Browser refresh is supported, but may cause brief interruptions.</li>
            <li>Ensure stable internet connection throughout the test.</li>
            <li>You can navigate between questions freely.</li>
            <li>Submit your test before time expires to save your answers.</li>
          </ol>
        </div>

        {/* Agreement Checkbox */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-900 dark:text-slate-100">
              I have read and understood all the instructions and rules. I agree to start the test.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-medium py-3 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartTest}
            disabled={!agreed}
            className={`flex-1 font-semibold py-3 rounded-xl transition-colors ${
              agreed
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            I Agree - Start Test
          </button>
        </div>
      </motion.div>
    </div>
  )
}
