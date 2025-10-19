'use client'

import { motion } from 'framer-motion'
import '@/styles/TimerTypography.css'

interface TimerDisplayProps {
  milliseconds?: number // For per-question timer - receives final calculated milliseconds
  startTime?: number // For main session timer
  mode?: 'stopwatch' | 'countdown'
  duration?: number // in minutes, required for countdown mode
  size?: 'small' | 'medium' | 'large' | 'ultra'
  onTimeUp?: () => void
  className?: string
  variant?: 'default' | 'premium' | 'ultra-premium'
  initialElapsedTime?: number // in milliseconds, for per-question timer
  isPaused?: boolean // Whether the timer should appear paused (stop animations)
  onPause?: () => void // Callback for pause button click
  showPauseButton?: boolean // Whether to show pause button
}

export default function TimerDisplay({ 
  milliseconds,
  startTime, 
  mode, 
  duration, 
  size = 'medium',
  onTimeUp,
  className = '',
  variant = 'default',
  initialElapsedTime = 0,
  isPaused = false,
  onPause,
  showPauseButton = false
}: TimerDisplayProps) {
  
  // If milliseconds prop is provided, this is a per-question timer - render directly
  if (milliseconds !== undefined) {
    return (
      <div className="premium-timer-container">
        <svg className="w-4 h-4 premium-timer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="premium-timer small primary">
          00:00
        </span>
      </div>
    );
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm'
      case 'large':
        return 'text-xl'
      case 'ultra':
        return 'text-2xl'
      default:
        return 'text-base'
    }
  }

  const getColorClasses = () => {
    return 'text-slate-700 dark:text-slate-300'
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'premium':
        return 'bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-shadow duration-300'
      case 'ultra-premium':
        return 'bg-white dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm'
      default:
        return ''
    }
  }

  const getPaddingClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5'
      case 'large':
        return 'px-6 py-3'
      case 'ultra':
        return 'px-8 py-4'
      default:
        return 'px-4 py-2'
    }
  }

  const getRoundedClasses = () => {
    switch (size) {
      case 'small':
        return 'rounded-lg'
      case 'large':
        return 'rounded-xl'
      case 'ultra':
        return 'rounded-2xl'
      default:
        return 'rounded-lg'
    }
  }

  if (variant === 'ultra-premium') {
    return (
      <motion.div
        className={`
          relative overflow-hidden
          ${getVariantClasses()}
          ${getPaddingClasses()}
          ${getRoundedClasses()}
          ${className}
        `}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Clean white background with subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-800/95 dark:to-slate-900/95 rounded-2xl" />
        
        {/* Timer content */}
        <div className="relative z-10 flex items-center space-x-3">
          {/* Premium clock icon */}
          <div className="flex items-center justify-center">
            <svg 
              className={`w-5 h-5 ${getColorClasses()}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          {/* Timer display with modern premium typography - static */}
          <div className={`premium-timer ${getSizeClasses()} ${getColorClasses()}`}>
            00:00
          </div>

          {/* Pause Button */}
          {showPauseButton && onPause && (
            <motion.button
              onClick={onPause}
              className="ml-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Pause Session"
            >
              <svg 
                className="w-4 h-4 text-slate-600 dark:text-slate-300" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            </motion.button>
          )}
        </div>
      </motion.div>
    )
  }

  if (variant === 'premium') {
    return (
      <motion.div
        className={`
          ${getVariantClasses()}
          ${getPaddingClasses()}
          ${getRoundedClasses()}
          ${className}
        `}
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center space-x-2">
          <svg 
            className={`w-4 h-4 ${getColorClasses()}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <div 
            className={`font-bold tracking-wide ${getSizeClasses()} ${getColorClasses()} relative`}
            style={{
              fontFamily: '"SF Pro Text", "SF Mono", "JetBrains Mono", "Fira Code", "Cascadia Code", "Roboto Mono", "Source Code Pro", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 1px rgba(0, 0, 0, 0.08)',
              letterSpacing: '0.08em',
              fontWeight: '700',
              fontFeatureSettings: '"tnum" 1, "ss01" 1',
              fontVariantNumeric: 'tabular-nums',
              textRendering: 'optimizeLegibility'
            }}
          >
            00:00
          </div>
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <div className={`premium-timer-container ${className}`}>
      <svg className="w-4 h-4 premium-timer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className={`premium-timer ${getSizeClasses()} ${getColorClasses()}`}>
        00:00
      </span>
    </div>
  )
}