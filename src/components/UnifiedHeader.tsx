'use client'

import React, { useState } from 'react'
import { ChevronLeft, Flag, Clock, Play, Pause } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import '../styles/UnifiedHeader.css'
import '@/styles/TimerTypography.css'
import { REPORT_OPTIONS } from '@/lib/constants'

interface UnifiedHeaderProps {
  currentQuestion: number
  totalQuestions: number
  mainTimer: string
  isLowTime?: boolean // NEW: Flag for low time styling
  onBack?: () => void
  onReport?: (reportTag: string) => void
  isPaused?: boolean
  onTogglePause?: () => void
  // Scoring information
  correctMarks?: number
  negativeMarks?: number
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  currentQuestion,
  totalQuestions,
  mainTimer,
  isLowTime = false, // NEW: Add this parameter
  onBack,
  onReport,
  isPaused = false,
  onTogglePause,
  correctMarks,
  negativeMarks
}) => {
  const handleReportSelect = (reportTag: string) => {
    if (onReport) {
      onReport(reportTag)
    }
  }
  return (
    <header className="unified-header">
      <div className="header-zone left">
        <button 
          className="icon-button back-button" 
          aria-label="Back to question list"
          onClick={onBack}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="progress-indicator">
          Question {currentQuestion} of {totalQuestions}
        </div>
      </div>

      <div className="header-zone center">
        <div className="premium-timer-container">
          <Clock size={18} className="premium-timer-icon" />
          <span
            key={mainTimer} // CRITICAL: This key changes every second, forcing a re-render and re-animation.
            className={`premium-timer medium font-semibold transition-colors duration-300 ${
              isLowTime 
                ? 'text-red-500 dark:text-red-400 timer-heartbeat' // Use our new custom animation class
                : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            {mainTimer}
          </span>
          {onTogglePause && (
            <button 
              onClick={onTogglePause}
              className="timer-control-button"
              aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}
        </div>
      </div>

      <div className="header-zone right">
        {/* Scoring Information */}
        {(correctMarks !== undefined || negativeMarks !== undefined) && (
          <div className="flex items-center space-x-3 mr-4">
            {correctMarks !== undefined && (
              <div className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md">
                <span>+</span>
                <span>{correctMarks}</span>
              </div>
            )}
            {negativeMarks !== undefined && (
              <div className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md">
                <span>-</span>
                <span>{Math.abs(negativeMarks)}</span>
              </div>
            )}
          </div>
        )}
        
        <Menu as="div" className="relative">
          <Menu.Button 
            className="icon-button report-button" 
            aria-label="Report this question"
          >
            <Flag size={16} />
          </Menu.Button>
          
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-slate-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1">
                {REPORT_OPTIONS.map((option) => (
                  <Menu.Item key={option.tag}>
                    {({ active }) => (
                      <button
                        onClick={() => handleReportSelect(option.tag)}
                        className={`${
                          active ? 'bg-slate-100 dark:bg-slate-700' : ''
                        } block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300`}
                      >
                        {option.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  )
}

export default UnifiedHeader
