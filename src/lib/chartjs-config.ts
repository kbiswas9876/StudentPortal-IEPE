/**
 * Chart.js Configuration
 * Registers all necessary Chart.js components at application level
 * This file should be imported once at the root of the application
 */

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'

// Register Chart.js components globally
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
)

export default ChartJS
