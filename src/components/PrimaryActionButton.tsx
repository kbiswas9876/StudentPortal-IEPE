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
        // Base style
        'inline-flex items-center gap-2 rounded-full bg-blue-600 text-white',
        'px-5 py-3 sm:px-6 sm:py-3.5',
        // Effects
        'shadow-lg hover:shadow-xl transition-all duration-200',
        'hover:bg-blue-700 focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-blue-500',
        'focus-visible:ring-offset-2 dark:ring-offset-slate-900',
        // Responsive text weight
        'font-semibold',
        className || ''
      ].join(' ')}
      data-testid="primary-action-button"
    >
      <Eye className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

export default PrimaryActionButton;