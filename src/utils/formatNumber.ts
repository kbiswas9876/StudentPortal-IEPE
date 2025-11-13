/**
 * Format a number to show integers without decimals,
 * and numbers with decimals up to 2 decimal places.
 * 
 * Examples:
 * - 85 -> "85"
 * - 85.0 -> "85"
 * - 85.5 -> "85.5"
 * - 85.67 -> "85.67"
 * - 85.678 -> "85.68"
 */
export function formatNumber(value: number): string {
  // Check if the number is an integer (no decimal part)
  if (Number.isInteger(value)) {
    return value.toString();
  }
  
  // Round to 2 decimal places
  const rounded = Math.round(value * 100) / 100;
  
  // Check if after rounding it becomes an integer
  if (Number.isInteger(rounded)) {
    return rounded.toString();
  }
  
  // Return with up to 2 decimal places, removing trailing zeros
  return rounded.toFixed(2).replace(/\.?0+$/, '');
}

/**
 * Format a percentage value (0-100)
 * Same logic as formatNumber but ensures it's treated as a percentage
 */
export function formatPercentage(value: number): string {
  return formatNumber(value);
}

/**
 * Format a score value
 * Same logic as formatNumber
 */
export function formatScore(value: number): string {
  return formatNumber(value);
}
