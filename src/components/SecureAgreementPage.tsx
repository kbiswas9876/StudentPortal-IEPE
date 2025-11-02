'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react'

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

  // Debug: Log the test data to see what we're getting
  useEffect(() => {
    console.log('SecureAgreementPage - Test data received:', test)
    console.log('Negative marking value:', test.negative_marks_per_incorrect, 'Type:', typeof test.negative_marks_per_incorrect)
    console.log('Has mixed marking:', hasMixedMarking)
  }, [test, hasMixedMarking])

  const handleStartTest = () => {
    if (!hasAgreed) return
    onStartTest()
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
        
        {/* FIXED HEADER AREA */}
        <header className="flex-shrink-0 text-center p-10 pb-8 border-b border-gray-200 dark:border-gray-600">
          <ShieldCheck className="mx-auto h-14 w-14 text-blue-600 dark:text-blue-400" />
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-3">
            Secure Exam Environment
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            You are about to begin the mock test:
          </p>
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mt-1">
            {test.name}
          </h2>
        </header>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-grow overflow-y-auto p-10">
          {/* Core Content Grid - a 50/50 split */}
          <section className="grid md:grid-cols-2 gap-8">
            
            {/* Left Column: Test Instructions */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-8 rounded-md border border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">
                Test Instructions
              </h3>
              <div className="space-y-3 text-base text-gray-600 dark:text-gray-300">
                {/* Using a definition list for clean alignment */}
                <dl className="space-y-1">
                  <div className="flex justify-between py-1">
                    <dt>Duration:</dt>
                    <dd className="font-semibold">{test.total_time_minutes} minutes</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt>Questions:</dt>
                    <dd className="font-semibold">{test.total_questions}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt>Marks for correct:</dt>
                    <dd className="font-semibold text-green-600 dark:text-green-400">+{test.marks_per_correct}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt>Negative for incorrect:</dt>
                    <dd className={`font-semibold ${
                      test.negative_marks_per_incorrect != null && 
                      test.negative_marks_per_incorrect !== undefined && 
                      Math.abs(Number(test.negative_marks_per_incorrect)) > 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
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
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-md flex items-start border border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      Please note: While the above is the default marking scheme, some questions in this test may have a different marking scheme.
                    </span>
                  </div>
                )}

                <ul className="pt-3 space-y-2 list-disc list-inside border-t border-gray-300 dark:border-gray-600 mt-3">
                  <li>Ensure you have a stable internet connection.</li>
                  <li>The test will automatically start in <strong>FULL-SCREEN MODE</strong>.</li>
                  <li>Once you begin, the timer <strong>CANNOT BE PAUSED</strong>.</li>
                  <li>You can navigate between questions freely.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Prohibited Actions - with higher visual impact */}
            <div className="bg-red-50/50 dark:bg-red-900/20 p-8 rounded-md border border-red-500/30 dark:border-red-400/30">
              <div className="flex items-start">
                <AlertTriangle className="h-7 w-7 text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-800 dark:text-red-300">
                    PROHIBITED ACTIONS
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-2 font-medium">
                    To ensure fairness, any of the following actions will trigger a security warning and may result in the <strong>IMMEDIATE SUBMISSION</strong> of your test:
                  </p>
                  <ul className="mt-4 space-y-2 text-base font-bold text-red-900 dark:text-red-200">
                    <li>- DO NOT <strong>EXIT FULL-SCREEN MODE</strong></li>
                    <li>- DO NOT <strong>REFRESH</strong> the Page (F5 or Ctrl+R)</li>
                    <li>- DO NOT <strong>SWITCH</strong> to Another Tab or Application</li>
                    <li>- DO NOT <strong>USE DEVELOPER TOOLS</strong> (F12)</li>
                    <li>- DO NOT <strong>RIGHT-CLICK</strong> or attempt to <strong>COPY/PASTE</strong></li>
                    <li>- DO NOT <strong>TAKE SCREENSHOTS</strong> (where detected)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div> {/* End of Scrollable Area */}

        {/* FIXED FOOTER AREA */}
        <footer className="flex-shrink-0 mt-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 p-6">
          <div className="flex items-start justify-center gap-4 max-w-5xl mx-auto">
            <input
              id="agreement-checkbox"
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="h-6 w-6 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer mt-1 flex-shrink-0"
            />
            <label 
              htmlFor="agreement-checkbox" 
              className="text-base leading-relaxed text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              <span className="font-semibold">I confirm that:</span>
              <ul className="mt-2 space-y-1.5 list-none pl-0">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>I have read and understood all the exam rules and security requirements listed above.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>I understand that violating any of these rules may result in <strong>immediate test submission</strong> and <strong>disqualification</strong>.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>I agree to abide by all the rules and regulations throughout the entire test duration.</span>
                </li>
              </ul>
            </label>
          </div>

          {/* Fullscreen Error Display */}
          {fullscreenError && (
            <div className="text-center text-red-600 dark:text-red-400 font-semibold my-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              {fullscreenError}
            </div>
          )}

          {/* PART 2 DEBUGGING: Uncomment this test button to verify minimal React handler works */}
          {/* 
          <div className="mb-4 text-center">
            <button
              onClick={handleMinimalTestClick}
              className="bg-yellow-500 hover:bg-yellow-600 p-4 text-xl text-white rounded-md font-semibold"
            >
              Minimal React Fullscreen Test
            </button>
          </div>
          */}

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={onCancel}
              className="px-8 py-3 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartTest}
              disabled={!hasAgreed}
              className={`px-12 py-3 font-bold text-white rounded-md transition-colors ${
                hasAgreed 
                  ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer' 
                  : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-60'
              }`}
            >
              Start Test
            </button>
          </div>
        </footer>
      </div>
    </main>
  )
}
