'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Database } from '@/types/database'
import { getAdvancedSpeedCategory, type AdvancedDifficulty, type SpeedCategory } from '@/lib/speed-calculator'
import KatexRenderer from './ui/KatexRenderer'

type Question = Database['public']['Tables']['questions']['Row']
type ReviewStatus = 'correct' | 'incorrect' | 'skipped'

interface ViewAllQuestionsModalProps {
  isOpen: boolean
  onClose: () => void
  questions: Question[]
  reviewStates: ReviewStatus[]
  timePerQuestion: Record<string, number>
  onQuestionSelect: (index: number) => void
}

export default function ViewAllQuestionsModal({
  isOpen,
  onClose,
  questions,
  reviewStates,
  timePerQuestion,
  onQuestionSelect
}: ViewAllQuestionsModalProps) {
  
  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'incorrect':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'skipped':
        return <Clock className="w-5 h-5 text-gray-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusLabel = (status: ReviewStatus) => {
    switch (status) {
      case 'correct':
        return 'Correct'
      case 'incorrect':
        return 'Incorrect'
      case 'skipped':
        return 'Skipped'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case 'correct':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'incorrect':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'skipped':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSpeedColor = (question: Question, status: ReviewStatus) => {
    if (status === 'skipped') return 'text-gray-500'
    
    const timeTakenInSeconds = timePerQuestion[question.id.toString()] || 0
    const difficulty = question.difficulty as AdvancedDifficulty
    const speedCategory = getAdvancedSpeedCategory(timeTakenInSeconds, difficulty)
    
    return speedCategory === 'Fast' ? 'text-green-600' : 'text-orange-500'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                All Questions
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const status = reviewStates[index] || 'skipped'
                  const timeTaken = timePerQuestion[question.id.toString()] || 0
                  
                  return (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        onQuestionSelect(index)
                        onClose()
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg font-semibold text-sm">
                              Question {index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                              {getStatusLabel(status)}
                            </span>
                          </div>
                          
                          <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed line-clamp-3">
                            <KatexRenderer 
                              content={question.question_text || ''}
                              className="text-slate-800 dark:text-slate-200"
                            />
                          </div>
                          
                          {/* Time and Difficulty Info */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
                            <span>Time: {formatTime(timeTaken)}</span>
                            <span>Difficulty: {question.difficulty || 'Unknown'}</span>
                          </div>
                        </div>

                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {getStatusIcon(status)}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Total Questions: {questions.length}</span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Correct: {reviewStates.filter(s => s === 'correct').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Incorrect: {reviewStates.filter(s => s === 'incorrect').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Skipped: {reviewStates.filter(s => s === 'skipped').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
