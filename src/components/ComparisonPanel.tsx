import React from 'react';
import { Radar } from 'react-chartjs-2';

interface ComparisonData {
  labels: string[]; // Chapter names + 'Overall'
  userScores: number[]; // Accuracy percentages
  topperScores: number[]; // Accuracy percentages
}

interface ComparisonPanelProps {
  comparisonData: ComparisonData | null;
}

// Global Chart Config
const chartDefaultFont = {
  family: 'Inter, sans-serif',
  weight: 500 as const
};
const chartDefaultColor = '#334155'; // slate-700
const chartGridColor = '#e2e8f0'; // slate-200

const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ comparisonData }) => {
  // Handle null case when topper data unavailable
  if (!comparisonData) {
    return (
      <div role="tabpanel" aria-labelledby="tab-comparison">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Topper Comparison</h2>
        <div className="flex items-center justify-center h-80 md:h-96">
          <p className="text-slate-500 text-center">
            Topper comparison data is not available for this test.
          </p>
        </div>
      </div>
    );
  }

  const data = {
    labels: comparisonData.labels,
    datasets: [
      {
        label: 'You',
        data: comparisonData.userScores,
        backgroundColor: 'rgba(79, 70, 229, 0.7)', // indigo
        borderColor: '#4f46e5',
        borderWidth: 2,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4
      },
      {
        label: 'Topper',
        data: comparisonData.topperScores,
        backgroundColor: 'rgba(20, 184, 166, 0.7)', // teal
        borderColor: '#14b8a6',
        borderWidth: 2,
        pointBackgroundColor: '#14b8a6',
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        grid: { color: chartGridColor },
        angleLines: { color: chartGridColor },
        pointLabels: {
          font: {
            size: 13,
            weight: 600 as const,
            family: 'Inter, sans-serif'
          },
          color: chartDefaultColor
        }
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
    <div role="tabpanel" aria-labelledby="tab-comparison">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Topper Comparison</h2>
      <div className="h-80 md:h-96">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
};

export default ComparisonPanel;
