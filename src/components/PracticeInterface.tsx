'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Database } from '@/types/database'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast-context'
// Removed TimerDisplay - now using QuestionDisplayWindow
import QuestionPalette from './QuestionPalette'
import PremiumStatusPanel from './PremiumStatusPanel'
import QuestionDisplayWindow from './QuestionDisplayWindow'
// Removed old ActionBar and ProgressBar - now using QuestionDisplayWindow
import EndSessionModal from './EndSessionModal'
import ReportErrorModal from './ReportErrorModal'
import ExitSessionModal from './ExitSessionModal'
// Removed ZenModeBackButton - now using QuestionDisplayWindow back button
import PauseOverlay from './PauseOverlay'
import PauseModal from './PauseModal'
import SubmissionConfirmationModal from './SubmissionConfirmationModal'
import AutoSubmissionOverlay from './AutoSubmissionOverlay'
import KatexRenderer from './ui/KatexRenderer'
import { FlagIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline'

type Question = Database['public']['Tables']['questions']['Row']

export type QuestionStatus = 'not_visited' | 'unanswered' | 'answered' | 'marked_for_review'

export type SessionState = {
  status: QuestionStatus
  user_answer: string | null
  is_bookmarked: boolean
}

interface PracticeInterfaceProps {
  questions: Question[]
  testMode?: 'practice' | 'timed'
  timeLimitInMinutes?: number
  mockTestData?: {
    test: {
      id: number
      name: string
      total_time_minutes: number
      marks_per_correct: number
      marks_per_incorrect: number
    }
  }
  savedSessionState?: any
  source?: string | null
}

export default function PracticeInterface({ questions, testMode = 'practice', timeLimitInMinutes, mockTestData, savedSessionState, source }: PracticeInterfaceProps) {
  const { user, session } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if this is a fresh start
  const isFreshStart = searchParams.get('fresh') === 'true'
  
  // DEBUG: Log timer props for analysis
  console.log('TIMER PROPS:', { testMode, timeLimitInMinutes });
  
  // Extract stable primitive values from auth context to prevent unnecessary effect re-runs
  const userId = user?.id
  const sessionToken = session?.access_token
  
  // Generate unique session key based on question set for sessionStorage
  const sessionKey = useRef(`practice_session_${questions.map(q => q.id).join('_')}`).current
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStates, setSessionStates] = useState<SessionState[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEndSessionModal, setShowEndSessionModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [showAutoSubmissionOverlay, setShowAutoSubmissionOverlay] = useState(false)
  const [isSessionPaused, setIsSessionPaused] = useState(false)
  
  // Centralized Timer Architecture - Your Method Implementation
  const [displayTime, setDisplayTime] = useState(0); // State for triggering re-renders of timer display
  // Memoize questionIds for stable dependency in bookmark checks
  const questionIds = useMemo(() => questions.map(q => q.question_id), [questions]);
  
  // Timer pause state management
  const [isPaused, setIsPaused] = useState(false);
  const [timeWhenPaused, setTimeWhenPaused] = useState(0);
  
  // Pause functionality
  const handlePauseSession = () => {
    setIsSessionPaused(true);
    setShowPauseModal(true);
    // The existing pause logic will handle timer pausing
  };

  const handleResumeSession = () => {
    setIsSessionPaused(false);
    setShowPauseModal(false);
    // The existing resume logic will handle timer resuming
  };

  const handlePauseExit = () => {
    setShowPauseModal(false);
    setIsSessionPaused(false); // Remove the pause overlay
    setShowExitModal(true);
  };
  
  // Refs for synchronous state management (prevents race conditions)
  const cumulativeTimeRef = useRef<Record<string, number>>({}); // Stores cumulative time per question ID
  const currentQuestionStartRef = useRef<number>(Date.now()); // Start time of current viewing session
  const activeQuestionIdRef = useRef<string>(questions[0]?.id?.toString() || ''); // Current question ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now()); // Ref to store current session start time for immediate access
  const persistenceTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for auto-save
  const bookmarkInProgressRef = useRef(false); // Prevent concurrent bookmark requests (race condition fix)

  // Save time for current question (synchronous)
  const saveCurrentQuestionTime = useCallback(() => {
    const currentTime = Date.now();
    const timeSpentThisSession = currentTime - currentQuestionStartRef.current;
    const questionId = activeQuestionIdRef.current;
    
    // Add to cumulative time
    const previousTime = cumulativeTimeRef.current[questionId] || 0;
    cumulativeTimeRef.current[questionId] = previousTime + timeSpentThisSession;
    
    // CRITICAL FIX: Reset the start time ref so the next save only adds NEW time
    // Without this, the same time period gets added multiple times, causing accelerated timer
    currentQuestionStartRef.current = currentTime;
    
  }, []);
  
  // ===== CRITICAL FIX: State Persistence Functions =====
  // These functions save and restore ALL session state to sessionStorage
  // This prevents state loss on tab switches, re-mounts, or page refreshes
  
  const saveStateToSessionStorage = useCallback(() => {
    if (typeof window === 'undefined' || !isInitialized) return;
    
    try {
      // Save current question time before persisting
      saveCurrentQuestionTime();
      
      const persistedState = {
        currentIndex,
        sessionStates,
        sessionStartTime: sessionStartTimeRef.current,
        cumulativeTime: cumulativeTimeRef.current,
        activeQuestionId: activeQuestionIdRef.current,
        currentQuestionStartTime: currentQuestionStartRef.current,
        timestamp: Date.now(),
        testMode,
        timeLimitInMinutes,
      };
      
      sessionStorage.setItem(sessionKey, JSON.stringify(persistedState));
      console.log('💾 State persisted to sessionStorage');
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }, [currentIndex, sessionStates, isInitialized, sessionKey, saveCurrentQuestionTime, testMode, timeLimitInMinutes]);
  
  const restoreStateFromSessionStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = sessionStorage.getItem(sessionKey);
      if (!stored) return null;
      
      const persistedState = JSON.parse(stored);
      console.log('🔄 Restoring state from sessionStorage:', persistedState);
      
      return persistedState;
    } catch (error) {
      console.error('Failed to restore state:', error);
      return null;
    }
  }, [sessionKey]);
  
  const clearSessionStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(sessionKey);
      console.log('🗑️ Session storage cleared');
    } catch (error) {
      console.error('Failed to clear session storage:', error);
    }
  }, [sessionKey]);
  
  // Timer interval with pause/resume functionality
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (!showExitModal && !isPaused && !isSessionPaused) {
      // RESUMING - Start the interval for updating display
      timerId = setInterval(() => {
        const currentTime = Date.now();
        const timeSpentThisSession = currentTime - currentQuestionStartRef.current;
        const questionId = activeQuestionIdRef.current;
        const previousTime = cumulativeTimeRef.current[questionId] || 0;
        const totalTime = previousTime + timeSpentThisSession;
        
        setDisplayTime(totalTime);
      }, 100); // Update every 100ms for smooth display
      
      intervalRef.current = timerId;
    } else {
      // PAUSING - Clear the interval to freeze timers
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
      // Note: We don't save time here as it's handled by the pause/resume logic
    };
  }, [showExitModal, isPaused, isSessionPaused, saveCurrentQuestionTime]); // Depend on modal state

  // Handle timer pause/resume for both main session and per-question timers
  useEffect(() => {
    if ((showExitModal || isSessionPaused) && !isPaused) {
      // PAUSING - Record when we paused and save current question time
      setTimeWhenPaused(Date.now());
      setIsPaused(true);
      
      // Save the current question time before pausing
      saveCurrentQuestionTime();
    } else if (!showExitModal && !isSessionPaused && isPaused) {
      // RESUMING - Adjust main session timer and reset per-question timer
      const pausedDuration = Date.now() - timeWhenPaused;
      
      // Adjust main session timer - update ref immediately to prevent glitch
      const newStartTime = sessionStartTimeRef.current + pausedDuration;
      sessionStartTimeRef.current = newStartTime;
      setSessionStartTime(newStartTime);
      
      // CRITICAL FIX: Reset per-question timer start time to current time
      // The cumulative time is already saved, so we just need to reset the current session
      currentQuestionStartRef.current = Date.now();
      
      // Update display with the saved cumulative time for current question
      const questionId = activeQuestionIdRef.current;
      const savedTime = cumulativeTimeRef.current[questionId] || 0;
      setDisplayTime(savedTime);
      
      setIsPaused(false);
    }
  }, [showExitModal, isSessionPaused, isPaused, timeWhenPaused, saveCurrentQuestionTime]);

  // Initialize session states - ENHANCED WITH SESSIONSTORAGE PERSISTENCE
  useEffect(() => {
    if (questions.length > 0) {
      let restored = false;

      // ONLY attempt to restore if this is NOT a fresh start
      if (!isFreshStart) {
        // STEP 1: Check sessionStorage first (highest priority - survives re-mounts)
        const persistedState = restoreStateFromSessionStorage();
        
        if (persistedState) {
          // RESTORE FROM SESSIONSTORAGE - This handles tab switches and re-mounts
          console.log('%c RESTORATION: Applying state from sessionStorage.', 'color: green; font-weight: bold;');
          
          setSessionStates(persistedState.sessionStates);
          setCurrentIndex(persistedState.currentIndex);
          
          // Restore timer state with adjusted start time
          const elapsedTime = Date.now() - persistedState.timestamp;
          const restoredStartTime = persistedState.sessionStartTime + elapsedTime;
          setSessionStartTime(restoredStartTime);
          sessionStartTimeRef.current = restoredStartTime;
          
          // Restore per-question timing data
          cumulativeTimeRef.current = persistedState.cumulativeTime;
          activeQuestionIdRef.current = persistedState.activeQuestionId;
          currentQuestionStartRef.current = Date.now();
          
          // Set initial display time
          const initialTime = cumulativeTimeRef.current[persistedState.activeQuestionId] || 0;
          setDisplayTime(initialTime);
          
          // CRITICAL: Clear the session data after restoring to prevent re-loading on refresh
          clearSessionStorage();
          restored = true;
          
          // STEP 2: Restore from saved session (database restore)
          console.log('%c RESTORATION: Applying state from database-saved session.', 'color: blue; font-weight: bold;');
          
          const restoredStates: SessionState[] = questions.map((q, index) => {
            const questionId = q.id
            return {
              status: (savedSessionState?.questionStatuses?.[questionId] as QuestionStatus) || 'not_visited',
              user_answer: savedSessionState?.userAnswers?.[questionId] || null,
              is_bookmarked: savedSessionState?.bookmarkedQuestions?.[questionId] || false
            }
          })
          
          // RE-HYDRATE ALL STATE FROM SAVED SESSION
          setSessionStates(restoredStates)
          setCurrentIndex(savedSessionState?.currentIndex || 0)
          
          // --- The Core Fix: Main Session Timer State Persistence ---
          // Instead of using the old startTime, we calculate a NEW adjusted startTime.
          // This implements the "Adjusted Start Time" trick to pause/resume the main timer.
          const savedMainTimerValue = savedSessionState?.mainTimerValue || 0; // This is in seconds
          const savedMainTimerValueMs = savedMainTimerValue * 1000; // Convert to milliseconds
          const databaseAdjustedStartTime = Date.now() - savedMainTimerValueMs;
          
          // Use this new adjusted start time to initialize the session
          // The timer component will now calculate: Date.now() - databaseAdjustedStartTime = savedMainTimerValueMs
          // This effectively "pauses" and "resumes" the timer across sessions
          setSessionStartTime(databaseAdjustedStartTime);
          sessionStartTimeRef.current = databaseAdjustedStartTime; // Keep ref in sync
          
          // Restore per-question timing data into ref
          if (savedSessionState?.timePerQuestion) {
            const restoredTimePerQuestion: Record<string, number> = {}
            Object.entries(savedSessionState.timePerQuestion).forEach(([questionId, timeInSeconds]) => {
              restoredTimePerQuestion[questionId] = (timeInSeconds as number) * 1000 // Convert back to milliseconds
            })
            cumulativeTimeRef.current = restoredTimePerQuestion
          }
          
          // Set initial active question ID and start time
          if (questions.length > 0) {
            const initialQuestionId = questions[savedSessionState?.currentIndex || 0].id.toString()
            activeQuestionIdRef.current = initialQuestionId
            currentQuestionStartRef.current = Date.now()
            
            // Set initial display time
            const initialTime = cumulativeTimeRef.current[initialQuestionId] || 0
            setDisplayTime(initialTime)
          }
          
          setIsInitialized(true)
          restored = true;
        }
      }

      // If no state was restored (either because it's a fresh start or nothing was found)
      if (!restored) {
        console.log('%c INITIALIZATION: Starting a completely new session.', 'color: orange; font-weight: bold;');
        
        // First, initialize with default bookmark state (false)
        const initialStates: SessionState[] = questions.map(() => ({
          status: 'not_visited',
          user_answer: null,
          is_bookmarked: false
        }))
        setSessionStates(initialStates)
        const initialStartTime = Date.now();
        setSessionStartTime(initialStartTime);
        sessionStartTimeRef.current = initialStartTime; // Keep ref in sync
        
        // Set initial active question ID and start time for new session
        if (questions.length > 0) {
          const initialQuestionId = questions[0].id.toString()
          activeQuestionIdRef.current = initialQuestionId
          currentQuestionStartRef.current = Date.now()
          setDisplayTime(0) // Start from 0 for new session
        }
        
        setIsInitialized(true)
      }
    }
  }, [questions, savedSessionState, isFreshStart, restoreStateFromSessionStorage])

