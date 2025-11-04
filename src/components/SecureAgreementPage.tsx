'use client'

import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Info, 
  Maximize2, 
  RefreshCw, 
  Monitor, 
  Wrench, 
  MousePointer2, 
  Camera, 
  Loader2,
  X
} from 'lucide-react'

interface SecureAgreementPageProps {
  test: {
    id: number
    name: string
    description: string | null
    total_time_minutes: number
    marks_per_correct: number
    negative_marks_per_incorrect: number
    total_questions: number
  }
  hasMixedMarking?: boolean
  fullscreenError?: string | null
  onStartTest: () => void
  onCancel: () => void
}

export default function SecureAgreementPage({ 
  test, 
  hasMixedMarking = false, 
  fullscreenError = null,
  onStartTest,
  onCancel
}: SecureAgreementPageProps) {
  const [hasAgreed, setHasAgreed] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  // Debug: Log the test data to see what we're getting
  useEffect(() => {
    console.log('SecureAgreementPage - Test data received:', test)
    console.log('Negative marking value:', test.negative_marks_per_incorrect, 'Type:', typeof test.negative_marks_per_incorrect)
    console.log('Has mixed marking:', hasMixedMarking)
  }, [test, hasMixedMarking])

  // Reset loading state if fullscreen error occurs
  useEffect(() => {
    if (fullscreenError && isStarting) {
      setIsStarting(false)
    }
  }, [fullscreenError, isStarting])

  const handleStartTest = () => {
    if (!hasAgreed || isStarting) return
    
    setIsStarting(true)
    // Call the parent handler which will handle fullscreen and navigation
    onStartTest()
    
    // Note: The loading state will be reset if navigation fails
    // The parent component should handle the actual navigation
  }

  // PART 2 DEBUGGING: Minimal React Test Handler (uncomment to test)
  // This is a simplified handler to test if React's event system itself is the issue.
  // const handleMinimalTestClick = () => {
  //   console.log('Button clicked. Requesting fullscreen synchronously...');
  //   
  //   document.documentElement.requestFullscreen()
  //     .then(() => {
  //       console.log('SUCCESS: Fullscreen entered via minimal React handler.');
  //       // In a real scenario, we would set state here.
  //       // For now, we do nothing else.
  //     })
  //     .catch(err => {
  //       console.error('FAILURE: Fullscreen failed in minimal React handler.', err);
  //     });
  // };

  return (
    // Main container - Full screen layout for fixed header and footer
    <main className="w-full h-screen bg-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">
      
      {/* The white content box - Full screen with fixed header and footer */}
      <div className="bg-white dark:bg-gray-800 w-full h-full flex flex-col border-0">
        
        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-grow overflow-y-auto px-10 py-8">
          {/* Test Name Header */}
          <div className="max-w-7xl mx-auto mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 dark:text-indigo-400 text-center">
              {test.name}
            </h2>
          </div>
          
          {/* Core Content Grid - a 50/50 split */}
          <section className="grid md:grid-cols-2 gap-10 max-w-7xl mx-auto">
            
            {/* Left Column: Test Instructions */}
            <div className="bg-slate-50 dark:bg-slate-700/50 p-8 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b-2 border-slate-300 dark:border-slate-600 pb-3">
                Test Instructions
              </h3>
              <div className="space-y-4 text-base text-slate-600 dark:text-slate-300">
                {/* Using a definition list for clean alignment */}
                <dl className="space-y-3">
                  <div className="flex justify-between py-2 px-2 bg-white dark:bg-slate-800/50 rounded-md">
                    <dt className="font-medium text-slate-700 dark:text-slate-300">Duration:</dt>
                    <dd className="font-bold text-slate-900 dark:text-slate-100">{test.total_time_minutes} minutes</dd>
                  </div>
                  <div className="flex justify-between py-2 px-2 bg-white dark:bg-slate-800/50 rounded-md">
                    <dt className="font-medium text-slate-700 dark:text-slate-300">Questions:</dt>
                    <dd className="font-bold text-slate-900 dark:text-slate-100">{test.total_questions}</dd>
                  </div>
                  <div className="flex justify-between py-2 px-2 bg-white dark:bg-slate-800/50 rounded-md">
                    <dt className="font-medium text-slate-700 dark:text-slate-300">Marks for correct:</dt>
                    <dd className="font-bold text-green-600 dark:text-green-400">+{test.marks_per_correct}</dd>
                  </div>
                  <div className="flex justify-between py-2 px-2 bg-white dark:bg-slate-800/50 rounded-md">
                    <dt className="font-medium text-slate-700 dark:text-slate-300">Negative for incorrect:</dt>
                    <dd className={`font-bold ${
                      test.negative_marks_per_incorrect != null && 
                      test.negative_marks_per_incorrect !== undefined && 
                      Math.abs(Number(test.negative_marks_per_incorrect)) > 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {test.negative_marks_per_incorrect != null && 
                       test.negative_marks_per_incorrect !== undefined
                        ? Number(test.negative_marks_per_incorrect) < 0
                          ? `${test.negative_marks_per_incorrect}` // Already negative, display as-is
                          : Number(test.negative_marks_per_incorrect) > 0
                          ? `-${test.negative_marks_per_incorrect}` // Positive, add minus sign
                          : '0' // Exactly zero
                        : 'None'}
                    </dd>
                  </div>
                </dl>

                {/* DYNAMIC Message for Mixed Marking */}
                {hasMixedMarking && (
                  <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-lg flex items-start border border-blue-200 dark:border-blue-800">
                    <Info className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span>
                      Please note: While the above is the default marking scheme, some questions in this test may have a different marking scheme.
                    </span>
                  </div>
                )}

                <ul className="pt-5 space-y-3 list-disc list-inside border-t-2 border-slate-300 dark:border-slate-600 mt-5 text-slate-700 dark:text-slate-300">
                  <li>Ensure you have a stable internet connection.</li>
                  <li>The test will automatically start in <strong className="text-slate-900 dark:text-slate-100">FULL-SCREEN MODE</strong>.</li>
                  <li>Once you begin, the timer <strong className="text-slate-900 dark:text-slate-100">CANNOT BE PAUSED</strong>.</li>
                  <li>You can navigate between questions freely.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Prohibited Actions - Enhanced with warning banner and icons */}
            <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-xl border-2 border-red-500 dark:border-red-400 shadow-lg">
              <div className="flex items-start mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-2xl font-extrabold text-red-800 dark:text-red-300 uppercase tracking-wide">
                    Prohibited Actions
                  </h3>
                </div>
              </div>

              {/* Warning Banner - Consequence Statement */}
              <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-500 rounded-lg">
                <p className="text-base font-bold text-yellow-900 dark:text-yellow-100 leading-relaxed">
                  <span className="text-lg">⚠️ </span>
                  Any violation will trigger a <strong className="text-red-700 dark:text-red-300">5-second countdown</strong>. 
                  Failure to return to the test will result in <strong className="text-red-700 dark:text-red-300">immediate auto-submission</strong>.
                </p>
              </div>

              <p className="text-sm text-red-700 dark:text-red-300 mb-5 font-medium">
                To ensure fairness, the following actions are strictly forbidden:
              </p>

              <ul className="space-y-3 text-base font-semibold text-red-900 dark:text-red-200">
                <li className="flex items-start gap-3">
                  <Maximize2 className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span>DO NOT <strong>EXIT FULL-SCREEN MODE</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <RefreshCw className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <X className="h-3 w-3 text-red-700 dark:text-red-300 absolute -top-1 -right-1" />
                  </div>
                  <span>DO NOT <strong>REFRESH</strong> the Page (F5 or Ctrl+R)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Monitor className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span>DO NOT <strong>SWITCH</strong> to Another Tab or Application</span>
                </li>
                <li className="flex items-start gap-3">
                  <Wrench className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span>DO NOT <strong>USE DEVELOPER TOOLS</strong> (F12)</span>
                </li>
                <li className="flex items-start gap-3">
                  <MousePointer2 className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span>DO NOT <strong>RIGHT-CLICK</strong> or attempt to <strong>COPY/PASTE</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Camera className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span>DO NOT <strong>TAKE SCREENSHOTS</strong> (where detected)</span>
                </li>
              </ul>
            </div>
          </section>
        </div> {/* End of Scrollable Area */}

        {/* FIXED FOOTER AREA */}
        <footer className="flex-shrink-0 mt-auto bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-600 px-6 py-6">
          <div className="flex items-start justify-center gap-4 max-w-7xl mx-auto mb-6">
            <input
              id="agreement-checkbox"
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              disabled={isStarting}
              className="h-6 w-6 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer mt-1 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label 
              htmlFor="agreement-checkbox" 
              className="text-base leading-relaxed text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100">I confirm that:</span>
              <ul className="mt-2 space-y-1.5 list-none pl-0">
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-600 dark:text-indigo-400">•</span>
                  <span>I have read and understood all the exam rules and security requirements listed above.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-600 dark:text-indigo-400">•</span>
                  <span>I understand that violating any of these rules may result in <strong>immediate test submission</strong> and <strong>disqualification</strong>.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-600 dark:text-indigo-400">•</span>
                  <span>I agree to abide by all the rules and regulations throughout the entire test duration.</span>
                </li>
              </ul>
            </label>
          </div>

          {/* Fullscreen Error Display */}
          {fullscreenError && (
            <div className="text-center text-red-600 dark:text-red-400 font-semibold mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800 max-w-7xl mx-auto">
              {fullscreenError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto">
            <button
              onClick={onCancel}
              disabled={isStarting}
              className="px-8 py-3 font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleStartTest}
              disabled={!hasAgreed || isStarting}
              className={`px-12 py-3 font-bold text-white rounded-lg transition-all duration-200 flex items-center gap-2 ${
                hasAgreed && !isStarting
                  ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 cursor-pointer shadow-md hover:shadow-lg' 
                  : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-60'
              }`}
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <span>Start Test</span>
              )}
            </button>
          </div>
        </footer>
      </div>
    </main>
  )
}
