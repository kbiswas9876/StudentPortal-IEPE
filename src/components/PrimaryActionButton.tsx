'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export interface PrimaryActionButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  className?: string;
}

/**
 * PrimaryActionButton
 * A prominent floating action button fixed at the bottom-right of the viewport.
 * - Default label: "View Solutions" with an Eye icon to the left
 * - Uses Tailwind CSS and supports dark mode
 * - On click: optionally triggers provided onClick, then navigates to the Solution Review page
 * - Reads resultId from the current /analysis/[resultId] route via useParams()
 */
const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  onClick,
  label = 'View Solutions',
  className
}) => {
  const router = useRouter();
  const params = useParams() as { resultId?: string | string[] } | null;
  const rawResultId = params?.resultId;
  const resultId = Array.isArray(rawResultId) ? rawResultId[0] : rawResultId;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Allow parent handlers to run first; if they call event.preventDefault(), skip navigation
    if (onClick) {
      try {
        onClick(event);
      } catch (err) {
        // Keep navigation resilient if external handler throws
        console.error('PrimaryActionButton onClick error:', err);
      }
    }
    if (event.defaultPrevented) return;

    const target = resultId
      ? `/analysis/${encodeURIComponent(resultId)}/solutions`
      : '/analysis';

    router.push(target);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label}
      aria-label={label}
      className={[
        // Positioning
        'fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50',
        // Base style with gradient
        'inline-flex items-center gap-2.5 rounded-full',
        'bg-gradient-to-r from-indigo-600 to-purple-600',
        'hover:from-indigo-700 hover:to-purple-700',
        'text-white',
        'px-6 py-3.5 sm:px-7 sm:py-4',
        // Effects
        'shadow-xl hover:shadow-2xl transition-all duration-300',
        'hover:scale-105 active:scale-95',
        'focus:outline-none',
        'focus-visible:ring-4 focus-visible:ring-indigo-500/50',
        'focus-visible:ring-offset-2 dark:ring-offset-slate-900',
        // Animation
        'group relative overflow-hidden',
        // Responsive text weight
        'font-bold text-sm sm:text-base',
        className || ''
      ].join(' ')}
      data-testid="primary-action-button"
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      
      <Eye className="h-5 w-5 sm:h-6 sm:w-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" aria-hidden="true" />
      <span className="relative z-10">{label}</span>
      
      {/* Pulse ring effect */}
      <div className="absolute inset-0 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300"></div>
    </button>
  );
};

export default PrimaryActionButton;