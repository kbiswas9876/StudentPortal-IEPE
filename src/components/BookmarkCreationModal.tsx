'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bookmark, Tag, FileText, Calendar } from 'lucide-react'
import KatexRenderer from './ui/KatexRenderer'
import StarRating from './ui/StarRating'

interface BookmarkCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (bookmarkData: {
    difficultyRating: number
    customTags: string[]
    personalNote: string
    isCustomReminderActive: boolean
    customNextReviewDate: string | null
  }) => Promise<void>
  questionText: string
  questionId: string
}

export default function BookmarkCreationModal({
  isOpen,
  onClose,
  onSave,
  questionText,
  questionId
}: BookmarkCreationModalProps) {
  const [difficultyRating, setDifficultyRating] = useState(1) // Default to 1-star
  const [customTags, setCustomTags] = useState<string[]>([])
  const [personalNote, setPersonalNote] = useState('')
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  // Custom Reminder state
  const [isCustomReminderActive, setIsCustomReminderActive] = useState(false)
  const [customNextReviewDate, setCustomNextReviewDate] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDifficultyRating(1) // Always reset to 1 star
      setCustomTags([])
      setPersonalNote('')
      setNewTag('')
      setIsCustomReminderActive(false)
      setCustomNextReviewDate('')
    }
  }, [isOpen])

  const getRatingLabel = (rating: number) => {
    const labels = {
      1: 'Very Easy',
      2: 'Easy', 
      3: 'Moderate',
      4: 'Hard',
      5: 'Very Hard'
    }
    return labels[rating as keyof typeof labels] || ''
  }

  const getDifficultyColorClasses = (rating: number) => {
    const colorSchemes = {
      1: 'text-white bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/50 border-emerald-400/30',
      2: 'text-white bg-gradient-to-br from-lime-500 to-yellow-500 shadow-lime-500/50 border-lime-400/30',
      3: 'text-white bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/50 border-amber-400/30',
      4: 'text-white bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/50 border-orange-400/30',
      5: 'text-white bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/50 border-red-400/30'
    }
    return colorSchemes[rating as keyof typeof colorSchemes] || 'text-slate-600 dark:text-slate-400'
  }
  
  // Get minimum date (today) for the date picker
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const handleSave = async () => {
    if (difficultyRating < 1) {
      return // Should not happen due to default, but safety check
    }
    
    // Validate custom reminder if active
    if (isCustomReminderActive && !customNextReviewDate) {
      alert('Please select a reminder date')
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        difficultyRating,
        customTags,
        personalNote: personalNote.trim(),
        isCustomReminderActive,
        customNextReviewDate: isCustomReminderActive ? customNextReviewDate : null
      })
      onClose()
      
      // Reset custom reminder state
      setIsCustomReminderActive(false)
      setCustomNextReviewDate('')
    } catch (error) {
      console.error('Error saving bookmark:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !customTags.includes(trimmedTag)) {
      setCustomTags([...customTags, trimmedTag])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
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
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 shadow-sm">
                    <Bookmark className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Add to Revision Hub
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Save this question for targeted practice
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
            <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Question Preview */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Question Preview
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                  <KatexRenderer content={questionText} />
                </div>
              </div>

              {/* Difficulty Rating - Mandatory */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Difficulty Rating *
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">(Required)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div onClick={(e) => e.stopPropagation()}>
                    <StarRating
                      value={difficultyRating}
                      onChange={setDifficultyRating}
                      maxRating={5}
                      size="md"
                      disabled={false}
                      readonly={false}
                      showTooltip={true}
                    />
                  </div>
                  
                  {/* Modern Color-coded Difficulty Label */}
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`group relative inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg hover:shadow-xl transition-all duration-300 ${getDifficultyColorClasses(difficultyRating)}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Shine effect overlay */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Subtle glow effect */}
                    <div className={`absolute inset-0 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 ${
                      difficultyRating === 1 ? 'bg-emerald-400/30' :
                      difficultyRating === 2 ? 'bg-lime-400/30' :
                      difficultyRating === 3 ? 'bg-amber-400/30' :
                      difficultyRating === 4 ? 'bg-orange-400/30' :
                      'bg-red-400/30'
                    }`} />
                    
                    <span className="relative z-10 drop-shadow-sm">
                      {getRatingLabel(difficultyRating)}
                    </span>
                  </motion.span>
                </div>
              </div>

              {/* Custom Tags - Optional */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-500" strokeWidth={2.5} />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Custom Tags
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">(Optional)</span>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag (e.g., 'algebra', 'derivatives')"
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                    />
                    <motion.button
                      onClick={addTag}
                      disabled={!newTag.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add
                    </motion.button>
                  </div>
                  {customTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customTags.map((tag, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-sm"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Note - Optional */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" strokeWidth={2.5} />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Personal Note
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">(Optional)</span>
                </div>
                <textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="Add a personal note about this question (e.g., 'Need to review this concept', 'Common mistake to avoid')"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 resize-none"
                />
              </div>
              
              {/* Custom Reminder - Optional */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" strokeWidth={2.5} />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Set Custom Reminder
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">(Optional)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomReminderActive(!isCustomReminderActive)
                      if (!isCustomReminderActive) {
                        setCustomNextReviewDate('')
                      }
                    }}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${isCustomReminderActive 
                        ? 'bg-purple-600' 
                        : 'bg-slate-300 dark:bg-slate-600'
                      }
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${isCustomReminderActive ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Override automatic SRS scheduling and set your own review date
                </p>
                
                {/* Date Picker - Only visible when toggle is ON */}
                <AnimatePresence>
                  {isCustomReminderActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Review Date
                        </label>
                        <input
                          type="date"
                          value={customNextReviewDate}
                          onChange={(e) => setCustomNextReviewDate(e.target.value)}
                          min={getMinDate()}
                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                        />
                        {customNextReviewDate && (
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                            ✓ Reminder set for {new Date(customNextReviewDate).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" strokeWidth={2.5} />
                      Save to Revision Hub
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
