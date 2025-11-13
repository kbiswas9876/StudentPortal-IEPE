import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface OverviewPanelProps {
  correct: number;
  incorrect: number;
  skipped: number;
}

const OverviewPanel: React.FC<OverviewPanelProps> = ({ correct, incorrect, skipped }) => {
  const data = {
    labels: ['Correct', 'Incorrect', 'Skipped'],
    datasets: [{
      data: [correct, incorrect, skipped],
      backgroundColor: [
        'rgba(79, 70, 229, 0.7)',  // indigo-600
        'rgba(217, 119, 6, 0.7)',   // amber-600
        'rgba(100, 116, 139, 0.7)' // slate-500
      ],
      borderColor: [
        '#4f46e5', // indigo-600
        '#d97706', // amber-600
        '#64748b'  // slate-500
      ],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div role="tabpanel" aria-labelledby="tab-overview">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Question Breakdown</h2>
      <div className="h-64 md:h-80">
        <Doughnut data={data} options={options} />
      </div>
      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center items-center space-x-4 md:space-x-6 mt-6">
        <div className="flex items-center space-x-2">
          <span className="w-4 h-3 rounded-sm bg-indigo-600"></span>
          <span className="text-slate-600 text-sm font-medium">Correct: {correct}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-3 rounded-sm bg-amber-600"></span>
          <span className="text-slate-600 text-sm font-medium">Incorrect: {incorrect}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-3 rounded-sm bg-slate-500"></span>
          <span className="text-slate-600 text-sm font-medium">Skipped: {skipped}</span>
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
