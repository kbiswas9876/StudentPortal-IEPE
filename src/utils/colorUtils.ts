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
 */
export const getPercentileColor = (percentile: number): string => {
  const PERCENTILE_FLOOR = 40; // You can adjust this threshold

  if (percentile < PERCENTILE_FLOOR) {
    return 'hsl(0, 90%, 45%)'; // Absolute Red
  }

  // The color scale will apply from the floor (40) to 100
  return getPerformanceColor(percentile, PERCENTILE_FLOOR, 100);
};
