'use client'

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  BarChart3,
  PieChart,
  Target,
  Clock,
  PencilLine,
  ListChecks,
} from 'lucide-react';
import KpiCard from './KpiCard';
import AttemptSummaryCard from './AttemptSummaryCard';
import OverviewPanel from './OverviewPanel';
import ChapterPanel from './ChapterPanel';
import DifficultyPanel from './DifficultyPanel';
import ComparisonPanel from './ComparisonPanel';
import { LeaderboardPanel } from './LeaderboardPanel';
import { Database } from '@/types/database';
import { calculateTopperComparison } from '@/utils/analysisCalculations';

// --- Type Definitions ---

type TestResultRow = Database['public']['Tables']['test_results']['Row'] & {
  rank?: number;
  total_test_takers?: number;
}
type AnswerLogRow = Database['public']['Tables']['answer_log']['Row']
type QuestionRow = Database['public']['Tables']['questions']['Row']

export interface PerformanceMetrics {
  marks_obtained: number
  total_marks: number
  percentile: number
  rank: number
  total_test_takers: number
}

export interface SessionResult {
  testResult: TestResultRow & { results: PerformanceMetrics }
  answerLog: AnswerLogRow[]
  questions: QuestionRow[]
  topperResult?: {
    testResult: TestResultRow & { results: PerformanceMetrics }
    answerLog: AnswerLogRow[]
  }
  leaderboard?: any[]
}

export interface NewPerformanceAnalysisDashboardProps {
  sessionResult: SessionResult
  onNavigateToSolutions?: () => void
  className?: string
}

/**
 * NewPerformanceAnalysisDashboard Component
 * Main dashboard component for the next-gen performance analysis page.
 * Implements glassmorphic UI with interactive charts and comprehensive analytics.
 */