// Effect: Fetch bookmark statuses ONCE on initialization
// FIX: This should only run once when initialized, not on every session change
// Using a ref to track if we've already fetched bookmarks for this session
const bookmarksFetchedRef = useRef(false);
 
useEffect(() => {
  // Only run once when initialized and user is available
  if (!isInitialized || !userId || bookmarksFetchedRef.current) return;

  const controller = new AbortController();

  const run = async () => {
    try {
      const response = await fetch('/api/practice/check-bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({ questionIds }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Bookmark check failed:', data);
        return;
      }

      if (controller.signal.aborted) return;

      if (data.bookmarks) {
        setSessionStates(prevStates =>
          prevStates.map((state, index) => ({
            ...state,
            is_bookmarked: !!data.bookmarks[String(questions[index].question_id)],
          }))
        );
        // Mark as fetched to prevent re-running
        bookmarksFetchedRef.current = true;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Error checking bookmarks:', err);
    }
  };

  run();

  return () => controller.abort();
}, [isInitialized, userId, sessionToken, questionIds, questions])


  // ===== AUTO-SAVE EFFECT: Persist state on every change =====
  useEffect(() => {
    if (!isInitialized) return;
    
    // Save state on every state change
    saveStateToSessionStorage();
    
    // Also set up periodic auto-save (every 2 seconds as a safety net)
    if (persistenceTimerRef.current) {
      clearInterval(persistenceTimerRef.current);
    }
    
    persistenceTimerRef.current = setInterval(() => {
      saveStateToSessionStorage();
    }, 2000);
    
    return () => {
      if (persistenceTimerRef.current) {
        clearInterval(persistenceTimerRef.current);
        persistenceTimerRef.current = null;
      }
    };
  }, [currentIndex, sessionStates, isInitialized, saveStateToSessionStorage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Alt + S: Save and Next
      if (event.altKey && event.key === 's') {
        event.preventDefault()
        handleSaveAndNext()
      }
      // Alt + M: Mark for Review and Next
      else if (event.altKey && event.key === 'm') {
        event.preventDefault()
        handleMarkForReviewAndNext()
      }
      // Alt + C: Clear Response
      else if (event.altKey && event.key === 'c') {
        event.preventDefault()
        handleClearResponse()
      }
      // Alt + B: Bookmark
      else if (event.altKey && event.key === 'b') {
        event.preventDefault()
        handleBookmark()
      }
      // Alt + R: Report Error
      else if (event.altKey && event.key === 'r') {
        event.preventDefault()
        setShowReportModal(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const updateSessionState = useCallback((index: number, updates: Partial<SessionState>) => {
    setSessionStates(prev => {
      const newStates = [...prev]
      newStates[index] = { ...newStates[index], ...updates }
      return newStates
    })
  }, [])

  // Handle question navigation
  const handleNavigation = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= questions.length || newIndex === currentIndex) return;
    
    // Mark as visited (unanswered) if not visited yet
    const currentState = sessionStates[currentIndex]
    if (currentState && currentState.status === 'not_visited') {
      updateSessionState(currentIndex, {
        status: 'unanswered'
      })
    }
    
    // Save time for current question before switching
    saveCurrentQuestionTime();
    
    // Update to new question
    const newQuestionId = questions[newIndex].id.toString();
    setCurrentIndex(newIndex);
    activeQuestionIdRef.current = newQuestionId;
    const newStartTime = Date.now();
    currentQuestionStartRef.current = newStartTime;
    
    // Update display with previously saved time for this question
    const previousTime = cumulativeTimeRef.current[newQuestionId] || 0;
    setDisplayTime(previousTime);
    
  }, [currentIndex, questions, saveCurrentQuestionTime, sessionStates, updateSessionState]);
  const currentState = sessionStates[currentIndex] || {
    status: 'not_visited' as QuestionStatus,
    user_answer: null,
    is_bookmarked: false
  }

  // Mark current question as visited when it's first accessed
  useEffect(() => {
    if (isInitialized && sessionStates.length > 0) {
      const currentState = sessionStates[currentIndex]
      if (currentState && currentState.status === 'not_visited') {
        updateSessionState(currentIndex, {
          status: 'unanswered'
        })
      }
    }
  }, [currentIndex, isInitialized, sessionStates, updateSessionState])

  // Debug logging (development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('PracticeInterface render:', {
      questionsLength: questions.length,
      sessionStatesLength: sessionStates.length,
      currentIndex,
      isInitialized,
      currentState
    })
  }


  const handleAnswerChange = (answer: string) => {
    // Only update the user_answer, don't change status until Save & Next is pressed
    // Status should remain as 'unanswered' or 'marked_for_review' until explicitly saved
    updateSessionState(currentIndex, {
      user_answer: answer
      // Don't update status here - it will be updated in handleSaveAndNext
    })
  }

  const handleSaveAndNext = () => {
    // Determine status based on current state and user answer
    let newStatus: QuestionStatus
    if (currentState.status === 'marked_for_review') {
      // If marked for review and has answer, keep as marked_for_review
      // If marked for review and no answer, change to unanswered
      newStatus = currentState.user_answer ? 'marked_for_review' : 'unanswered'
    } else {
      // Regular save logic: answered if has answer, unanswered if no answer
      newStatus = currentState.user_answer ? 'answered' : 'unanswered'
    }
    
    updateSessionState(currentIndex, {
      status: newStatus
    })

    // Move to next question or show end-of-session modal
    if (currentIndex < questions.length - 1) {
      handleNavigation(currentIndex + 1)
    } else {
      // End of session - show modal
      setShowEndSessionModal(true)
    }
  }

  const handleMarkForReviewAndNext = () => {
    updateSessionState(currentIndex, {
      status: 'marked_for_review'
      // Keep existing user_answer - don't change it
    })

    // Move to next question or show end-of-session modal
    if (currentIndex < questions.length - 1) {
      handleNavigation(currentIndex + 1)
    } else {
      // End of session - show modal
      setShowEndSessionModal(true)
    }
  }

  const handleClearResponse = () => {
    // Clear the answer but don't change status yet
    // Status will be determined when user clicks Save & Next or Mark for Review & Next
    updateSessionState(currentIndex, {
      user_answer: null
      // Keep existing status - will be updated on next action
    })
  }

  const handleReturnToStart = () => {
    handleNavigation(0)
    setShowEndSessionModal(false)
  }

  const handleStayHere = () => {
    setShowEndSessionModal(false)
  }

  const handleExitWithoutSaving = () => {
    setShowExitModal(false)
    router.push('/dashboard')
  }

  const handleSaveAndExit = async (sessionName: string) => {
    try {
      if (!userId) return

      // Create comprehensive session state object with complete state serialization
      const sessionState = {
        // Core session configuration
        sessionConfig: {
          testMode,
          timeLimitInMinutes,
          questionOrder: 'sequential' // Default for now
        },
        
        // Question set and current position
        questionSet: questions.map(q => q.id),
        currentIndex,
        
        // Timer data
        sessionStartTime: effectiveSessionStartTime,
        mainTimerValue: Math.floor((Date.now() - effectiveSessionStartTime) / 1000), // Save in seconds for database efficiency
        
        // User progress data - capture ALL live state
        userAnswers: questions.reduce((acc, q, index) => {
          const state = sessionStates[index]
          if (state?.user_answer) {
            acc[q.id] = state.user_answer
          }
          return acc
        }, {} as Record<string, string>),
        
        questionStatuses: questions.reduce((acc, q, index) => {
          const state = sessionStates[index]
          acc[q.id] = state?.status || 'not_visited'
          return acc
        }, {} as Record<string, string>),
        
        timePerQuestion: questions.reduce((acc, q, index) => {
          const questionTime = cumulativeTimeRef.current[q.id.toString()] || 0
          if (questionTime > 0) {
            acc[q.id] = Math.floor(questionTime / 1000) // Convert to seconds
          }
          return acc
        }, {} as Record<string, number>),
        
        bookmarkedQuestions: questions.reduce((acc, q, index) => {
          const state = sessionStates[index]
          if (state?.is_bookmarked) {
            acc[q.id] = true
          }
          return acc
        }, {} as Record<string, boolean>),
        
        // Mock test data if applicable
        mockTestData,
        
        // Full question data for restoration
        questions: questions.map((q, index) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          correct_option: q.correct_option,
          solution_text: q.solution_text,
          difficulty: q.difficulty,
          chapter_name: q.chapter_name,
          book_source: q.book_source
        }))
      }

      console.log('Saving comprehensive session state:', sessionState)

      // Save to database
      const response = await fetch('/api/saved-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sessionName,
          sessionState
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save session')
      }

      // Close modal and redirect
      setShowExitModal(false)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving session:', error)
      showToast({ type: 'error', title: 'Failed to save session', message: 'Please try again.' })
    }
  }

  const getCurrentProgress = () => {
    const answered = sessionStates.filter(state => state.user_answer !== null).length
    const total = questions.length
    const timeSpent = Math.floor((Date.now() - effectiveSessionStartTime) / 1000)
    const minutes = Math.floor(timeSpent / 60)
    const seconds = timeSpent % 60
    return {
      answered,
      total,
      timeSpent: `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  const getStatusCounts = () => {
    const answeredCount = sessionStates.filter(s => s.status === 'answered').length
    const notAnsweredCount = sessionStates.filter(s => s.status === 'unanswered').length
    const notVisitedCount = sessionStates.filter(s => s.status === 'not_visited').length
    const markedCount = sessionStates.filter(s => s.status === 'marked_for_review').length
    const markedAndAnsweredCount = sessionStates.filter(s => s.status === 'marked_for_review' && s.user_answer).length
    const bookmarkedCount = sessionStates.filter(s => s.is_bookmarked).length

    return {
      answeredCount,
      notAnsweredCount,
      notVisitedCount,
      markedCount,
      markedAndAnsweredCount,
      bookmarkedCount
    }
  }

  // Bookmarking removed from practice interface - now only available in solution review
  // This enforces deliberate bookmarking after reviewing solutions
  const handleBookmark = async () => {
    showToast({
      type: 'info',
      title: 'Bookmark in Solution Review',
      message: 'You can bookmark questions after reviewing solutions. Complete this session to access the solution review.',
      duration: 4000,
    });
  }

  const handleSubmitTest = async () => {
    if (isSubmitting) return

    // Show confirmation modal for manual submission
    setShowSubmissionModal(true)
  }

  const handleConfirmSubmission = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setShowSubmissionModal(false)

    try {
      // Save current question time first
      saveCurrentQuestionTime();
      
      // Get final time data
      const finalTimeData = { ...cumulativeTimeRef.current };

      // Calculate final results based on the Ultimate Rule:
      // Only count GREEN (answered) and PURPLE WITH GREEN TICK (answered and marked for review) questions
      const totalQuestions = questions.length
      
      // Questions that WILL BE COUNTED for evaluation:
      // 1. GREEN (answered) - status === 'answered'
      // 2. PURPLE WITH GREEN TICK (answered and marked for review) - status === 'marked_for_review' AND has user_answer
      const evaluatedQuestions = sessionStates.filter((state, index) => {
        return (state.status === 'answered') || 
               (state.status === 'marked_for_review' && state.user_answer)
      })
      
      const correctAnswers = evaluatedQuestions.filter((state, index) => {
        const originalIndex = sessionStates.indexOf(state)
        const question = questions[originalIndex]
        return state.user_answer === question.correct_option
      }).length
      
      const incorrectAnswers = evaluatedQuestions.filter((state, index) => {
        const originalIndex = sessionStates.indexOf(state)
        const question = questions[originalIndex]
        return state.user_answer && state.user_answer !== question.correct_option
      }).length
      
      // Questions that WILL NOT BE COUNTED:
      // RED (unanswered), PURPLE (marked but not answered), GRAY (not visited)
      const skippedAnswers = totalQuestions - evaluatedQuestions.length

      // Calculate score based on mock test rules or default percentage
      let score: number
      if (mockTestData) {
        // Mock test scoring: use actual marks
        const totalMarks = (correctAnswers * mockTestData.test.marks_per_correct) + 
                          (incorrectAnswers * mockTestData.test.marks_per_incorrect)
        const maxMarks = totalQuestions * mockTestData.test.marks_per_correct
        score = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0
      } else {
        // Regular practice scoring: percentage based
        score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
      }
      
      const totalTime = Math.round((Date.now() - effectiveSessionStartTime) / 1000) // Convert to seconds

      console.log('Submitting practice session:', {
        user_id: userId,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        skipped_answers: skippedAnswers,
        score
      })

      // Save test result
      const response = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          questions: questions.map((question, index) => ({
            question_id: question.id, // Use numeric ID from questions table
            user_answer: sessionStates[index].user_answer,
            status: sessionStates[index].user_answer ? 
              (sessionStates[index].user_answer === question.correct_option ? 'correct' : 'incorrect') : 
              'skipped',
            time_taken: Math.round((cumulativeTimeRef.current[question.id.toString()] || 0) / 1000) // Use new per-question timing data
          })),
          score,
          total_time: totalTime,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          incorrect_answers: incorrectAnswers,
          skipped_answers: skippedAnswers,
          // Mock test specific fields
          session_type: mockTestData ? 'mock_test' : 'practice',
          mock_test_id: mockTestData ? mockTestData.test.id : null
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Test submitted successfully:', result)
        // Clear sessionStorage since session is complete
        clearSessionStorage()
        // Redirect to analysis report with source parameter if from revision
        let redirectUrl = `/analysis/${result.test_id}`
        if (source === 'revision') {
          redirectUrl += `?source=revision`
        }
        router.push(redirectUrl)
      } else {
        const errorData = await response.json()
        console.error('Test submission failed:', errorData)
        throw new Error(errorData.error || 'Failed to submit test')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      setIsSubmitting(false)
      setShowAutoSubmissionOverlay(false)
    }
  }

  const handleAutoSubmission = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setShowAutoSubmissionOverlay(true)

    try {
      // Save current question time first
      saveCurrentQuestionTime();
      
      // Get final time data
      const finalTimeData = { ...cumulativeTimeRef.current };

      // Calculate final results based on the Ultimate Rule:
      // Only count GREEN (answered) and PURPLE WITH GREEN TICK (answered and marked for review) questions
      const totalQuestions = questions.length
      
      // Questions that WILL BE COUNTED for evaluation:
      // 1. GREEN (answered) - status === 'answered'
      // 2. PURPLE WITH GREEN TICK (answered and marked for review) - status === 'marked_for_review' AND has user_answer
      const evaluatedQuestions = sessionStates.filter((state, index) => {
        return (state.status === 'answered') || 
               (state.status === 'marked_for_review' && state.user_answer)
      })
      
      const correctAnswers = evaluatedQuestions.filter((state, index) => {
        const originalIndex = sessionStates.indexOf(state)
        const question = questions[originalIndex]
        return state.user_answer === question.correct_option
      }).length
      
      const incorrectAnswers = evaluatedQuestions.filter((state, index) => {
        const originalIndex = sessionStates.indexOf(state)
        const question = questions[originalIndex]
        return state.user_answer && state.user_answer !== question.correct_option
      }).length
      
      // Questions that WILL NOT BE COUNTED:
      // RED (unanswered), PURPLE (marked but not answered), GRAY (not visited)
      const skippedAnswers = totalQuestions - evaluatedQuestions.length

      // Calculate score based on mock test rules or default percentage
      let score: number
      if (mockTestData) {
        // Mock test scoring: use actual marks
        const totalMarks = (correctAnswers * mockTestData.test.marks_per_correct) + 
                          (incorrectAnswers * mockTestData.test.marks_per_incorrect)
        const maxMarks = totalQuestions * mockTestData.test.marks_per_correct
        score = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0
      } else {
        // Regular practice scoring: percentage based
        score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
      }
      
      const totalTime = Math.round((Date.now() - effectiveSessionStartTime) / 1000) // Convert to seconds

      console.log('Submitting practice session:', {
        user_id: userId,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        skipped_answers: skippedAnswers,
        score
      })

      // Save test result
      const response = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          questions: questions.map((question, index) => ({
            question_id: question.id, // Use numeric ID from questions table
            user_answer: sessionStates[index].user_answer,
            status: sessionStates[index].user_answer ? 
              (sessionStates[index].user_answer === question.correct_option ? 'correct' : 'incorrect') : 
              'skipped',
            time_taken: Math.round((cumulativeTimeRef.current[question.id.toString()] || 0) / 1000) // Use new per-question timing data
          })),
          score,
          total_time: totalTime,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          incorrect_answers: incorrectAnswers,
          skipped_answers: skippedAnswers,
          // Mock test specific fields
          session_type: mockTestData ? 'mock_test' : 'practice',
          mock_test_id: mockTestData ? mockTestData.test.id : null
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Test submitted successfully:', result)
        // Clear sessionStorage since session is complete
        clearSessionStorage()
        // Redirect to analysis report with source parameter if from revision
        let redirectUrl = `/analysis/${result.test_id}`
        if (source === 'revision') {
          redirectUrl += `?source=revision`
        }
        router.push(redirectUrl)
      } else {
        const errorData = await response.json()
        console.error('Test submission failed:', errorData)
        throw new Error(errorData.error || 'Failed to submit test')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      setIsSubmitting(false)
    }
  }

  const handleQuestionNavigation = (index: number) => {
    // CRITICAL: Discard temporary selections when navigating away without saving
    // This only applies to direct navigation (clicking question numbers), NOT Save & Next or Mark for Review & Next
    const currentState = sessionStates[currentIndex]
    if (currentState) {
      // If question has a temporary answer but hasn't been saved, discard it
      if (currentState.user_answer && currentState.status !== 'answered' && currentState.status !== 'marked_for_review') {
        updateSessionState(currentIndex, {
          user_answer: null,
          status: currentState.status === 'not_visited' ? 'unanswered' : currentState.status
        })
      } else if (currentState.status === 'not_visited') {
        // Mark as visited (unanswered) if not visited yet
        updateSessionState(currentIndex, {
          status: 'unanswered'
        })
      }
    }
    
    handleNavigation(index)
    setShowMobileSidebar(false) // Close mobile sidebar
  }

  // Calculate display time for current question - this runs on every tick
  const currentQuestion = questions[currentIndex];

  // Compute the effective session start time - use ref for immediate updates during pause/resume
  const effectiveSessionStartTime = sessionStartTimeRef.current;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading question...</p>
        </div>
      </div>
    )
  }

  if (!isInitialized || sessionStates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Initializing practice session...</p>
        </div>
      </div>
    )
  }

  // Calculate answered questions for progress bar
  const answeredQuestions = sessionStates.filter(state => state.user_answer !== null).length

  // Display time is now managed by the centralized timer interval
  // No need to calculate here - it's updated every 100ms by the interval

  return (
    <div className="practice-page-wrapper">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-12 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {mockTestData ? mockTestData.test.name : 'Practice Session'} - Question {currentIndex + 1} of {questions.length}
              </div>
              {/* Timer removed - now handled by QuestionDisplayWindow */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`question-window-container ${isRightPanelCollapsed ? 'lg:w-full' : 'lg:w-3/4'}`}>
        <QuestionDisplayWindow
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          userAnswer={currentState.user_answer}
          isBookmarked={currentState.is_bookmarked}
          onAnswerChange={handleAnswerChange}
          onBookmark={handleBookmark}
          onReportError={() => setShowReportModal(true)}
          onExit={() => setShowExitModal(true)}
          sessionStartTime={effectiveSessionStartTime}
          timeLimitInMinutes={testMode === 'timed' ? timeLimitInMinutes : undefined}
          testMode={testMode}
          currentQuestionStartTime={currentQuestionStartRef.current}
          cumulativeTime={displayTime}
          isPaused={isPaused}
          showBookmark={false} // Disable bookmarking in practice interface
          onTogglePause={handlePauseSession}
          // CRITICAL: Pass the real button handlers from PracticeInterface
          onSaveAndNext={handleSaveAndNext}
          onMarkForReviewAndNext={handleMarkForReviewAndNext}
        />
      </div>

      {/* Desktop Right Panel - Status Panel */}
      <div className="status-panel-container">
        <PremiumStatusPanel
          questions={questions}
          sessionStates={sessionStates}
          currentIndex={currentIndex}
          onQuestionSelect={handleQuestionNavigation}
          onSubmitTest={handleSubmitTest}
          isSubmitting={isSubmitting}
          mockTestData={mockTestData}
          timePerQuestion={cumulativeTimeRef.current}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setShowMobileSidebar(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-80 h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Header with Timer */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Question Navigation</h3>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  {/* Timers removed - now handled by QuestionDisplayWindow */}
                </div>
              </div>
              
              {/* Mobile Question Palette - Full Height with Proper Flex Layout */}
              <div className="flex-1 p-6 flex flex-col min-h-0">
                <QuestionPalette
                  questions={questions}
                  sessionStates={sessionStates}
                  currentIndex={currentIndex}
                  onQuestionSelect={handleQuestionNavigation}
                  onSubmitTest={handleSubmitTest}
                  isSubmitting={isSubmitting}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Action Bar removed - now handled by QuestionDisplayWindow */}

      {/* End Session Modal */}
      <EndSessionModal
        isOpen={showEndSessionModal}
        onReturnToStart={handleReturnToStart}
        onStayHere={handleStayHere}
      />

      {/* Report Error Modal */}
      {showReportModal && (
        <ReportErrorModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          questionId={currentQuestion.id}
          questionText={currentQuestion.question_text}
        />
      )}

      {/* Back button removed - now handled by QuestionDisplayWindow */}

      {/* Exit Session Modal */}
      <ExitSessionModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onExitWithoutSaving={handleExitWithoutSaving}
        onSaveAndExit={handleSaveAndExit}
        currentProgress={getCurrentProgress()}
        statusCounts={getStatusCounts()}
      />

      {/* Pause Overlay */}
      <PauseOverlay isVisible={showPauseModal}>
        <PauseModal
          isOpen={showPauseModal}
          onResume={handleResumeSession}
          onExit={handlePauseExit}
        />
      </PauseOverlay>

      {/* Submission Confirmation Modal */}
      <SubmissionConfirmationModal
        isOpen={showSubmissionModal}
        onCancel={() => setShowSubmissionModal(false)}
        onSubmit={handleConfirmSubmission}
        timeRemaining={testMode === 'timed' && timeLimitInMinutes ? 
          `${Math.floor((timeLimitInMinutes * 60 - (Date.now() - effectiveSessionStartTime) / 1000) / 60)}m ${Math.floor(((timeLimitInMinutes * 60 - (Date.now() - effectiveSessionStartTime) / 1000) % 60))}s` : 
          undefined
        }
        statusCounts={getStatusCounts()}
        isSubmitting={isSubmitting}
      />

      {/* Auto Submission Overlay */}
      <AutoSubmissionOverlay isVisible={showAutoSubmissionOverlay} />

    </div>
  )
}
