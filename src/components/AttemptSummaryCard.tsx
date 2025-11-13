import React from 'react';
import { CheckCheck } from 'lucide-react';

interface AttemptSummaryCardProps {
  correct: number;
  incorrect: number;
  skipped: number;
}

/**
 * Attempt Summary Card Component
 * A specialized card for displaying correct/incorrect/skipped breakdown.
 * Matches the exact design from NewAnalysisPageDesignUIOnly.txt
 */
const AttemptSummaryCard: React.FC<AttemptSummaryCardProps> = ({ 
  correct, 
  incorrect, 
  skipped 
}) => {
  return (
    <div className="glass-card group kpi-card col-span-2 sm:col-span-3 lg:col-span-2">
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-medium text-slate-700">Attempt Summary</h3>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-indigo-600">{correct}</p>
            <p className="text-xs text-indigo-500">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{incorrect}</p>
            <p className="text-xs text-amber-500">Incorrect</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-600">{skipped}</p>
            <p className="text-xs text-slate-500">Skipped</p>
          </div>
        </div>
      </div>
      <div className="kpi-card-icon">
        <CheckCheck size="100%" />
      </div>
    </div>
  );
};

export default AttemptSummaryCard;
