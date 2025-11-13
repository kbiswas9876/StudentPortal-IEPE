import React from 'react';
import { Bar } from 'react-chartjs-2';

interface DifficultyBreakdown {
  easy: { correct: number; incorrect: number; skipped: number };
  medium: { correct: number; incorrect: number; skipped: number };
  hard: { correct: number; incorrect: number; skipped: number };
}

interface DifficultyPanelProps {
  breakdown: DifficultyBreakdown;
}

// Global Chart Config
const chartDefaultFont = {
  family: 'Inter, sans-serif',
  weight: 500
};
const chartDefaultColor = '#334155'; // slate-700
const chartGridColor = '#e2e8f0'; // slate-200

const DifficultyPanel: React.FC<DifficultyPanelProps> = ({ breakdown }) => {
  const data = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Correct',
        data: [breakdown.easy.correct, breakdown.medium.correct, breakdown.hard.correct],
        backgroundColor: 'rgba(79, 70, 229, 0.7)', // indigo-600
        borderColor: '#4f46e5',
        borderWidth: 1
      },
      {
        label: 'Incorrect',
        data: [breakdown.easy.incorrect, breakdown.medium.incorrect, breakdown.hard.incorrect],
        backgroundColor: 'rgba(217, 119, 6, 0.7)', // amber-600
        borderColor: '#d97706',
        borderWidth: 1
      },
      {
        label: 'Skipped',
        data: [breakdown.easy.skipped, breakdown.medium.skipped, breakdown.hard.skipped],
        backgroundColor: 'rgba(100, 116, 139, 0.7)', // slate-500
        borderColor: '#64748b',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: chartDefaultColor, font: chartDefaultFont }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { color: chartDefaultColor, font: chartDefaultFont }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: chartDefaultColor,
          font: chartDefaultFont
        }
      }
    }
  };

  return (
    <div role="tabpanel" aria-labelledby="tab-difficulty">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Difficulty-wise Performance</h2>
      <div className="h-80 md:h-96">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default DifficultyPanel;
