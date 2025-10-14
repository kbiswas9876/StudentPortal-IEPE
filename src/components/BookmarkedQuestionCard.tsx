'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  StarIcon, 
  ChevronDownIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import {
  Edit3,
  Check,
  X,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  BookmarkX,
  Archive
} from 'lucide-react'
import KatexRenderer from './ui/KatexRenderer'
import { Database } from '@/types/database'

interface BookmarkedQuestion {
  id: string
  user_id: string
  question_id: string
  personal_note: string | null
  custom_tags: string[] | null
  user_difficulty_rating: number | null
  created_at: string
  updated_at: string
  questions: Database['public']['Tables']['questions']['Row']
  performance: {
    total_attempts: number
    correct_attempts: number
    success_rate: number
    last_attempt_status: string
    last_attempt_time: number | null
    last_attempt_date: string | null
    time_trend: 'faster' | 'slower' | 'none' | null
  }
}

interface BookmarkedQuestionCardProps {
  question: BookmarkedQuestion
  index: number
  onRatingUpdate?: () => void
  onRemove?: (questionId: string) => void
  isSelected?: boolean
  onSelect?: (questionId: string, selected: boolean) => void
}

export default function BookmarkedQuestionCard({ question, index, onRatingUpdate, onRemove, isSelected = false, onSelect }: BookmarkedQuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [tempRating, setTempRating] = useState(question.user_difficulty_rating || 0)
  const [tempNote, setTempNote] = useState(question.personal_note || '')
  const [tempTags, setTempTags] = useState<string[]>(question.custom_tags || [])
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false) // New state for answer visibility

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleSaveRating = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/revision-hub/bookmarks/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarkId: question.id,
          rating: tempRating || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('API Error:', result)
        throw new Error(result.error || 'Failed to update rating')
      }

      // Update the local state
      question.user_difficulty_rating = tempRating || null
      setHoveredRating(0)
      setIsEditingRating(false)
      
      // Notify parent to refresh if needed
      onRatingUpdate?.()
    } catch (error) {
      console.error('Error updating rating:', error)
      alert(`Failed to update rating: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTags = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/revision-hub/bookmarks/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarkId: question.id,
          customTags: tempTags.length > 0 ? tempTags : null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('API Error:', result)
        throw new Error(result.error || 'Failed to update tags')
      }

      // Update the local state
      question.custom_tags = tempTags.length > 0 ? tempTags : null
      setIsEditingTags(false)
      setTagInput('')
      
      // Notify parent to refresh if needed
      onRatingUpdate?.()
    } catch (error) {
      console.error('Error updating tags:', error)
      alert(`Failed to update tags: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNote = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/revision-hub/bookmarks/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarkId: question.id,
          personalNote: tempNote || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('API Error:', result)
        throw new Error(result.error || 'Failed to update note')
      }

      // Update the local state
      question.personal_note = tempNote || null
      setIsEditingNote(false)
      
      // Notify parent to refresh if needed
      onRatingUpdate?.()
    } catch (error) {
      console.error('Error updating note:', error)
      alert(`Failed to update note: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelRating = () => {
    setTempRating(question.user_difficulty_rating || 0)
    setHoveredRating(0)
    setIsEditingRating(false)
  }

  const handleCancelTags = () => {
    setTempTags(question.custom_tags || [])
    setTagInput('')
    setIsEditingTags(false)
  }

  const handleCancelNote = () => {
    setTempNote(question.personal_note || '')
    setIsEditingNote(false)
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tempTags.includes(trimmedTag)) {
      setTempTags([...tempTags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTempTags(tempTags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="h-4 w-4 text-green-500" strokeWidth={2.5} />
      case 'incorrect':
        return <XCircle className="h-4 w-4 text-red-500" strokeWidth={2.5} />
      case 'skipped':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" strokeWidth={2.5} />
      default:
        return <Clock className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
    }
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'Easy-Moderate':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'Moderate':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
      case 'Moderate-Hard':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      case 'Hard':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
    }
  }

  // Removed truncateText function - now showing full question text for better scannability

  const getRatingLabel = (rating: number) => {
    const labels = {
      1: 'Easy',
      2: 'Easy-to-Moderate', 
      3: 'Moderate',
      4: 'Moderate-to-Hard',
      5: 'Hard'
    }
    return labels[rating as keyof typeof labels] || ''
  }

  const renderStars = () => {
    const currentRating = isEditingRating ? tempRating : (question.user_difficulty_rating || 0)
    const displayRating = isEditingRating && hoveredRating > 0 ? hoveredRating : currentRating
    const showTooltip = isEditingRating && hoveredRating > 0
    
    return (
      <div className="relative flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={isEditingRating ? { scale: 1.2 } : {}}
            whileTap={isEditingRating ? { scale: 0.9 } : {}}
            onClick={(e) => {
              e.stopPropagation()
              if (isEditingRating) {
                setTempRating(star)
              }
            }}
            onMouseEnter={() => {
              if (isEditingRating) {
                setHoveredRating(star)
              }
            }}
            onMouseLeave={() => {
              if (isEditingRating) {
                setHoveredRating(0)
              }
            }}
            disabled={!isEditingRating}
            className={`transition-all ${isEditingRating ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {star <= displayRating ? (
              <StarSolidIcon className="h-5 w-5 text-yellow-500 drop-shadow-md" />
            ) : (
              <StarIcon className="h-5 w-5 text-slate-300 dark:text-slate-600" />
            )}
          </motion.button>
        ))}
        
            {/* Descriptive Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="absolute -top-12 bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10"
                  style={{
                    left: `${(hoveredRating - 1) * 20 - (() => {
                      // Precise positioning based on star position
                      switch(hoveredRating) {
                        case 1: return 10; // Easy: shift left by half distance (10px)
                        case 2: return 40; // Easy-to-Moderate: shift left by 2x distance (40px)
                        case 3: return 20; // Moderate: shift left by 1x distance (20px)
                        case 4: return 40; // Moderate-to-Hard: shift left by 2x distance (40px)
                        case 5: return 10; // Hard: shift left by half distance (10px)
                        default: return 0;
                      }
                    })()}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {getRatingLabel(hoveredRating)}
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-700"
                  ></div>
                </motion.div>
              )}
            </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      {/* Collapsed/Compact View - Always Visible */}
          <div
            className="p-5 cursor-pointer relative"
            onClick={() => {
              setIsExpanded(!isExpanded)
              setShowAnswer(false) // Reset answer visibility when collapsing/expanding
            }}
          >
        {/* Selection Checkbox - Top Left Corner */}
        {onSelect && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-3 left-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onSelect(question.question_id, e.target.checked)
              }}
              className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 shadow-sm"
            />
          </motion.div>
        )}

        <div className="flex items-start justify-between gap-4">
          {/* Left Side - Main Content */}
          <div className="flex-1 min-w-0 pl-8">
            {/* Book & Question ID + Metadata Header */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1.5">
                <BookOpenIcon className="h-3.5 w-3.5" />
                {question.questions.book_source} #{question.questions.question_number_in_book}
              </span>
              {question.questions.difficulty && (
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getDifficultyColor(question.questions.difficulty)}`}>
                  {question.questions.difficulty}
                </span>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                • Bookmarked: {formatDate(question.created_at)}
              </span>
              {question.questions.exam_metadata && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  • {question.questions.exam_metadata}
                </span>
              )}
              
              {/* Remove Button - Safely positioned in header */}
              {onRemove && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(question.question_id)
                  }}
                  className="p-1.5 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 shadow-sm hover:shadow-md ml-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Remove from Revision Hub"
                >
                  <BookmarkX className="h-3.5 w-3.5" strokeWidth={2.5} />
                </motion.button>
              )}
            </div>

            {/* Full Question Text - Always Show Complete Text for Better Scannability */}
            <div className="text-slate-900 dark:text-slate-100 mb-3">
              <KatexRenderer 
                content={question.questions.question_text}
                className="text-sm leading-relaxed"
              />
            </div>

            {/* Metadata Row */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Star Rating with Edit */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">My Rating:</span>
                  {renderStars()}
                </div>
                
                {isExpanded && (
                  <>
                    {!isEditingRating ? (
                      <motion.button
                        whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsEditingRating(true)
                          setTempRating(question.user_difficulty_rating || 0)
                          setHoveredRating(0)
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
                          onClick={handleSaveRating}
                          disabled={isSaving}
                          className="p-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Save rating"
                        >
                          <Check className="h-3.5 w-3.5 text-white drop-shadow-sm" strokeWidth={3} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleCancelRating}
                          disabled={isSaving}
                          className="p-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5 text-white drop-shadow-sm" strokeWidth={3} />
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Performance Indicator */}
              {question.performance.total_attempts > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  {getStatusIcon(question.performance.last_attempt_status)}
                  <span className={`font-medium ${
                    question.performance.success_rate >= 80 ? 'text-green-600 dark:text-green-400' :
                    question.performance.success_rate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {question.performance.success_rate}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            
            {/* Expand/Collapse Icon */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ChevronDownIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded View - Conditionally Rendered */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pb-5 pt-0 border-t border-slate-200 dark:border-slate-700">
              <div className="pt-4 space-y-4">
                    {/* Options */}
                    {question.questions.options && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Options:
                          </h4>
                          {!showAnswer ? (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowAnswer(true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                            >
                              <Eye className="h-3.5 w-3.5" strokeWidth={2.5} />
                              Show Answer
                            </motion.button>
                          ) : (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowAnswer(false)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                            >
                              <Eye className="h-3.5 w-3.5" strokeWidth={2.5} />
                              Hide Answer
                            </motion.button>
                          )}
                        </div>
                        {/* Two-column grid layout */}
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(question.questions.options).map(([key, value]) => (
                            <div
                              key={key}
                              className={`p-3 rounded-lg border transition-all ${
                                showAnswer && key === question.questions.correct_option
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30'
                              }`}
                            >
                              <div className="flex items-start">
                                <span className={`font-semibold mr-3 ${
                                  showAnswer && key === question.questions.correct_option
                                    ? 'text-green-700 dark:text-green-400'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}>
                                  {key}.
                                </span>
                                <div className="flex-1">
                                  <KatexRenderer
                                    content={value as string}
                                    className="text-sm"
                                  />
                                </div>
                                {showAnswer && key === question.questions.correct_option && (
                                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 ml-2 flex-shrink-0" strokeWidth={2.5} />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Success Rate</div>
                    <div className="flex items-baseline space-x-2">
                      <span className={`text-2xl font-bold ${
                        question.performance.success_rate >= 80 ? 'text-green-600 dark:text-green-400' :
                        question.performance.success_rate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        question.performance.success_rate > 0 ? 'text-red-600 dark:text-red-400' :
                        'text-slate-400 dark:text-slate-500'
                      }`}>
                        {question.performance.success_rate}%
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({question.performance.correct_attempts}/{question.performance.total_attempts})
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Last Attempt</div>
                    {question.performance.last_attempt_status !== 'never_attempted' ? (
                      <div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize mb-1">
                          {question.performance.last_attempt_status}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatTime(question.performance.last_attempt_time)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 dark:text-slate-500">
                        Never attempted
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal Note and Custom Tags Section - Always show when expanded */}
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {/* Custom Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        My Tags
                      </h4>
                      {!isEditingTags ? (
                        <motion.button
                          whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsEditingTags(true)
                            setTempTags(question.custom_tags || [])
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
                            onClick={handleSaveTags}
                            disabled={isSaving}
                            className="p-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Save tags"
                          >
                            <Check className="h-3 w-3 text-white drop-shadow-sm" strokeWidth={3} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCancelTags}
                            disabled={isSaving}
                            className="p-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel"
                          >
                            <X className="h-3 w-3 text-white drop-shadow-sm" strokeWidth={3} />
                          </motion.button>
                        </div>
                      )}
                    </div>
                    
                    {isEditingTags ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {tempTags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
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
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagInputKeyDown}
                            placeholder="Add a tag (press Enter)"
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                          />
                          <button
                            onClick={handleAddTag}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" strokeWidth={2.5} />
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {question.custom_tags && question.custom_tags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {question.custom_tags.map((tag, idx) => (
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

                  {/* Personal Note */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        My Note
                      </h4>
                      {!isEditingNote ? (
                        <motion.button
                          whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsEditingNote(true)
                            setTempNote(question.personal_note || '')
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
                            onClick={handleSaveNote}
                            disabled={isSaving}
                            className="p-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Save note"
                          >
                            <Check className="h-3 w-3 text-white drop-shadow-sm" strokeWidth={3} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCancelNote}
                            disabled={isSaving}
                            className="p-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel"
                          >
                            <X className="h-3 w-3 text-white drop-shadow-sm" strokeWidth={3} />
                          </motion.button>
                        </div>
                      )}
                    </div>
                    
                    {isEditingNote ? (
                      <textarea
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="Add a personal note about this question..."
                        rows={3}
                        className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y placeholder:text-slate-400"
                      />
                    ) : (
                      <div>
                        {question.personal_note ? (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-2.5 rounded text-xs text-slate-700 dark:text-slate-300 italic">
                            &ldquo;{question.personal_note}&rdquo;
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">No note yet</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
