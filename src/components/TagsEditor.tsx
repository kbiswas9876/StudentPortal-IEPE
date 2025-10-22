'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Edit3, Check, X, Plus } from 'lucide-react'

interface TagsEditorProps {
  tags: string[]
  isEditing: boolean
  onStartEdit: () => void
  tempTags: string[]
  tagInput: string
  onTagInputChange: (value: string) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
}

export default function TagsEditor({
  tags,
  isEditing,
  onStartEdit,
  tempTags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onSave,
  onCancel,
  isSaving
}: TagsEditorProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAddTag()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          My Tags
        </h4>
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onStartEdit()
            }}
            className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200"
            title="Edit tags"
          >
            <Edit3 className="h-3 w-3 text-white drop-shadow-sm" strokeWidth={2.5} />
          </motion.button>
        ) : (
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)" }}
              whileTap={{ scale: 0.9 }}
              onClick={onSave}
              disabled={isSaving}
              className="p-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save tags"
            >
              <Check className="h-3 w-3 text-white drop-shadow-sm" strokeWidth={3} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}
              whileTap={{ scale: 0.9 }}
              onClick={onCancel}
              disabled={isSaving}
              className="p-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Cancel"
            >
              <X className="h-3 w-3 text-white drop-shadow-sm" strokeWidth={3} />
            </motion.button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {tempTags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700"
              >
                {tag}
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="ml-1.5 hover:text-purple-900 dark:hover:text-purple-100 transition-colors"
                >
                  <X className="h-3 w-3" strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => onTagInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a tag (press Enter)"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            />
            <button
              onClick={onAddTag}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
              Add
            </button>
          </div>
        </div>
      ) : (
        <div>
          {tags && tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No tags yet</p>
          )}
        </div>
      )}
    </div>
  )
}

