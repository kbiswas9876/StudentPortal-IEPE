'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import SegmentedControl from './SegmentedControl'
import PlanBuilder from './PlanBuilder'

interface CreatePlanModalProps {
  onClose: () => void
  onSave: (planData: { name: string; planType: string; content: any }) => void
}

export default function CreatePlanModal({
  onClose,
  onSave
}: CreatePlanModalProps) {
  const [step, setStep] = useState(1)
  const [planName, setPlanName] = useState('')
  const [planType, setPlanType] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [planContent, setPlanContent] = useState<any[]>([])

  const handleNext = () => {
    if (step === 1 && planName.trim()) {
      setStep(2)
    }
  }

  const handleSave = () => {
    if (planName.trim() && planContent.length > 0) {
      onSave({
        name: planName.trim(),
        planType,
        content: planContent
      })
    }
  }

  const canProceed = () => {
    if (step === 1) {
      return planName.trim().length > 0
    }
    return true
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Create Practice Plan
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Step {step} of 2: {step === 1 ? 'Plan Details' : 'Plan Content'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Plan Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g., Week 1 - Arithmetic Focus"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Plan Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Plan Type
                  </label>
                  <SegmentedControl
                    options={[
                      { label: 'Daily', value: 'daily' },
                      { label: 'Weekly', value: 'weekly' },
                      { label: 'Monthly', value: 'monthly' },
                    ]}
                    value={planType}
                    onChange={(value) => setPlanType(value as 'daily' | 'weekly' | 'monthly')}
                  />
                </div>

                {/* Plan Type Description */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    {planType === 'daily' && 'Daily Plan'}
                    {planType === 'weekly' && 'Weekly Plan'}
                    {planType === 'monthly' && 'Monthly Plan'}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {planType === 'daily' && 'Perfect for focused daily practice sessions with specific topics each day.'}
                    {planType === 'weekly' && 'Ideal for structured weekly learning with different subjects across days.'}
                    {planType === 'monthly' && 'Great for comprehensive monthly study programs with progressive difficulty.'}
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PlanBuilder
                  planType={planType}
                  onContentChange={setPlanContent}
                />
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              {[1, 2].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-2 h-2 rounded-full ${
                    stepNum <= step 
                      ? 'bg-blue-600' 
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  Back
                </button>
              )}
              
              {step === 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={planContent.length === 0}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                >
                  Save Plan
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
