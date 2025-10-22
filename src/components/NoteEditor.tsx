'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Edit3, Check, X } from 'lucide-react'

interface NoteEditorProps {
  note: string | null
  isEditing: boolean
  onStartEdit: () => void
  tempNote: string
  onNoteChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
}

export default function NoteEditor({
  note,
  isEditing,
  onStartEdit,
  tempNote,
  onNoteChange,
  onSave,
  onCancel,
  isSaving
}: NoteEditorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          My Note
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
            title="Edit note"
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
              title="Save note"
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
        <textarea
          value={tempNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Add a personal note about this question..."
          rows={3}
          className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y placeholder:text-slate-400"
        />
      ) : (
        <div>
          {note ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-2.5 rounded text-xs text-slate-700 dark:text-slate-300 italic">
              &ldquo;{note}&rdquo;
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No note yet</p>
          )}
        </div>
      )}
    </div>
  )
}