const NewPerformanceAnalysisDashboard: React.FC<NewPerformanceAnalysisDashboardProps> = ({
  sessionResult,
  onNavigateToSolutions,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Inject global CSS styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .glass-card {
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        border: 1px solid rgba(226, 232, 240, 0.8);
        border-radius: 1rem;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
        transition: all 0.3s ease;
      }
      .glass-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 32px 0 rgba(31, 38, 135, 0.15);
      }
      .kpi-card {
        position: relative;
        overflow: hidden;
        padding: 1.5rem;
      }
      .kpi-card-icon {
        position: absolute;
        right: -1.5rem;
        bottom: -1rem;
        font-size: 6rem;
        color: rgba(100, 116, 139, 0.08);
        line-height: 1;
        transition: all 0.3s ease;
      }
      .kpi-card.group:hover .kpi-card-icon {
        color: rgba(100, 116, 139, 0.12);
        transform: rotate(-5deg) scale(1.05);
      }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; }
      ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: #64748b; }
      
      .tab-btn {
        transition: all 0.2s ease-in-out;
      }
      .tab-btn.active {
        border-color: #4f46e5;
        color: #4f46e5;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Format timestamp
  const submittedAt = sessionResult?.testResult?.submitted_at;
  const formattedTimestamp = useMemo(() => {
    if (!submittedAt) return 'N/A';
    const date = new Date(submittedAt);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, [submittedAt]);

  // Calculate KPI data
  const kpiData = useMemo(() => {
    const { testResult, answerLog, questions } = sessionResult;
    const { results } = testResult;
    
    const totalCorrect = testResult.total_correct || 0;
    const totalIncorrect = testResult.total_incorrect || 0;
    const totalSkipped = testResult.total_skipped || 0;
    const totalQuestions = questions.length;
    const attempted = totalCorrect + totalIncorrect;
    
    // Calculate accuracy
    const accuracy = attempted > 0 ? ((totalCorrect / attempted) * 100).toFixed(1) : '0.0';
    
    // Calculate attempt rate
    const attemptRate = totalQuestions > 0 ? ((attempted / totalQuestions) * 100).toFixed(1) : '0.0';
    
    // Format time taken (convert seconds to HH:MM)
    const formatTime = (seconds: number | null | undefined): string => {
      if (!seconds) return '00:00';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
    
    const timeTaken = formatTime(testResult.total_time_taken);
    // Note: time_limit might not exist on testResult, using a default of 3 hours (10800 seconds)
    const totalTime = '03:00'; // Default to 3 hours as shown in design
    
    return {
      score: results.marks_obtained.toFixed(2),
      totalMarks: results.total_marks,
      rank: results.rank,
      totalTestTakers: results.total_test_takers.toLocaleString(),
      percentile: results.percentile.toFixed(1),
      accuracy,
      attemptedCount: attempted,
      timeTaken,
      totalTime,
      correct: totalCorrect,
      incorrect: totalIncorrect,
      skipped: totalSkipped,
      attemptRate,
      totalQuestions,
    };
  }, [sessionResult]);

  // Calculate difficulty breakdown
  const difficultyBreakdown = useMemo(() => {
    const breakdown = {
      easy: { correct: 0, incorrect: 0, skipped: 0 },
      medium: { correct: 0, incorrect: 0, skipped: 0 },
      hard: { correct: 0, incorrect: 0, skipped: 0 }
    };

    const questionMap = new Map<number, QuestionRow>();
    sessionResult.questions.forEach(q => {
      questionMap.set(q.id, q);
    });

    sessionResult.answerLog.forEach(answer => {
      const question = questionMap.get(answer.question_id);
      if (!question || !question.difficulty) return;

      // Map difficulty levels
      let level: 'easy' | 'medium' | 'hard';
      const diff = question.difficulty.toLowerCase();
      if (diff.includes('easy')) {
        level = 'easy';
      } else if (diff.includes('moderate') || diff.includes('medium')) {
        level = 'medium';
      } else {
        level = 'hard';
      }

      if (answer.status === 'correct') breakdown[level].correct++;
      else if (answer.status === 'incorrect') breakdown[level].incorrect++;
      else breakdown[level].skipped++;
    });

    return breakdown;
  }, [sessionResult]);

  // Calculate topper comparison data using utility function
  const comparisonData = useMemo(() => {
    const userOverallAccuracy = sessionResult.testResult.accuracy || 0;
    const topperOverallAccuracy = sessionResult.topperResult?.testResult.accuracy || 0;
    
    return calculateTopperComparison(
      sessionResult.answerLog,
      sessionResult.topperResult?.answerLog,
      sessionResult.questions,
      userOverallAccuracy,
      topperOverallAccuracy
    );
  }, [sessionResult]);

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'chapters', label: 'Chapter-wise' },
    { id: 'difficulty', label: 'Difficulty' },
    { id: 'comparison', label: 'Topper Comparison' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ];

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Header Section */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Performance Analysis</h1>
          <p className="text-sm text-slate-500 mt-1">Submitted at: {formattedTimestamp}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={onNavigateToSolutions}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-indigo-400/50 transition-all duration-300 ease-in-out"
          >
            View Solution
          </button>
        </div>
      </header>

      {/* KPI Dashboard Section */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          <KpiCard
            title="Score"
            value={kpiData.score}
            subtext={`/ ${kpiData.totalMarks}`}
            icon={Award}
            isPrimary
          />
          <KpiCard
            title="Rank"
            value={`#${kpiData.rank}`}
            subtext={`/ ${kpiData.totalTestTakers}`}
            icon={BarChart3}
            isPrimary
          />
          <KpiCard
            title="Percentile"
            value={`${kpiData.percentile}%`}
            subtext={`Top ${(100 - parseFloat(kpiData.percentile)).toFixed(1)}%`}
            icon={PieChart}
            isPrimary
          />
          <KpiCard
            title="Accuracy"
            value={`${kpiData.accuracy}%`}
            subtext={`${kpiData.correct} / ${kpiData.attemptedCount} Attempted`}
            icon={Target}
            isPrimary
          />
          <KpiCard
            title="Time Taken"
            value={kpiData.timeTaken}
            subtext={`/ ${kpiData.totalTime} Hrs`}
            icon={Clock}
            isPrimary
          />
          
          <AttemptSummaryCard
            correct={kpiData.correct}
            incorrect={kpiData.incorrect}
            skipped={kpiData.skipped}
          />
          
          <KpiCard
            title="Attempt Rate"
            value={`${kpiData.attemptRate}%`}
            subtext={`${kpiData.attemptedCount} / ${kpiData.totalQuestions} Att.`}
            icon={PencilLine}
          />
          <KpiCard
            title="Questions"
            value={kpiData.totalQuestions.toString()}
            subtext="Total"
            icon={ListChecks}
          />
        </div>
      </section>

      {/* Tabbed Analysis Section */}
      <section className="glass-card p-4 sm:p-6">
        {/* Tab Navigation */}
        <nav className="flex flex-wrap border-b border-slate-200" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`btn-${tab.id}`}
              className={`tab-btn -mb-px p-3 sm:p-4 border-b-2 border-transparent text-sm sm:text-base font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-300 ${activeTab === tab.id ? 'active' : ''}`}
              aria-controls={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Panels */}
        <div className="pt-6">
          {activeTab === 'overview' && (
            <OverviewPanel
              correct={kpiData.correct}
              incorrect={kpiData.incorrect}
              skipped={kpiData.skipped}
            />
          )}
          {activeTab === 'chapters' && (
            <ChapterPanel
              answerLog={sessionResult.answerLog}
              questions={sessionResult.questions}
            />
          )}
          {activeTab === 'difficulty' && (
            <DifficultyPanel
              breakdown={difficultyBreakdown}
            />
          )}
          {activeTab === 'comparison' && (
            <ComparisonPanel
              comparisonData={comparisonData}
            />
          )}
          {activeTab === 'leaderboard' && (
            <LeaderboardPanel
              testId={sessionResult.testResult.mock_test_id}
              currentUserId={sessionResult.testResult.user_id}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default NewPerformanceAnalysisDashboard;
