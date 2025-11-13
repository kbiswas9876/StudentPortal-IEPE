# Requirements Document

## Introduction

This document outlines the requirements for implementing a next-generation Performance Analysis page that provides students with comprehensive insights into their mock test performance. The feature will replace the existing analysis dashboard with a modern, glassmorphic UI featuring interactive charts, detailed breakdowns, and competitive elements like leaderboards and topper comparisons.

**UI Design Source:** The complete UI/UX specification is defined in `NewAnalysisPageDesignUIOnly.txt`. This file contains a fully functional React component with hardcoded data that serves as the definitive design specification. All UI components, styling, animations, and interactions defined in this file must be replicated pixel-perfectly in the final implementation.

## Glossary

- **Performance Analysis System**: The complete system that displays test results, analytics, and insights to students
- **KPI Card**: Key Performance Indicator card displaying a single metric with visual styling
- **Glassmorphism**: A UI design style using frosted glass effects with backdrop blur
- **Session Result**: The complete data structure containing test results, answer logs, and questions
- **Topper**: The student with the highest score in a given mock test
- **Leaderboard**: A ranked list of all students who took the same mock test
- **Chapter-wise Performance**: Performance metrics broken down by subject chapters
- **Difficulty Breakdown**: Performance metrics categorized by question difficulty levels
- **Answer Log**: Record of all student answers for a test session
- **Mock Test**: A timed practice test simulating real exam conditions

## Requirements

### Requirement 1: Display Performance Overview Dashboard

**User Story:** As a student, I want to see my overall test performance at a glance, so that I can quickly understand how well I performed.

#### Acceptance Criteria

1. WHEN the Performance Analysis System loads, THE System SHALL display a header showing "Performance Analysis" and the test submission timestamp formatted as specified in NewAnalysisPageDesignUIOnly.txt
2. WHEN the Performance Analysis System renders the dashboard, THE System SHALL display eight KPI cards using the KpiCard and AttemptSummaryCard components exactly as defined in NewAnalysisPageDesignUIOnly.txt
3. WHEN the Performance Analysis System displays KPI cards, THE System SHALL apply the exact glassmorphism styling defined in the .glass-card and .kpi-card CSS classes from NewAnalysisPageDesignUIOnly.txt
4. WHEN the Performance Analysis System shows KPI cards, THE System SHALL implement hover animations with translateY(-5px) and shadow transitions as specified in NewAnalysisPageDesignUIOnly.txt
5. WHEN the Performance Analysis System displays the Score card, THE System SHALL use the Award icon from lucide-react and populate with dynamic marks_obtained and total_marks from Session Result
6. WHEN the Performance Analysis System displays the Rank card, THE System SHALL use the BarChart3 icon and populate with dynamic rank and total_test_takers from Session Result
7. WHEN the Performance Analysis System displays the Attempt Summary card, THE System SHALL use the CheckCheck icon and show correct, incorrect, and skipped counts in a 3-column grid as specified in NewAnalysisPageDesignUIOnly.txt

### Requirement 2: Provide Interactive Chart Visualizations

**User Story:** As a student, I want to see visual representations of my performance data, so that I can better understand my strengths and weaknesses.

#### Acceptance Criteria

