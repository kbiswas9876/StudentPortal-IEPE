'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Trash2, Star } from 'lucide-react'
import KatexRenderer from './ui/KatexRenderer'

interface BookmarkRemovalModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  questionText: string
  questionId: string
  isBulk?: boolean
  bulkCount?: number
  chapterNames?: string[]
  userDifficultyRating?: number
  bulkDifficultyBreakdown?: { [rating: number]: number }
}

export default function BookmarkRemovalModal({
  isOpen,
  onClose,
  onConfirm,
  questionText,
  questionId,
  isBulk = false,
  bulkCount = 0,
  chapterNames = [],
  userDifficultyRating = 1,
  bulkDifficultyBreakdown = {}
}: BookmarkRemovalModalProps) {
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
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {isBulk ? 'Remove Multiple Bookmarks' : 'Remove from Revision Hub'}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {isBulk ? 'This action cannot be undone' : 'This question will be removed from your revision hub'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500 dark:text-slate-400" strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {isBulk ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Bulk Removal Summary
                    </h3>
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">{bulkCount}</span> bookmarked questions will be removed from:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {chapterNames.map((chapter, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                          >
                            {chapter}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Questions by Difficulty Rating
                    </h3>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((rating) => {
                        const count = bulkDifficultyBreakdown[rating] || 0
                        if (count === 0) return null
                        
                        return (
                          <div key={rating} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= rating
                                        ? 'text-yellow-500 fill-current'
                                        : 'text-slate-300 dark:text-slate-600'
                                    }`}
                                    strokeWidth={2.5}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {rating === 1 ? 'Easy' : 
                                 rating === 2 ? 'Easy-to-Moderate' :
                                 rating === 3 ? 'Moderate' :
                                 rating === 4 ? 'Moderate-to-Hard' : 'Hard'}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {count} question{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
                    <span className="font-medium">This action cannot be undone</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Question to Remove
                    </h3>
                    <div className="space-y-3">
                      {/* Full Question Text with LaTeX Rendering */}
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                        <KatexRenderer 
                          content={questionText}
                          className="text-sm leading-relaxed text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      
                      {/* User's Difficulty Rating */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">My Rating:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= userDifficultyRating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                              strokeWidth={2.5}
                            />
                          ))}
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                            ({userDifficultyRating}/5)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
                    <span className="font-medium">This action cannot be undone</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold text-sm rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                  {isBulk ? `Remove ${bulkCount} Bookmarks` : 'Remove from Hub'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
