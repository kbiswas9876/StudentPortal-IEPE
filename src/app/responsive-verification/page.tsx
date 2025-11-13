'use client'

import React, { useState, useEffect } from 'react';
import NewPerformanceAnalysisDashboard from '@/components/NewPerformanceAnalysisDashboard';
import { SessionResult } from '@/components/NewPerformanceAnalysisDashboard';

/**
 * Responsive Verification Test Page
 * Tests all responsive breakpoints for the Performance Analysis Dashboard
 * 
 * Breakpoints to test:
 * - Mobile: 320px - 767px
 * - Tablet: 768px - 1023px
 * - Desktop: 1024px+
 */
export default function ResponsiveVerificationPage() {
  const [viewportWidth, setViewportWidth] = useState<number>(0);
  const [selectedBreakpoint, setSelectedBreakpoint] = useState<string>('auto');

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

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
      accuracy: 75.0,
      score_percentage: 75.0,
      session_type: 'mock_test',
      srs_feedback_log: null,
      rank: 15,
      total_test_takers: 250,
      results: {
        marks_obtained: 240,
        total_marks: 320,
        percentile: 85.5,
        rank: 15,
        total_test_takers: 250,
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
        score: 312,
        submitted_at: new Date().toISOString(),
        total_questions: 85,
        total_correct: 78,
        total_incorrect: 5,
        total_skipped: 2,
        total_time_taken: 4800,
        accuracy: 94.0,
        score_percentage: 94.0,
        session_type: 'mock_test',
        srs_feedback_log: null,
        results: {
          marks_obtained: 312,
          total_marks: 320,
          percentile: 99.5,
          rank: 1,
          total_test_takers: 250,
        }
      },
      answerLog: generateMockTopperAnswerLog(),
    }
  };

  const breakpoints = [
    { name: 'auto', label: 'Auto (Current)', width: null },
    { name: 'mobile-xs', label: 'Mobile XS (320px)', width: 320 },
    { name: 'mobile-sm', label: 'Mobile SM (375px)', width: 375 },
    { name: 'mobile-md', label: 'Mobile MD (414px)', width: 414 },
    { name: 'mobile-lg', label: 'Mobile LG (767px)', width: 767 },
    { name: 'tablet-sm', label: 'Tablet SM (768px)', width: 768 },
    { name: 'tablet-md', label: 'Tablet MD (834px)', width: 834 },
    { name: 'tablet-lg', label: 'Tablet LG (1023px)', width: 1023 },
    { name: 'desktop-sm', label: 'Desktop SM (1024px)', width: 1024 },
    { name: 'desktop-md', label: 'Desktop MD (1280px)', width: 1280 },
    { name: 'desktop-lg', label: 'Desktop LG (1920px)', width: 1920 },
  ];

  const getBreakpointCategory = (width: number): string => {
    if (width < 768) return 'Mobile (320px - 767px)';
    if (width < 1024) return 'Tablet (768px - 1023px)';
    return 'Desktop (1024px+)';
  };

  const getExpectedLayout = (width: number) => {
    if (width < 768) {
      return {
        kpiGrid: '2 columns',
        tabNav: 'Wraps horizontally',
        charts: 'Full width, maintains aspect ratio',
        tables: 'Horizontal scroll',
      };
    } else if (width < 1024) {
      return {
        kpiGrid: '3 columns',
        tabNav: 'Inline display',
        charts: 'Scaled appropriately',
        tables: 'Fits viewport',
      };
    } else {
      return {
        kpiGrid: '5 columns',
        tabNav: 'Inline display',
        charts: 'Scaled appropriately',
        tables: 'Fits viewport',
      };
    }
  };

  const currentWidth = selectedBreakpoint === 'auto' 
    ? viewportWidth 
    : breakpoints.find(b => b.name === selectedBreakpoint)?.width || viewportWidth;

  const expectedLayout = getExpectedLayout(currentWidth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Control Panel */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Responsive Verification Test</h1>
                <p className="text-sm text-slate-600">
                  Current: <span className="font-semibold text-indigo-600">{currentWidth}px</span>
                  {' - '}
                  <span className="font-semibold text-indigo-600">{getBreakpointCategory(currentWidth)}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Actual Viewport</div>
                <div className="text-lg font-bold text-slate-900">{viewportWidth}px</div>
              </div>
            </div>

            {/* Breakpoint Selector */}
            <div className="flex flex-wrap gap-2">
              {breakpoints.map(bp => (
                <button
                  key={bp.name}
                  onClick={() => setSelectedBreakpoint(bp.name)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedBreakpoint === bp.name
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {bp.label}
                </button>
              ))}
            </div>

            {/* Expected Layout Info */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-indigo-900 mb-2">Expected Layout:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-600">KPI Grid:</span>
                  <span className="ml-1 font-semibold text-slate-900">{expectedLayout.kpiGrid}</span>
                </div>
                <div>
                  <span className="text-slate-600">Tab Nav:</span>
                  <span className="ml-1 font-semibold text-slate-900">{expectedLayout.tabNav}</span>
                </div>
                <div>
                  <span className="text-slate-600">Charts:</span>
                  <span className="ml-1 font-semibold text-slate-900">{expectedLayout.charts}</span>
                </div>
                <div>
                  <span className="text-slate-600">Tables:</span>
                  <span className="ml-1 font-semibold text-slate-900">{expectedLayout.tables}</span>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <details className="bg-slate-50 border border-slate-200 rounded-lg">
              <summary className="px-3 py-2 cursor-pointer text-sm font-semibold text-slate-900 hover:bg-slate-100">
                Verification Checklist
              </summary>
              <div className="px-3 py-2 text-xs space-y-2">
                {currentWidth < 768 && (
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">Mobile (320px - 767px):</div>
                    <div className="ml-3 space-y-0.5 text-slate-700">
                      <div>✓ KPI grid collapses to 2 columns</div>
                      <div>✓ Tab navigation wraps and scrolls horizontally</div>
                      <div>✓ Charts maintain aspect ratio</div>
                      <div>✓ Chapter table scrolls horizontally</div>
                      <div>✓ Leaderboard table is readable</div>
                    </div>
                  </div>
                )}
                {currentWidth >= 768 && currentWidth < 1024 && (
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">Tablet (768px - 1023px):</div>
                    <div className="ml-3 space-y-0.5 text-slate-700">
                      <div>✓ KPI grid shows 3 columns</div>
                      <div>✓ Tab navigation displays inline</div>
                      <div>✓ Charts scale appropriately</div>
                      <div>✓ All tables fit viewport</div>
                    </div>
                  </div>
                )}
                {currentWidth >= 1024 && (
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">Desktop (1024px+):</div>
                    <div className="ml-3 space-y-0.5 text-slate-700">
                      <div>✓ KPI grid shows 5 columns</div>
                      <div>✓ All components use max-w-7xl container</div>
                      <div>✓ Glassmorphism effects render correctly</div>
                      <div>✓ Hover animations work smoothly</div>
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Dashboard Container with Simulated Width */}
      <div className="py-8">
        <div 
          className="mx-auto transition-all duration-300"
          style={{ 
            width: selectedBreakpoint === 'auto' ? '100%' : `${currentWidth}px`,
            maxWidth: '100%',
          }}
        >
          <div className="px-4">
            <NewPerformanceAnalysisDashboard
              sessionResult={mockSessionResult}
              onNavigateToSolutions={() => alert('Navigate to solutions')}
            />
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
  const statuses = ['correct', 'incorrect', 'skipped'];
  const answerLog = [];
  
  // 60 correct, 20 incorrect, 5 skipped
  for (let i = 1; i <= 60; i++) {
    answerLog.push({
      id: i,
      result_id: 1,
      question_id: i,
      user_id: 'test-user-123',
      user_answer: 'A',
      status: 'correct',
      time_taken: Math.floor(Math.random() * 120) + 30,
      created_at: new Date().toISOString(),
    });
  }
  
  for (let i = 61; i <= 80; i++) {
    answerLog.push({
      id: i,
      result_id: 1,
      question_id: i,
      user_id: 'test-user-123',
      user_answer: 'B',
      status: 'incorrect',
      time_taken: Math.floor(Math.random() * 120) + 30,
      created_at: new Date().toISOString(),
    });
  }
  
  for (let i = 81; i <= 85; i++) {
    answerLog.push({
      id: i,
      result_id: 1,
      question_id: i,
      user_id: 'test-user-123',
      user_answer: null,
      status: 'skipped',
      time_taken: 0,
      created_at: new Date().toISOString(),
    });
  }

  return answerLog;
}

function generateMockTopperAnswerLog() {
  const answerLog = [];
  
  // 78 correct, 5 incorrect, 2 skipped
  for (let i = 1; i <= 78; i++) {
    answerLog.push({
      id: i + 1000,
      result_id: 2,
      question_id: i,
      user_id: 'topper-user',
      user_answer: 'A',
      status: 'correct',
      time_taken: Math.floor(Math.random() * 90) + 20,
      created_at: new Date().toISOString(),
    });
  }
  
  for (let i = 79; i <= 83; i++) {
    answerLog.push({
      id: i + 1000,
      result_id: 2,
      question_id: i,
      user_id: 'topper-user',
      user_answer: 'B',
      status: 'incorrect',
      time_taken: Math.floor(Math.random() * 90) + 20,
      created_at: new Date().toISOString(),
    });
  }
  
  for (let i = 84; i <= 85; i++) {
    answerLog.push({
      id: i + 1000,
      result_id: 2,
      question_id: i,
      user_id: 'topper-user',
      user_answer: null,
      status: 'skipped',
      time_taken: 0,
      created_at: new Date().toISOString(),
    });
  }

  return answerLog;
}
