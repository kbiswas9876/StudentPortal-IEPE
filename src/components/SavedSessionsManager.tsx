'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayIcon, TrashIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth-context'
import { formatTimeHumanReadable } from '@/lib/timeUtils'
import DeleteSessionModal from './DeleteSessionModal'

interface SavedSession {
  id: number
  session_name: string
  session_state: any
  created_at: string
  updated_at: string
}

interface SavedSessionsManagerProps {
  onResumeSession: (sessionState: any) => void
}

export default function SavedSessionsManager({ onResumeSession }: SavedSessionsManagerProps) {
  const { user } = useAuth()
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<SavedSession | null>(null)

  useEffect(() => {
    if (user) {
      fetchSavedSessions()
    }
  }, [user])

  const fetchSavedSessions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('saved_practice_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved sessions:', error)
        return
      }

      setSavedSessions(data || [])
    } catch (error) {
      console.error('Error fetching saved sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResumeSession = async (session: SavedSession) => {
    try {
      // Delete the saved session (one-time resume)
      const { error: deleteError } = await supabase
        .from('saved_practice_sessions')
        .delete()
        .eq('id', session.id)

      if (deleteError) {
        console.error('Error deleting saved session:', deleteError)
        return
      }

      // Remove from local state
      setSavedSessions(prev => prev.filter(s => s.id !== session.id))

      // Resume the session
      onResumeSession(session.session_state)
    } catch (error) {
      console.error('Error resuming session:', error)
    }
  }

  const handleDeleteSession = (session: SavedSession) => {
    setSessionToDelete(session)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return

    try {
      setDeletingId(sessionToDelete.id)
      
      const { error } = await supabase
        .from('saved_practice_sessions')
        .delete()
        .eq('id', sessionToDelete.id)

      if (error) {
        console.error('Error deleting saved session:', error)
        return
      }

      // Remove from local state
      setSavedSessions(prev => prev.filter(s => s.id !== sessionToDelete.id))
      
      // Close modal and reset state
      setShowDeleteModal(false)
      setSessionToDelete(null)
    } catch (error) {
      console.error('Error deleting saved session:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setSessionToDelete(null)
  }

  const getProgressSummary = (sessionState: any) => {
    if (!sessionState || !sessionState.questionStatuses) return { answered: 0, total: 0 }
    
    // Parse the questionStatuses object to get the true count
    const questionStatuses = sessionState.questionStatuses
    const total = Object.keys(questionStatuses).length
    const answered = Object.values(questionStatuses).filter((status: any) => status === 'answered').length
    
    return { answered, total }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (savedSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClockIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No Saved Sessions
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Your saved practice sessions will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-6">
        <AnimatePresence>
          {savedSessions.map((session) => {
          const progress = getProgressSummary(session.session_state)
          const isDeleting = deletingId === session.id
          
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 basis-1/4 min-w-[300px] max-w-[400px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all duration-200"
            >
              {/* Compact Header Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {session.session_name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Saved {formatDate(session.updated_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSession(session)}
                  disabled={isDeleting}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 ml-2"
                >
                  {isDeleting ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <TrashIcon className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Compact Progress Info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {progress.answered}/{progress.total} answered
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {formatTimeHumanReadable(session.session_state?.mainTimerValue || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compact Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-3">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress.total > 0 ? (progress.answered / progress.total) * 100 : 0}%` }}
                />
              </div>

              {/* Compact Resume Button */}
              <motion.button
                onClick={() => handleResumeSession(session)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlayIcon className="w-3.5 h-3.5" />
                <span>Resume Session</span>
              </motion.button>
            </motion.div>
          )
        })}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteSessionModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        sessionName={sessionToDelete?.session_name || ''}
        isDeleting={deletingId !== null}
      />
    </div>
  )
}
