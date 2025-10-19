import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTimerSystemProps {
  testMode: 'practice' | 'timed'
  timeLimitInMinutes?: number
  currentQuestionIndex: number
  totalQuestions: number
  onTimeUp?: () => void
  isSessionActive: boolean // Controls whether timers should run
  // Optional: Initial state for session restoration
  initialSessionElapsedMs?: number
  initialQuestionTimeMap?: Map<number, number>
}

interface TimerState {
  mainTimerDisplay: string
  inQuestionTime: number // milliseconds for current question
  isLowTime: boolean
  isPaused: boolean
}

export function useTimerSystem({
  testMode,
  timeLimitInMinutes,
  currentQuestionIndex,
  totalQuestions,
  onTimeUp,
  isSessionActive,
  initialSessionElapsedMs,
  initialQuestionTimeMap
}: UseTimerSystemProps) {
  // === STATE (minimal - only for display updates) ===
  const [mainTimerDisplay, setMainTimerDisplay] = useState<string>('00:00')
  const [inQuestionTime, setInQuestionTime] = useState<number>(0)
  const [isLowTime, setIsLowTime] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  // === REFS (for accurate time tracking without re-renders) ===
  const sessionStartTimeRef = useRef<number | null>(null)
  const pauseStartTimeRef = useRef<number | null>(null)
  const totalPausedTimeRef = useRef<number>(0)
  
  // Per-question time tracking
  const questionStartTimeRef = useRef<number | null>(null)
  const questionPausedTimeRef = useRef<number>(0)
  const questionTimeMapRef = useRef<Map<number, number>>(new Map())
  const previousQuestionIndexRef = useRef<number>(-1)
  
  // Animation frame and interval refs
  const animationFrameRef = useRef<number | null>(null)
  const displayUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Time up flag to prevent multiple calls
  const timeUpCalledRef = useRef<boolean>(false)

  // === UTILITY: Format time for display ===
  const formatTime = useCallback((milliseconds: number, isCountdown: boolean = false): string => {
    // For countdown, use ceiling so the first second shows the full duration
    // For count-up, use floor as normal
    const totalSeconds = isCountdown 
      ? Math.ceil(Math.abs(milliseconds) / 1000)
      : Math.floor(Math.abs(milliseconds) / 1000)
    
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [])

  // === UTILITY: Get current session elapsed time ===
  const getSessionElapsedTime = useCallback((): number => {
    if (!sessionStartTimeRef.current) return 0
    
    const now = Date.now()
    const elapsed = now - sessionStartTimeRef.current - totalPausedTimeRef.current
    
    // If paused, subtract the current pause duration
    if (isPaused && pauseStartTimeRef.current) {
      return elapsed - (now - pauseStartTimeRef.current)
    }
    
    return elapsed
  }, [isPaused])

  // === UTILITY: Get question elapsed time (with optional question index) ===
  const getQuestionElapsedTime = useCallback((questionIndex?: number): number => {
    if (!questionStartTimeRef.current) return 0
    
    // Use provided index or fall back to current question
    const targetIndex = questionIndex !== undefined ? questionIndex : currentQuestionIndex
    
    // If asking for a different question than what's currently active, return stored time
    if (targetIndex !== previousQuestionIndexRef.current) {
      return questionTimeMapRef.current.get(targetIndex) || 0
    }
    
    // Calculate time for the currently active question
    const now = Date.now()
    const baseTime = questionTimeMapRef.current.get(targetIndex) || 0
    const currentSessionTime = now - questionStartTimeRef.current - questionPausedTimeRef.current
    
    // If paused, subtract the current pause duration
    if (isPaused && pauseStartTimeRef.current) {
      return baseTime + currentSessionTime - (now - pauseStartTimeRef.current)
    }
    
    return baseTime + currentSessionTime
  }, [currentQuestionIndex, isPaused])

  // === FUNCTION: Update display values ===
  const updateDisplayValues = useCallback(() => {
    const sessionElapsed = getSessionElapsedTime()
    
    // Update main timer based on mode
    if (testMode === 'practice') {
      // Count up from 00:00
      setMainTimerDisplay(formatTime(sessionElapsed, false))
    } else if (testMode === 'timed' && timeLimitInMinutes) {
      // Count down from time limit
      const timeLimitMs = timeLimitInMinutes * 60 * 1000
      const remaining = timeLimitMs - sessionElapsed
      
      if (remaining <= 0 && !timeUpCalledRef.current) {
        // Time's up!
        setMainTimerDisplay('00:00')
        setIsLowTime(true)
        timeUpCalledRef.current = true
        
        // Stop all timers
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (displayUpdateIntervalRef.current) {
          clearInterval(displayUpdateIntervalRef.current)
        }
        
        // Trigger auto-submission
        if (onTimeUp) {
          onTimeUp()
        }
        return
      }
      
      // Use ceiling for countdown to show full duration at start
      setMainTimerDisplay(formatTime(remaining, true))
      
      // Check if low time (< 60 seconds) - use ceiling for consistency
      const remainingSeconds = Math.ceil(remaining / 1000)
      setIsLowTime(remainingSeconds < 60 && remainingSeconds >= 0)
    }
    
    // Update in-question timer
    const questionElapsed = getQuestionElapsedTime()
    setInQuestionTime(questionElapsed)
  }, [testMode, timeLimitInMinutes, formatTime, getSessionElapsedTime, getQuestionElapsedTime, onTimeUp])

  // === EFFECT: Initialize session timer ===
  useEffect(() => {
    if (!isSessionActive) return

    // Initialize session start time if not set
    if (!sessionStartTimeRef.current) {
      const now = Date.now()
      // If restoring a session, adjust start time to account for elapsed time
      if (initialSessionElapsedMs && initialSessionElapsedMs > 0) {
        sessionStartTimeRef.current = now - initialSessionElapsedMs
        console.log(`🔄 Session timer restored with ${Math.floor(initialSessionElapsedMs / 1000)}s elapsed`)
      } else {
        sessionStartTimeRef.current = now
        console.log('🕐 Session timer initialized')
      }
    }

    // Initialize question start time if not set
    if (!questionStartTimeRef.current) {
      questionStartTimeRef.current = Date.now()
      previousQuestionIndexRef.current = currentQuestionIndex
      
      // If restoring, load the question time map
      if (initialQuestionTimeMap && initialQuestionTimeMap.size > 0) {
        questionTimeMapRef.current = new Map(initialQuestionTimeMap)
        const currentQuestionTime = initialQuestionTimeMap.get(currentQuestionIndex) || 0
        setInQuestionTime(currentQuestionTime)
        console.log(`🔄 Question ${currentQuestionIndex + 1} timer restored with ${Math.floor(currentQuestionTime / 1000)}s accumulated`)
      } else {
        console.log(`🕐 Question ${currentQuestionIndex + 1} timer started`)
      }
    }

    // Start display update interval (updates every 100ms for smooth countdown)
    displayUpdateIntervalRef.current = setInterval(() => {
      if (!isPaused) {
        updateDisplayValues()
      }
    }, 100)

    return () => {
      if (displayUpdateIntervalRef.current) {
        clearInterval(displayUpdateIntervalRef.current)
      }
    }
  }, [isSessionActive, currentQuestionIndex, isPaused, updateDisplayValues])

  // === EFFECT: Handle question changes ===
  useEffect(() => {
    if (!isSessionActive || !questionStartTimeRef.current) return
    if (currentQuestionIndex === previousQuestionIndexRef.current) return

    // Save time for previous question BEFORE updating the ref
    const previousIndex = previousQuestionIndexRef.current
    if (previousIndex >= 0 && previousIndex < totalQuestions) {
      // Calculate final time for the previous question
      const now = Date.now()
      const baseTime = questionTimeMapRef.current.get(previousIndex) || 0
      const sessionTime = now - questionStartTimeRef.current - questionPausedTimeRef.current
      const finalTime = baseTime + sessionTime
      
      questionTimeMapRef.current.set(previousIndex, finalTime)
      console.log(`💾 Saved time for question ${previousIndex + 1}: ${Math.floor(finalTime / 1000)}s`)
    }

    // Start new question timer with fresh start time
    questionStartTimeRef.current = Date.now()
    questionPausedTimeRef.current = 0
    previousQuestionIndexRef.current = currentQuestionIndex
    
    // Load accumulated time for new question (if any)
    const accumulatedTime = questionTimeMapRef.current.get(currentQuestionIndex) || 0
    setInQuestionTime(accumulatedTime)
    
    console.log(`🕐 Question ${currentQuestionIndex + 1} timer started (accumulated: ${Math.floor(accumulatedTime / 1000)}s)`)
  }, [currentQuestionIndex, isSessionActive, totalQuestions])

  // === FUNCTION: Toggle pause/resume ===
  const togglePause = useCallback(() => {
    const now = Date.now()
    
    if (!isPaused) {
      // Pausing
      pauseStartTimeRef.current = now
      setIsPaused(true)
      console.log('⏸️ Session paused')
    } else {
      // Resuming
      if (pauseStartTimeRef.current) {
        const pauseDuration = now - pauseStartTimeRef.current
        totalPausedTimeRef.current += pauseDuration
        questionPausedTimeRef.current += pauseDuration
        console.log(`▶️ Session resumed (paused for ${Math.floor(pauseDuration / 1000)}s)`)
      }
      pauseStartTimeRef.current = null
      setIsPaused(false)
    }
  }, [isPaused])

  // === EFFECT: Update display when paused state changes ===
  useEffect(() => {
    if (isPaused) {
      // Update display one last time when paused
      updateDisplayValues()
    }
  }, [isPaused, updateDisplayValues])

  // === CLEANUP: Clear timers on unmount ===
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (displayUpdateIntervalRef.current) {
        clearInterval(displayUpdateIntervalRef.current)
      }
    }
  }, [])

  return {
    mainTimerDisplay,
    inQuestionTime,
    isLowTime,
    isPaused,
    togglePause,
    // Export time map for saving/restoring session
    getQuestionTimeMap: () => {
      // Save current question time before returning the map
      if (questionStartTimeRef.current && currentQuestionIndex >= 0) {
        const currentQuestionTime = getQuestionElapsedTime()
        questionTimeMapRef.current.set(currentQuestionIndex, currentQuestionTime)
      }
      return questionTimeMapRef.current
    },
    getTotalSessionTime: getSessionElapsedTime
  }
}

