import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  isPrimary?: boolean;
  isLoading?: boolean;
}

/**
 * KPI Card Component
 * A reusable card for displaying key performance indicators with glassmorphism styling.
 * Matches the exact design from NewAnalysisPageDesignUIOnly.txt
 */
const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  subtext, 
  icon, 
  isPrimary = false,
  isLoading = false
}) => {
  const IconComponent = icon;
  const primaryClasses = isPrimary ? 'border-2 border-indigo-200' : '';
  const titleColor = isPrimary ? 'text-indigo-800' : 'text-slate-700';
  const valueColor = isPrimary ? 'text-indigo-600' : 'text-slate-800';
  const subtextColor = isPrimary ? 'text-indigo-500' : 'text-slate-500';

  return (
    <div className={`glass-card group kpi-card lg:col-span-1 ${primaryClasses} ${isLoading ? 'relative' : ''}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs text-indigo-600 font-medium">Updating...</span>
          </div>
        </div>
      )}
      <div className="flex flex-col h-full">
        <h3 className={`text-sm font-medium ${titleColor}`}>{title}</h3>
        <p className={`text-3xl font-bold ${valueColor} mt-2`}>{value}</p>
        <p className={`text-sm ${subtextColor} mt-auto`}>{subtext}</p>
      </div>
      <div className="kpi-card-icon">
        <IconComponent size="100%" />
      </div>
    </div>
  );
};

export default KpiCard;
