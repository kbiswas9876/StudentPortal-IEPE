/**
 * Generates a color from red to green based on a percentage value.
 * @param value - The current value.
 * @param minValue - The minimum possible value (e.g., 0).
 * @param maxValue - The maximum possible value (e.g., 100).
 * @returns An HSL color string (e.g., 'hsl(120, 90%, 45%)').
 */
const getPerformanceColor = (value: number, minValue: number = 0, maxValue: number = 100): string => {
  // Clamp the value to ensure it's within the min/max range
  const clampedValue = Math.max(minValue, Math.min(value, maxValue));

  // Normalize the value to a 0-1 range
  const percentage = (clampedValue - minValue) / (maxValue - minValue);

  // Map the percentage to a hue value between 0 (Red) and 120 (Green)
  const hue = percentage * 120;

  // We use fixed saturation and lightness for a consistent color palette
  const saturation = 90;
  const lightness = 45;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// --- Specific functions for Score and Percentile ---

/**
 * Calculates the color for the score based on marks obtained vs total marks.
 */
export const getScoreColor = (marksObtained: number, totalMarks: number): string => {
  if (totalMarks === 0) return 'hsl(0, 90%, 45%)'; // Default to red if totalMarks is 0
  const scorePercentage = (marksObtained / totalMarks) * 100;
  return getPerformanceColor(scorePercentage);
};

/**
 * Calculates the color for the percentile with a defined floor value.
 * Any percentile below the floor will be shown in absolute red.
 * High percentiles (100% or higher) will use deep green.
 */
export const getPercentileColor = (percentile: number): string => {
  const PERCENTILE_FLOOR = 40; // You can adjust this threshold

  if (percentile < PERCENTILE_FLOOR) {
    return 'hsl(0, 90%, 45%)'; // Absolute Red
  }

  // Use deep green for 100% or higher percentiles
  if (percentile >= 100) {
    return 'hsl(120, 95%, 25%)'; // Deep Green
  }

  // The color scale will apply from the floor (40) to 100
  return getPerformanceColor(percentile, PERCENTILE_FLOOR, 100);
};

// --- Dynamic Performance Gradient System ---

/**
 * Performance styles interface for dynamic gradient backgrounds and text colors
 */
export interface PerformanceStyles {
  backgroundGradient: string;
  textColor: string;
}

/**
 * Returns performance-based gradient background and text color based on score percentage.
 * 
 * Performance tiers:
 * - 0-40%: Low performance (red range)
 * - 41-70%: Mid performance (yellow/amber range)
 * - 71-100%: High performance (green range)
 * 
 * @param scorePercentage - The performance percentage (0-100)
 * @returns Object containing backgroundGradient and textColor
 */
export function getPerformanceStyles(scorePercentage: number): PerformanceStyles {
  // Clamp percentage to 0-100 range
  const clampedPercentage = Math.max(0, Math.min(100, scorePercentage));

  if (clampedPercentage <= 40) {
    // Low performance (0-40%): Red range
    return {
      backgroundGradient: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 50%, #FEF2F2 100%)',
      textColor: '#DC2626'
    };
  } else if (clampedPercentage <= 70) {
    // Mid performance (41-70%): Yellow/Amber range
    return {
      backgroundGradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FFFBEB 100%)',
      textColor: '#D97706'
    };
  } else {
    // High performance (71-100%): Green range
    return {
      backgroundGradient: 'linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 50%, #F0FDF4 100%)',
      textColor: '#059669'
    };
  }
}