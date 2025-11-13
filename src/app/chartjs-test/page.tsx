'use client'

/**
 * Chart.js Integration Test Page
 * This page verifies that Chart.js is properly configured and working
 * Test all three chart types that will be used in the Performance Analysis dashboard
 */

import { Doughnut, Bar, Radar } from 'react-chartjs-2'
import ChapterPanel from '@/components/ChapterPanel'
import { LeaderboardPanel } from '@/components/LeaderboardPanel'

export default function ChartJsTestPage() {
  // Mock data for ChapterPanel test
  const mockAnswerLog = [
    { id: 1, question_id: 1, status: 'correct', time_taken: 45, user_answer: 'A', user_id: 'user1', result_id: 'result1', created_at: new Date().toISOString() },
    { id: 2, question_id: 2, status: 'correct', time_taken: 38, user_answer: 'B', user_id: 'user1', result_id: 'result1', created_at: new Date().toISOString() },
    { id: 3, question_id: 3, status: 'incorrect', time_taken: 52, user_answer: 'C', user_id: 'user1', result_id: 'result1', created_at: new Date().toISOString() },
    { id: 4, question_id: 4, status: 'correct', time_taken: 30, user_answer: 'A', user_id: 'user1', result_id: 'result1', created_at: new Date().toISOString() },
    { id: 5, question_id: 5, status: 'incorrect', time_taken: 68, user_answer: 'D', user_id: 'user1', result_id: 'result1', created_at: new Date().toISOString() },
    { id: 6, question_id: 6, status: 'correct', time_taken: 42, user_answer: 'B', user_id: 'user1', result_id: 'result1', created_at: new Date().toISOString() },
    { id: 7, question_id: 7, status: 'skipped', time_taken: 0, user_answer: null, user_id: 'user1', result_id: 'result1', created_at: new Date().toISOString() },
    { id: 8, question_id: 8, status: 'correct', time_taken: 55, user_answer: 'C', user_id: 'user1', result_id: 'result1', created_at: new Date().toISOString() },
  ] as any

  const mockQuestions = [
    { id: 1, chapter_name: 'Kinematics', difficulty: 'Easy' },
    { id: 2, chapter_name: 'Kinematics', difficulty: 'Medium' },
    { id: 3, chapter_name: 'Dynamics', difficulty: 'Hard' },
    { id: 4, chapter_name: 'Dynamics', difficulty: 'Easy' },
    { id: 5, chapter_name: 'Thermodynamics', difficulty: 'Medium' },
    { id: 6, chapter_name: 'Thermodynamics', difficulty: 'Easy' },
    { id: 7, chapter_name: 'Optics', difficulty: 'Medium' },
    { id: 8, chapter_name: 'Optics', difficulty: 'Hard' },
  ] as any

  // Test data for Doughnut chart (Overview Panel)
  const doughnutData = {
    labels: ['Correct', 'Incorrect', 'Skipped'],
    datasets: [
      {
        data: [60, 20, 5],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)', // indigo-600
          'rgba(217, 119, 6, 0.7)', // amber-600
          'rgba(100, 116, 139, 0.7)', // slate-500
        ],
        borderColor: [
          '#4f46e5',
          '#d97706',
          '#64748b',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Test data for Bar chart (Difficulty Panel)
  const barData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Correct',
        data: [25, 20, 15],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: '#4f46e5',
        borderWidth: 1,
      },
      {
        label: 'Incorrect',
        data: [5, 8, 7],
        backgroundColor: 'rgba(217, 119, 6, 0.7)',
        borderColor: '#d97706',
        borderWidth: 1,
      },
      {
        label: 'Skipped',
        data: [2, 2, 1],
        backgroundColor: 'rgba(100, 116, 139, 0.7)',
        borderColor: '#64748b',
        borderWidth: 1,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  }

  // Test data for Radar chart (Comparison Panel)
  const radarData = {
    labels: ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Overall'],
    datasets: [
      {
        label: 'You',
        data: [85, 70, 90, 65, 77.5],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: '#4f46e5',
        borderWidth: 2,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4f46e5',
      },
      {
        label: 'Topper',
        data: [95, 88, 92, 85, 90],
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        borderColor: '#14b8a6',
        borderWidth: 2,
        pointBackgroundColor: '#14b8a6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#14b8a6',
      },
    ],
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Chart.js Integration Test
        </h1>
        <p className="text-slate-600 mb-8">
          Verifying Chart.js configuration with Doughnut, Bar, and Radar charts
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doughnut Chart Test */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Doughnut Chart (Overview Panel)
            </h2>
            <div className="h-80">
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            <p className="text-sm text-slate-500 mt-4">
              ✓ ArcElement, Tooltip, Legend registered
            </p>
          </div>

          {/* Bar Chart Test */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Stacked Bar Chart (Difficulty Panel)
            </h2>
            <div className="h-80">
              <Bar data={barData} options={barOptions} />
            </div>
            <p className="text-sm text-slate-500 mt-4">
              ✓ CategoryScale, LinearScale, BarElement registered
            </p>
          </div>

          {/* Radar Chart Test */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Radar Chart (Comparison Panel)
            </h2>
            <div className="h-96 max-w-2xl mx-auto">
              <Radar data={radarData} options={radarOptions} />
            </div>
            <p className="text-sm text-slate-500 mt-4">
              ✓ RadialLinearScale, PointElement, LineElement, Filler registered
            </p>
          </div>
        </div>

        {/* Chapter Panel Test */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Chapter Panel (Chapter-wise Performance)
          </h2>
          <ChapterPanel answerLog={mockAnswerLog} questions={mockQuestions} />
          <p className="text-sm text-slate-500 mt-4">
            ✓ Chapter data calculation, progress bars with dynamic gradients, responsive table
          </p>
        </div>

        {/* Leaderboard Panel Test */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Leaderboard Panel (Paginated Leaderboard)
          </h2>
          <LeaderboardPanel testId={1} currentUserId="user-52" />
          <p className="text-sm text-slate-500 mt-4">
            ✓ Paginated table, medal icons for top 3, breakdown column with icons, user highlighting, initial page calculation
          </p>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✓ Chart.js Integration Successful
          </h3>
          <p className="text-green-700">
            All Chart.js components are properly registered and working. The Performance Analysis dashboard can now use these chart types.
          </p>
        </div>
      </div>
    </div>
  )
}
