'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Edit3, Check, X } from 'lucide-react'
import { StarRating } from './ui/StarRating'

interface StarRatingDisplayProps {
  rating: number
  isEditing: boolean
  onStartEdit: () => void
  tempRating: number
  onRatingChange: (rating: number) => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
}

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
  return colorSchemes[rating as keyof typeof colorSchemes] || ''
}

export default function StarRatingDisplay({
  rating,
  isEditing,
  onStartEdit,
  tempRating,
  onRatingChange,
  onSave,
  onCancel,
  isSaving
}: StarRatingDisplayProps) {
  const currentRating = isEditing ? tempRating : rating

  return (
    <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 relative overflow-visible">
        <div className="flex items-center gap-1.5 relative overflow-visible">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">My Rating:</span>
          <div className="relative overflow-visible">
            {/* Stars */}
            <div className="flex items-center gap-2">
              <div onClick={(e) => e.stopPropagation()}>
                <StarRating
                  value={currentRating}
                  onChange={isEditing ? onRatingChange : undefined}
                  maxRating={5}
                  size="md"
                  disabled={false}
                  readonly={!isEditing}
                  showTooltip={true}
                />
              </div>
              
              {/* Color-coded Difficulty Label */}
              {currentRating > 0 && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg hover:shadow-xl transition-all duration-300 ${getDifficultyColorClasses(currentRating)}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Shine effect overlay */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Subtle glow effect */}
                  <div className={`absolute inset-0 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 ${
                    currentRating === 1 ? 'bg-emerald-400/30' :
                    currentRating === 2 ? 'bg-lime-400/30' :
                    currentRating === 3 ? 'bg-amber-400/30' :
                    currentRating === 4 ? 'bg-orange-400/30' :
                    'bg-red-400/30'
                  }`} />
                  
                  <span className="relative z-10 drop-shadow-sm">
                    {getRatingLabel(currentRating)}
                  </span>
                </motion.span>
              )}
            </div>
          </div>
        </div>
        
        {/* Edit/Save/Cancel Buttons */}
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onStartEdit()
            }}
            className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200"
            title="Edit rating"
          >
            <Edit3 className="h-3.5 w-3.5 text-white drop-shadow-sm" strokeWidth={2.5} />
          </motion.button>
        ) : (
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)" }}
              whileTap={{ scale: 0.9 }}
              onClick={onSave}
              disabled={isSaving}
              className="p-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save rating"
            >
              <Check className="h-3.5 w-3.5 text-white drop-shadow-sm" strokeWidth={3} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              disabled={isSaving}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-600 hover:border-red-200 dark:hover:border-red-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}

