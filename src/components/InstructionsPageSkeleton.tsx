'use client'

import React from 'react'

const InstructionsPageSkeleton: React.FC = () => {
  return (
    <main className="w-full h-screen bg-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* The white content box - Full screen with fixed header and footer */}
      <div className="bg-white dark:bg-gray-800 w-full h-full flex flex-col border-0">
        
        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-grow overflow-y-auto px-10 py-8">
          {/* Test Name Header Skeleton */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="h-10 w-96 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto animate-pulse"></div>
          </div>
          
          {/* Core Content Grid - a 50/50 split */}
          <section className="grid md:grid-cols-2 gap-10 max-w-7xl mx-auto">
            
            {/* Left Column: Test Instructions Skeleton */}
            <div className="bg-slate-50 dark:bg-slate-700/50 p-8 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
              <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6 border-b-2 border-slate-300 dark:border-slate-600 pb-3 animate-pulse"></div>
              
              <div className="space-y-4">
                {/* Test Details Skeleton */}
                <div className="space-y-3">
                  <div className="flex justify-between py-2 px-2 bg-white dark:bg-slate-800/50 rounded-md">
                    <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between py-2 px-2 bg-white dark:bg-slate-800/50 rounded-md">
                    <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between py-2 px-2 bg-white dark:bg-slate-800/50 rounded-md">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between py-2 px-2 bg-white dark:bg-slate-800/50 rounded-md">
                    <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Instructions List Skeleton */}
                <div className="pt-5 space-y-3 border-t-2 border-slate-300 dark:border-slate-600 mt-5">
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Right Column: Prohibited Actions Skeleton */}
            <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-xl border-2 border-red-500 dark:border-red-400 shadow-lg">
              <div className="flex items-start mb-4">
                <div className="h-8 w-8 bg-red-200 dark:bg-red-800 rounded mr-3 flex-shrink-0 mt-1 animate-pulse"></div>
                <div className="h-7 w-48 bg-red-200 dark:bg-red-800 rounded animate-pulse"></div>
              </div>

              {/* Warning Banner Skeleton */}
              <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-500 rounded-lg">
                <div className="h-5 w-full bg-yellow-200 dark:bg-yellow-800 rounded mb-2 animate-pulse"></div>
                <div className="h-5 w-4/5 bg-yellow-200 dark:bg-yellow-800 rounded animate-pulse"></div>
              </div>

              <div className="h-4 w-3/4 bg-red-200 dark:bg-red-800 rounded mb-5 animate-pulse"></div>

              {/* Prohibited Actions List Skeleton */}
              <ul className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 bg-red-200 dark:bg-red-800 rounded flex-shrink-0 mt-0.5 animate-pulse"></div>
                    <div className="h-5 w-full bg-red-200 dark:bg-red-800 rounded animate-pulse"></div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* FIXED FOOTER AREA Skeleton */}
        <footer className="flex-shrink-0 mt-auto bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-600 px-6 py-6">
          <div className="flex items-start justify-center gap-4 max-w-7xl mx-auto mb-6">
            <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded mt-1 flex-shrink-0 animate-pulse"></div>
            <div className="flex-1 max-w-2xl">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
              <div className="space-y-1.5">
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto">
            <div className="h-11 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div className="h-11 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
        </footer>
      </div>
    </main>
  )
}

export default InstructionsPageSkeleton

