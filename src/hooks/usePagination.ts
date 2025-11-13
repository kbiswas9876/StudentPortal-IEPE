import { useMemo } from 'react';

export const DOTS = '...';

interface UsePaginationProps {
  totalPages: number;
  currentPage: number;
  siblingCount?: number;
}

export const usePagination = ({ 
  totalPages, 
  currentPage, 
  siblingCount = 1 
}: UsePaginationProps): (number | string)[] => {
  const paginationRange = useMemo(() => {
    // Pages to show: 1 (current) + 2*siblingCount + 1 (first) + 1 (last) + 2 (dots)
    const totalPageNumbersToShow = siblingCount + 5;

    // Case 1: If total pages is less than the number we want to show, show all.
    if (totalPages <= totalPageNumbersToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPages];
    }

    // Case 3: Left dots, but no right dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
    
    // Fallback (should be covered)
    return Array.from({ length: totalPages }, (_, i) => i + 1);

  }, [totalPages, currentPage, siblingCount]);

  return paginationRange || [];
};
