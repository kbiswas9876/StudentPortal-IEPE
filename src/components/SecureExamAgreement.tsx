'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

interface SecureExamAgreementProps {
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

export default function SecureExamAgreement({ test }: SecureExamAgreementProps) {
  const router = useRouter()
  const [hasAgreed, setHasAgreed] = useState(false)

  const handleStartTest = () => {
    if (!hasAgreed) return

    // Navigate with consent flag and timestamp
    router.push(`/practice?mockTestId=${test.id}&testMode=mock&agreedToInstructions=true&sessionStart=${Date.now()}`)
  }

  const handleCancel = () => {
    router.push('/mock-tests')
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Main content card with larger max-width for substantial feel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-5xl w-full"
      >
        {/* Header Section - Bolder and more centered */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <ShieldCheck className="mx-auto h-14 w-14 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-3 mb-2">
            Secure Exam Environment
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
            You are about to begin the mock test:
          </p>
          <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
            {test.name}
          </h2>
          {test.description && (
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">{test.description}</p>
          )}
        </div>

        {/* Core Content - Two Column Layout on Desktop */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Column 1: Test Instructions - Styled card */}
          <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg border border-slate-200 dark:border-slate-600">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4 border-b border-slate-300 dark:border-slate-600 pb-2">
              Test Instructions
            </h3>
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              {/* Key-value pairs for better alignment and readability */}
              <div className="flex justify-between items-center">
                <span>Duration:</span>
                <span className="font-bold">{test.total_time_minutes} minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Questions:</span>
                <span className="font-bold">{test.total_questions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Marks per correct:</span>
                <span className="font-bold">+{test.marks_per_correct}</span>
              </div>
              {test.negative_marks_per_incorrect > 0 && (
                <div className="flex justify-between items-center">
                  <span>Negative marking:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    -{test.negative_marks_per_incorrect}
                  </span>
                </div>
              )}
            </div>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300 list-disc list-inside mt-6 text-sm">
              <li>Ensure you have a stable internet connection.</li>
              <li>The test will automatically start in <strong>full-screen mode</strong>.</li>
              <li>Once you begin, the timer cannot be paused.</li>
              <li>You can navigate between questions freely.</li>
              <li>Submit your test before time expires to save your answers.</li>
            </ul>
          </div>

          {/* Column 2: Prohibited Actions - REVISED with more impactful styling */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 dark:border-red-400/50 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
              <h3 className="text-xl font-extrabold text-red-800 dark:text-red-300 uppercase tracking-wider">
                Prohibited Actions
              </h3>
            </div>
            <p className="text-red-700 dark:text-red-300 mt-3 font-medium">
              To ensure fairness, the following actions are strictly forbidden. Any attempt will trigger a security warning and may result in the <strong>IMMEDIATE SUBMISSION</strong> of your test:
            </p>
            {/* The list uses stronger "DO NOT" language */}
            <ul className="space-y-3 mt-4 text-red-900 dark:text-red-200 font-bold text-base">
              <li>- DO NOT Exit Full-Screen Mode</li>
              <li>- DO NOT Refresh the Page (F5 or Ctrl+R)</li>
              <li>- DO NOT Switch to Another Tab or Application</li>
              <li>- DO NOT Use Developer Tools (F12)</li>
              <li>- DO NOT Right-click or attempt to copy/paste</li>
              <li>- DO NOT Take Screenshots (where detected)</li>
            </ul>
          </div>
        </div>

        {/* Agreement and Action Buttons Section */}
        <div className="mt-10 pt-6 border-t border-slate-300 dark:border-slate-600">
          <div className="flex items-center justify-center">
            <input
              id="agreement-checkbox"
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="h-5 w-5 text-indigo-600 dark:text-indigo-400 border-gray-400 dark:border-slate-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
            />
            <label 
              htmlFor="agreement-checkbox" 
              className="ml-3 text-slate-700 dark:text-slate-300 cursor-pointer max-w-2xl"
            >
              I have read, understood, and agree to the exam rules and security requirements. I understand that violating these rules may result in immediate test submission and disqualification.
            </label>
          </div>

          {/* Action Buttons - Centered */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handleCancel}
              className="px-8 py-3 font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartTest}
              disabled={!hasAgreed}
              className={`px-12 py-3 text-lg font-bold text-white rounded-md transition-all ${
                hasAgreed 
                  ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer' 
                  : 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              Start Test
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
