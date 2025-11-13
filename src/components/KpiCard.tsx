import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  isPrimary?: boolean;
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
  isPrimary = false 
}) => {
  const IconComponent = icon;
  const primaryClasses = isPrimary ? 'border-2 border-indigo-200' : '';
  const titleColor = isPrimary ? 'text-indigo-800' : 'text-slate-700';
  const valueColor = isPrimary ? 'text-indigo-600' : 'text-slate-800';
  const subtextColor = isPrimary ? 'text-indigo-500' : 'text-slate-500';

  return (
    <div className={`glass-card group kpi-card lg:col-span-1 ${primaryClasses}`}>
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
