'use client'

import React, { useState } from 'react';
import NewPerformanceAnalysisDashboard from '@/components/NewPerformanceAnalysisDashboard';
import { SessionResult } from '@/components/NewPerformanceAnalysisDashboard';

/**
 * Responsive Testing Page
 * Tests the NewPerformanceAnalysisDashboard component at different viewport sizes
 * to verify responsive design requirements from task 11.
 */
export default function ResponsiveTestPage() {
  const [viewportWidth, setViewportWidth] = useState<number>(1280);

  // Mock data for testing
  const mockSessionResult: SessionResult = {
    testResult: {
      id: 1,
      user_id: 'test-user-123',
      test_type: 'mock_test',
      mock_test_id: 1,
      score: 240,
      submitted_at: new Date().toISOString(),
      total_questions: 85,
      total_correct: 60,
      total_incorrect: 20,
      total_skipped: 5,
      total_time_taken: 5400, // 1.5 hours in seconds
      accuracy: 75,
      score_percentage: 75,
      session_type: 'mock_test',
      srs_feedback_log: null,
      rank: 15,
      total_test_takers: 150,
      results: {
        marks_obtained: 240,
        total_marks: 320,
        percentile: 85.5,
        rank: 15,
        total_test_takers: 150,
      }
    },
    answerLog: generateMockAnswerLog(),
    questions: generateMockQuestions(),
    topperResult: {
      testResult: {
        id: 2,
        user_id: 'topper-user',
        test_type: 'mock_test',
        mock_test_id: 1,
        score: 288,
        submitted_at: new Date().toISOString(),
        total_questions: 85,
        total_correct: 75,
        total_incorrect: 8,
        total_skipped: 2,
        total_time_taken: 4800,
        accuracy: 90,
        score_percentage: 90,
        session_type: 'mock_test',
        srs_feedback_log: null,
        rank: 1,
        total_test_takers: 150,
        results: {
          marks_obtained: 288,
          total_marks: 320,
          percentile: 99.5,
          rank: 1,
          total_test_takers: 150,
        }
      },
      answerLog: generateMockTopperAnswerLog(),
    }
  };

  const viewportSizes = [
    { label: 'Mobile (320px)', width: 320 },
    { label: 'Mobile (375px)', width: 375 },
    { label: 'Mobile (414px)', width: 414 },
    { label: 'Tablet (768px)', width: 768 },
    { label: 'Tablet (1023px)', width: 1023 },
    { label: 'Desktop (1024px)', width: 1024 },
    { label: 'Desktop (1280px)', width: 1280 },
    { label: 'Desktop (1920px)', width: 1920 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      {/* Testing Controls */}
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Responsive Design Testing - Task 11
        </h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Viewport Width:
          </label>
          <div className="flex flex-wrap gap-2">
            {viewportSizes.map(size => (
              <button
                key={size.width}
                onClick={() => setViewportWidth(size.width)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewportWidth === size.width
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Current Viewport: {viewportWidth}px</h2>
          <div className="text-sm text-slate-600 space-y-1">
            <p><strong>Expected Behavior:</strong></p>
            {viewportWidth < 768 && (
              <ul className="list-disc list-inside ml-2">
                <li>KPI grid: 2 columns</li>
                <li>Tab navigation: Wraps and scrolls horizontally</li>
                <li>Charts: Maintain aspect ratio</li>
                <li>Chapter table: Scrolls horizontally</li>
                <li>Leaderboard: Readable with horizontal scroll</li>
              </ul>
            )}
            {viewportWidth >= 768 && viewportWidth < 1024 && (
              <ul className="list-disc list-inside ml-2">
                <li>KPI grid: 3 columns</li>
                <li>Tab navigation: Displays inline</li>
                <li>Charts: Scale appropriately</li>
                <li>Tables: Fit viewport</li>
              </ul>
            )}
            {viewportWidth >= 1024 && (
              <ul className="list-disc list-inside ml-2">
                <li>KPI grid: 5 columns</li>
                <li>Container: max-w-7xl</li>
                <li>Glassmorphism: Renders correctly</li>
                <li>Hover animations: Work smoothly</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Preview Container */}
      <div className="bg-white rounded-lg shadow-lg p-4 mx-auto" style={{ maxWidth: `${viewportWidth}px` }}>
        <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
          <div style={{ width: `${viewportWidth}px` }} className="mx-auto">
            <NewPerformanceAnalysisDashboard
              sessionResult={mockSessionResult}
              onNavigateToSolutions={() => console.log('Navigate to solutions')}
            />
          </div>
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="max-w-7xl mx-auto mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Verification Checklist</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Task 11.1: Mobile (320px - 767px)</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>✓ KPI grid collapses to 2 columns (grid-cols-2)</li>
              <li>✓ Tab navigation wraps (flex-wrap)</li>
              <li>✓ Charts maintain aspect ratio (h-64 md:h-80)</li>
              <li>✓ Chapter table scrolls horizontally (overflow-x-auto)</li>
              <li>✓ Leaderboard table is readable (overflow-x-auto)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Task 11.2: Tablet (768px - 1023px)</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>✓ KPI grid shows 3 columns (sm:grid-cols-3)</li>
              <li>✓ Tab navigation displays inline (flex-wrap handles this)</li>
              <li>✓ Charts scale appropriately (md:h-80, md:h-96)</li>
              <li>✓ Tables fit viewport (responsive padding)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Task 11.3: Desktop (1024px+)</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>✓ KPI grid shows 5 columns (lg:grid-cols-5)</li>
              <li>✓ Container uses max-w-7xl</li>
              <li>✓ Glassmorphism effects render (backdrop-filter)</li>
              <li>✓ Hover animations work (transform, shadow transitions)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions to generate mock data
function generateMockQuestions() {
  const chapters = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
  const difficulties: Array<'Easy' | 'Moderate' | 'Hard'> = ['Easy', 'Moderate', 'Hard'];
  const questions = [];

  for (let i = 1; i <= 85; i++) {
    questions.push({
      id: i,
      question_id: `Q${i}`,
      book_source: 'MOCK_TEST',
      chapter_name: chapters[Math.floor(Math.random() * chapters.length)],
      question_number_in_book: i,
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      question_text: `Question ${i}`,
      options: {
        A: 'Option A',
        B: 'Option B',
        C: 'Option C',
        D: 'Option D',
      },
      correct_option: 'A',
      solution_text: 'Explanation',
      exam_metadata: null,
      admin_tags: null,
      created_at: new Date().toISOString(),
    });
  }

  return questions;
}

function generateMockAnswerLog() {
  const answerLog = [];
  const statuses = ['correct', 'incorrect', 'skipped'];
  const weights = [60, 20, 5]; // 60 correct, 20 incorrect, 5 skipped

  let statusIndex = 0;
  for (let i = 1; i <= 85; i++) {
    let status;
    if (statusIndex < weights[0]) {
      status = 'correct';
    } else if (statusIndex < weights[0] + weights[1]) {
      status = 'incorrect';
    } else {
      status = 'skipped';
    }
    statusIndex++;

    answerLog.push({
      id: i,
      result_id: 1,
      question_id: i,
      user_id: 'test-user-123',
      user_answer: status === 'skipped' ? null : ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      status: status as 'correct' | 'incorrect' | 'skipped',
      time_taken: Math.floor(Math.random() * 120) + 30,
      created_at: new Date().toISOString(),
    });
  }

  return answerLog;
}

function generateMockTopperAnswerLog() {
  const answerLog = [];
  const statuses = ['correct', 'incorrect', 'skipped'];
  const weights = [75, 8, 2]; // 75 correct, 8 incorrect, 2 skipped

  let statusIndex = 0;
  for (let i = 1; i <= 85; i++) {
    let status;
    if (statusIndex < weights[0]) {
      status = 'correct';
    } else if (statusIndex < weights[0] + weights[1]) {
      status = 'incorrect';
    } else {
      status = 'skipped';
    }
    statusIndex++;

    answerLog.push({
      id: i + 1000,
      result_id: 2,
      question_id: i,
      user_id: 'topper-user',
      user_answer: status === 'skipped' ? null : ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      status: status as 'correct' | 'incorrect' | 'skipped',
      time_taken: Math.floor(Math.random() * 90) + 20,
      created_at: new Date().toISOString(),
    });
  }

  return answerLog;
}
