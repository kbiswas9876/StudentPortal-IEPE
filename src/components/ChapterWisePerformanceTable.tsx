'use client'

import React from 'react'

export interface ChapterPerformance {
  chapterName: string;
  accuracy: number; // percentage (0-100)
  timePerQuestion: number; // seconds per question
  attempted: number;
  correct: number;
}

export interface ChapterWisePerformanceTableProps {
  chapters: ChapterPerformance[];
  className?: string;
}

const formatAccuracy = (value: number) => `${Math.round(value)}%`;

const formatTimePerQuestion = (seconds: number) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
};

const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 70) return 'text-green-600 dark:text-green-400';
  if (accuracy >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export default function ChapterWisePerformanceTable({ chapters, className }: ChapterWisePerformanceTableProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 ${className || ''}`}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Chapter-wise Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Chapter Name</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Accuracy</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Time/Question</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {chapters && chapters.length > 0 ? (
                chapters.map((item, idx) => (
                  <tr
                    key={`${item.chapterName}-${idx}`}
                    className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-700"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{item.chapterName}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`font-semibold ${getAccuracyColor(item.accuracy)}`}>
                        {formatAccuracy(item.accuracy)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatTimePerQuestion(item.timePerQuestion)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No chapter performance data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Footer note showing attempted/correct totals could be added if needed */}
      </div>
    </div>
  );
}