1. WHEN the Performance Analysis System displays the Overview tab, THE System SHALL render a Doughnut chart using the OverviewPanel component structure from NewAnalysisPageDesignUIOnly.txt with dynamic data replacing hardcoded [60, 20, 5]
2. WHEN the Performance Analysis System displays the Doughnut chart, THE System SHALL use the exact color scheme: indigo-600 (rgba(79, 70, 229, 0.7)) for correct, amber-600 (rgba(217, 119, 6, 0.7)) for incorrect, and slate-500 (rgba(100, 116, 139, 0.7)) for skipped
3. WHEN the Performance Analysis System displays the Difficulty tab, THE System SHALL render a stacked Bar chart using the DifficultyPanel component from NewAnalysisPageDesignUIOnly.txt with dynamic data for Easy, Medium, and Hard levels
4. WHEN the Performance Analysis System displays the Topper Comparison tab, THE System SHALL render a Radar chart using the ComparisonPanel component from NewAnalysisPageDesignUIOnly.txt with dynamic chapter-wise accuracy data
5. WHEN the Performance Analysis System renders charts, THE System SHALL register Chart.js components (ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Filler) as specified in NewAnalysisPageDesignUIOnly.txt
6. WHEN the Performance Analysis System displays chart options, THE System SHALL use chartDefaultFont (Inter, weight 500), chartDefaultColor (#334155), and chartGridColor (#e2e8f0) as defined in NewAnalysisPageDesignUIOnly.txt

### Requirement 3: Show Chapter-wise Performance Breakdown

**User Story:** As a student, I want to see how I performed in each chapter, so that I can identify which topics need more practice.

#### Acceptance Criteria

1. WHEN the Performance Analysis System displays the Chapter-wise tab, THE System SHALL render the ChapterPanel component structure from NewAnalysisPageDesignUIOnly.txt with a 12-column grid layout
2. WHEN the Performance Analysis System displays chapter metrics, THE System SHALL show chapter name (col-span-4), accuracy with progress bar (col-span-3), correct count (col-span-2), incorrect count (col-span-2), and average time per question (col-span-1)
3. WHEN the Performance Analysis System displays the chapter table header, THE System SHALL use uppercase text-xs font-semibold text-slate-500 styling as specified in NewAnalysisPageDesignUIOnly.txt
4. WHEN the Performance Analysis System displays accuracy progress bars, THE System SHALL use h-1.5 rounded-full bars on slate-200 background as specified in NewAnalysisPageDesignUIOnly.txt
5. WHERE accuracy is greater than or equal to 85%, THE System SHALL apply gradient 'linear-gradient(to right, #2dd4bf, #0d9488)' (teal gradient)
6. WHERE accuracy is between 60% and 84%, THE System SHALL apply gradient 'linear-gradient(to right, #fbbf24, #d97706)' (yellow-amber gradient)
7. WHERE accuracy is less than 60%, THE System SHALL apply gradient 'linear-gradient(to right, #f87171, #dc2626)' (red gradient)

### Requirement 4: Enable Topper Comparison Analysis

**User Story:** As a student, I want to compare my performance with the top scorer, so that I can understand the performance gap and improve.

#### Acceptance Criteria

1. WHEN the Performance Analysis System identifies a topper for the mock test, THE System SHALL fetch topper's answer log and performance metrics from the backend API
2. WHEN the Performance Analysis System displays the Topper Comparison tab, THE System SHALL render the ComparisonPanel component from NewAnalysisPageDesignUIOnly.txt with a Radar chart
3. WHEN the Performance Analysis System renders the Radar chart, THE System SHALL use two datasets: 'You' with indigo colors (rgba(79, 70, 229, 0.7), #4f46e5) and 'Topper' with teal colors (rgba(20, 184, 166, 0.7), #14b8a6) as specified in NewAnalysisPageDesignUIOnly.txt
4. WHEN the Performance Analysis System configures the Radar chart, THE System SHALL set scales.r.beginAtZero to true, max to 100, and use chartGridColor for grid and angleLines as specified in NewAnalysisPageDesignUIOnly.txt
5. WHEN the Performance Analysis System displays comparison data, THE System SHALL calculate chapter-wise accuracy percentages for both user and topper using existing backend logic
6. WHEN the Performance Analysis System renders Radar chart labels, THE System SHALL use font size 13, weight 600, family Inter as specified in NewAnalysisPageDesignUIOnly.txt
7. IF no topper data is available, THEN THE System SHALL display an appropriate message indicating comparison is unavailable

### Requirement 5: Implement Paginated Leaderboard

**User Story:** As a student, I want to see where I rank among all test takers, so that I can gauge my competitive standing.

#### Acceptance Criteria

1. WHEN the Performance Analysis System displays the Leaderboard tab, THE System SHALL render the LeaderboardPanel component structure from NewAnalysisPageDesignUIOnly.txt with a table showing rank, name, score, breakdown, and time taken
2. WHEN the Performance Analysis System displays the leaderboard, THE System SHALL highlight the current user's row with bg-indigo-50 background and border-l-4 border-indigo-500 as specified in NewAnalysisPageDesignUIOnly.txt
3. WHEN the Performance Analysis System shows top 3 ranks, THE System SHALL display Medal icons from lucide-react with colors: gold (text-yellow-500), silver (text-slate-500), bronze (text-orange-600) as specified in NewAnalysisPageDesignUIOnly.txt
4. WHEN the Performance Analysis System renders leaderboard data, THE System SHALL implement pagination with 10 items per page
5. WHEN the Performance Analysis System displays pagination controls, THE System SHALL use the exact usePagination hook implementation from NewAnalysisPageDesignUIOnly.txt with siblingCount parameter
6. WHEN the Performance Analysis System loads the leaderboard, THE System SHALL calculate initialPage as Math.floor(userIndex / itemsPerPage) + 1 to show the user's page
7. WHEN the Performance Analysis System displays the breakdown column, THE System SHALL show CheckCircle (indigo-600), XCircle (amber-600), and MinusCircle (slate-500) icons with size 14 as specified in NewAnalysisPageDesignUIOnly.txt
8. WHEN the Performance Analysis System renders pagination buttons, THE System SHALL use w-9 h-9 sizing with active state showing bg-indigo-600 border-indigo-600 text-white shadow-md as specified in NewAnalysisPageDesignUIOnly.txt
9. WHEN the Performance Analysis System displays pagination dots, THE System SHALL render MoreHorizontal icon with size 18 for ellipsis as specified in NewAnalysisPageDesignUIOnly.txt

### Requirement 6: Support Navigation to Solutions

**User Story:** As a student, I want to navigate to detailed solutions from the analysis page, so that I can review questions I got wrong.

#### Acceptance Criteria

1. WHEN the Performance Analysis System displays the header, THE System SHALL render a "View Solution" button with exact styling from NewAnalysisPageDesignUIOnly.txt: bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-indigo-400/50
2. WHEN a student clicks the "View Solution" button, THE System SHALL navigate to /analysis/[resultId]/solutions preserving the current result ID
3. WHEN the Performance Analysis System renders the header, THE System SHALL use flex flex-col sm:flex-row sm:items-center sm:justify-between layout as specified in NewAnalysisPageDesignUIOnly.txt
4. WHEN the Performance Analysis System displays the button, THE System SHALL apply transition-all duration-300 ease-in-out for smooth hover effects as specified in NewAnalysisPageDesignUIOnly.txt

### Requirement 7: Fetch and Display Dynamic Data

**User Story:** As a student, I want to see my actual test data in the analysis, so that the information is accurate and personalized.

#### Acceptance Criteria

1. WHEN the Performance Analysis System loads, THE System SHALL fetch test result data from the /api/analysis/[resultId] endpoint
2. WHEN the Performance Analysis System receives API response, THE System SHALL extract testResult, answerLog, questions, and topperComparison data
3. WHEN the Performance Analysis System processes data, THE System SHALL calculate all metrics using existing backend logic without re-implementing calculations
4. WHEN the Performance Analysis System displays any metric, THE System SHALL use zero hardcoded performance values
5. WHEN the Performance Analysis System encounters an API error, THE System SHALL display an error message with a retry button

### Requirement 8: Implement Responsive Glassmorphic Design

**User Story:** As a student, I want the analysis page to look modern and work on all devices, so that I can review my performance anywhere.

#### Acceptance Criteria

1. WHEN the Performance Analysis System renders glass-card components, THE System SHALL apply the exact CSS from NewAnalysisPageDesignUIOnly.txt: background rgba(255, 255, 255, 0.6), backdrop-filter blur(12px) saturate(180%), border-radius 1rem, box-shadow 0 8px 32px 0 rgba(31, 38, 135, 0.1)
2. WHEN the Performance Analysis System displays KPI cards on hover, THE System SHALL apply transform translateY(-5px) and box-shadow 0 12px 32px 0 rgba(31, 38, 135, 0.15) as specified in NewAnalysisPageDesignUIOnly.txt
3. WHEN the Performance Analysis System renders the KPI dashboard, THE System SHALL use grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 responsive layout as specified in NewAnalysisPageDesignUIOnly.txt
4. WHEN the Performance Analysis System displays tabs, THE System SHALL use flex flex-wrap border-b border-slate-200 with responsive padding p-3 sm:p-4 as specified in NewAnalysisPageDesignUIOnly.txt
5. WHEN the Performance Analysis System renders the main container, THE System SHALL use max-w-7xl mx-auto as specified in NewAnalysisPageDesignUIOnly.txt
6. WHEN the Performance Analysis System displays custom scrollbars, THE System SHALL apply the exact webkit-scrollbar styling from NewAnalysisPageDesignUIOnly.txt: width 8px, track #e2e8f0, thumb #94a3b8, thumb-hover #64748b

### Requirement 9: Calculate and Display Time Metrics

**User Story:** As a student, I want to see time-related metrics, so that I can understand my pacing and time management.

#### Acceptance Criteria

1. WHEN the Performance Analysis System displays the Time Taken KPI, THE System SHALL format total time taken in HH:MM format
2. WHEN the Performance Analysis System shows chapter-wise performance, THE System SHALL calculate and display average time per question for each chapter
3. WHEN the Performance Analysis System displays leaderboard, THE System SHALL show total time taken for each student in HH:MM:SS format
4. WHEN the Performance Analysis System calculates average time, THE System SHALL divide total chapter time by number of questions attempted in that chapter
5. WHEN the Performance Analysis System formats time values, THE System SHALL handle edge cases where time data is null or zero

### Requirement 10: Implement Tab Navigation System

**User Story:** As a student, I want to navigate between different analysis views using tabs, so that I can explore various aspects of my performance.

#### Acceptance Criteria

1. WHEN the Performance Analysis System renders the tab navigation, THE System SHALL display five tabs: Overview, Chapter-wise, Difficulty, Topper Comparison, and Leaderboard as specified in NewAnalysisPageDesignUIOnly.txt
2. WHEN the Performance Analysis System displays tabs, THE System SHALL use the exact tab-btn styling from NewAnalysisPageDesignUIOnly.txt with -mb-px p-3 sm:p-4 border-b-2 border-transparent
3. WHEN the Performance Analysis System shows an active tab, THE System SHALL apply the .tab-btn.active class with border-color #4f46e5, color #4f46e5, and font-weight 600 as specified in NewAnalysisPageDesignUIOnly.txt
4. WHEN the Performance Analysis System renders tab buttons, THE System SHALL use text-sm sm:text-base font-medium text-slate-600 with hover:text-indigo-600 hover:border-indigo-300 as specified in NewAnalysisPageDesignUIOnly.txt
5. WHEN the Performance Analysis System displays tab panels, THE System SHALL wrap them in a glass-card container with p-4 sm:p-6 padding as specified in NewAnalysisPageDesignUIOnly.txt
6. WHEN the Performance Analysis System manages tab state, THE System SHALL use useState with default value 'overview' as specified in NewAnalysisPageDesignUIOnly.txt
7. WHEN the Performance Analysis System renders tab content, THE System SHALL apply pt-6 padding to the content area as specified in NewAnalysisPageDesignUIOnly.txt

### Requirement 11: Provide Loading and Error States

**User Story:** As a student, I want to see appropriate feedback while data loads or if errors occur, so that I understand the system status.

#### Acceptance Criteria

1. WHEN the Performance Analysis System is fetching data, THE System SHALL display a skeleton loader matching the final layout structure
2. WHEN the Performance Analysis System encounters a fetch error, THE System SHALL display an error message with the specific error text
3. WHEN the Performance Analysis System shows an error, THE System SHALL provide a "Retry" button to re-attempt data fetching
4. WHEN the Performance Analysis System receives empty data, THE System SHALL display a message indicating no analysis data is available
5. WHEN the Performance Analysis System successfully loads data, THE System SHALL animate the dashboard appearance with fade-in and slide-up effects
