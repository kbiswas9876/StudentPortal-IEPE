'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Database } from '@/types/database'
import KatexRenderer from './ui/KatexRenderer'

type BookmarkedQuestion = {
  id: string
  user_id: string
  question_id: string
  personal_note: string | null
  custom_tags: string[] | null
  created_at: string
  updated_at: string
  questions: Database['public']['Tables']['questions']['Row']
}

interface EditBookmarkModalProps {
  bookmark: BookmarkedQuestion
  onClose: () => void
  onSave: (data: { personalNote: string; customTags: string[] }) => void
}

export default function EditBookmarkModal({
  bookmark,
  onClose,
  onSave
}: EditBookmarkModalProps) {
  const [personalNote, setPersonalNote] = useState('')
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setPersonalNote(bookmark.personal_note || '')
    setCustomTags(bookmark.custom_tags || [])
  }, [bookmark])

  const handleAddTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await onSave({
        personalNote: personalNote.trim(),
        customTags
      })
    } finally {
      setIsSubmitting(false)
    }
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
          className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Edit Revision Note
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Add context and tags to help with your revision
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
            {/* Question Preview */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Question Preview:
              </h4>
              <KatexRenderer 
                content={bookmark.questions.question_text}
                className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3"
              />
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Q{bookmark.questions.question_number_in_book} • {bookmark.questions.book_source} • {bookmark.questions.chapter_name}
              </div>
            </div>

            <div className="space-y-6">
              {/* Personal Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Personal Notes
                </label>
                <textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="Add your personal notes, insights, or reminders about this question..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  These notes are private and will help you during revision.
                </p>
              </div>

              {/* Custom Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Custom Tags
                </label>
                
                {/* Tag Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Tags */}
                {customTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customTags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-green-600 dark:hover:text-green-400"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tags help you organize and filter your revision questions.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}