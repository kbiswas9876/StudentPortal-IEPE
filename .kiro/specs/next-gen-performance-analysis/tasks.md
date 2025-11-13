# Implementation Plan

- [x] 1. Set up Chart.js dependencies and configuration





  - Install chart.js and react-chartjs-2 packages
  - Register Chart.js components at application level
  - Verify Chart.js integration with a simple test component
  - _Requirements: 2.1, 2.5_

- [x] 2. Create reusable KPI card components






- [x] 2.1 Implement KpiCard component

  - Create src/components/KpiCard.tsx with exact styling from NewAnalysisPageDesignUIOnly.txt
  - Implement props interface (title, value, subtext, icon, isPrimary)
  - Apply glassmorphism styling with .glass-card and .kpi-card classes
  - Implement hover animations (translateY, shadow transitions)
  - Add background icon positioning (absolute, right: -1.5rem, bottom: -1rem)
  - _Requirements: 1.2, 1.3, 1.4, 8.1, 8.2_


- [x] 2.2 Implement AttemptSummaryCard component

  - Create src/components/AttemptSummaryCard.tsx with exact layout from NewAnalysisPageDesignUIOnly.txt
  - Implement 3-column grid for correct/incorrect/skipped
  - Apply color scheme: indigo-600 (correct), amber-600 (incorrect), slate-600 (skipped)
  - Add CheckCheck icon from lucide-react
  - _Requirements: 1.2, 1.7_

- [x] 3. Create chart visualization components





- [x] 3.1 Implement OverviewPanel component


  - Create src/components/OverviewPanel.tsx with Doughnut chart
  - Configure chart with exact colors from NewAnalysisPageDesignUIOnly.txt
  - Implement custom legend below chart
  - Set chart height to h-64 md:h-80
  - Accept dynamic data props (correct, incorrect, skipped)
  - _Requirements: 2.1, 2.2, 2.6_

- [x] 3.2 Implement DifficultyPanel component


  - Create src/components/DifficultyPanel.tsx with stacked Bar chart
  - Configure 3 datasets (Correct, Incorrect, Skipped) with exact colors
  - Set stacked: true for both x and y axes
  - Apply chartDefaultFont, chartDefaultColor, chartGridColor
  - Set chart height to h-80 md:h-96
  - Accept dynamic breakdown data prop
  - _Requirements: 2.3, 2.6_

- [x] 3.3 Implement ComparisonPanel component


  - Create src/components/ComparisonPanel.tsx with Radar chart
  - Configure 2 datasets (You: indigo, Topper: teal) with exact colors
  - Set scale max to 100, beginAtZero to true
  - Apply pointLabels font styling (size 13, weight 600, Inter)
  - Set chart height to h-80 md:h-96
  - Accept dynamic comparison data prop
  - Handle null case when topper data unavailable
  - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.7_

- [x] 4. Implement chapter-wise performance table






- [x] 4.1 Create ChapterPanel component

  - Create src/components/ChapterPanel.tsx with 12-column grid layout
  - Implement table header with exact styling from NewAnalysisPageDesignUIOnly.txt
  - Create table rows with col-span values: 4, 3, 2, 2, 1
  - Add overflow-x-auto wrapper for mobile responsiveness
  - _Requirements: 3.1, 3.2_


- [x] 4.2 Implement progress bar with dynamic gradients

  - Create progress bar with h-1.5 rounded-full styling
  - Implement gradient logic: >85% teal, 60-84% yellow-amber, <60% red
  - Apply exact gradient values from NewAnalysisPageDesignUIOnly.txt
  - Set width dynamically based on accuracy percentage
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_



- [x] 4.3 Implement chapter data calculation logic

  - Group answer log by chapter_name from questions
  - Calculate correct, incorrect, skipped counts per chapter
  - Calculate accuracy percentage (correct / attempted * 100)
  - Calculate average time per question (totalTime / attempted)
  - Format time display as seconds with 's' suffix
  - _Requirements: 3.2, 9.4_

- [x] 5. Implement leaderboard with pagination





- [x] 5.1 Create LeaderboardPanel component structure


  - Create src/components/LeaderboardPanel.tsx with table layout
  - Implement table header with exact column styling
  - Create table body with conditional row highlighting
  - Apply bg-indigo-50 border-l-4 border-indigo-500 for current user
  - _Requirements: 5.1, 5.2_

- [x] 5.2 Implement Medal component for top 3 ranks

  - Create inline Medal component within LeaderboardPanel
  - Use Medal icon from lucide-react with size 20, strokeWidth 2.5
  - Apply colors: gold (text-yellow-500), silver (text-slate-500), bronze (text-orange-600)
  - Display medal only for ranks 1, 2, 3
  - _Requirements: 5.3_

- [x] 5.3 Implement breakdown column with icons

  - Use CheckCircle (indigo-600), XCircle (amber-600), MinusCircle (slate-500)
  - Set icon size to 14 with mr-0.5 spacing
  - Display in flex container with space-x-3
  - Apply bold indigo-700 text for current user's numbers
  - _Requirements: 5.7_

- [x] 5.4 Integrate usePagination hook


  - Copy exact usePagination hook implementation from NewAnalysisPageDesignUIOnly.txt
  - Create src/hooks/usePagination.ts
  - Implement DOTS constant and pagination range logic
  - Handle all 4 cases: no dots, left dots, right dots, both dots
  - _Requirements: 5.5_

- [x] 5.5 Implement pagination controls UI

  - Create pagination nav with ChevronLeft, ChevronRight, MoreHorizontal icons
  - Apply w-9 h-9 sizing to all buttons
  - Style active page: bg-indigo-600 border-indigo-600 text-white shadow-md
  - Style inactive pages: bg-white border-slate-300 text-slate-600
  - Disable prev/next buttons at boundaries
  - _Requirements: 5.8, 5.9_

- [x] 5.6 Implement initial page calculation

  - Calculate userIndex from leaderboard data
  - Set initialPage as Math.floor(userIndex / itemsPerPage) + 1
  - Initialize currentPage state with initialPage
  - _Requirements: 5.6_

- [x] 6. Create main dashboard component
- [x] 6.1 Create NewPerformanceAnalysisDashboard component
  - Create src/components/NewPerformanceAnalysisDashboard.tsx
  - Implement props interface (sessionResult, onNavigateToSolutions, className)
  - Set up component structure with header, KPI section, tabs section
  - Apply max-w-7xl mx-auto container styling
  - _Requirements: 1.1, 6.3_

- [x] 6.2 Implement header section
  - Create header with flex flex-col sm:flex-row sm:items-center sm:justify-between
  - Display "Performance Analysis" title with text-3xl font-bold text-slate-900
  - Format and display submission timestamp
  - Add "View Solution" button with exact styling from NewAnalysisPageDesignUIOnly.txt
  - Wire button to onNavigateToSolutions callback
  - _Requirements: 1.1, 6.1, 6.2, 6.4_

- [x] 6.3 Implement KPI dashboard grid
  - Create grid with grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6
  - Render 8 KPI cards in correct order
  - Map dynamic data to each card (Score, Rank, Percentile, Accuracy, Time Taken, Attempt Summary, Attempt Rate, Total Questions)
  - Apply isPrimary=true to first 5 cards
  - _Requirements: 1.2, 1.5, 1.6, 8.3_

- [x] 6.4 Implement tab navigation system
  - Set up useState for activeTab with default 'overview'
  - Create tab buttons array: overview, chapters, difficulty, comparison, leaderboard
  - Apply exact tab-btn styling from NewAnalysisPageDesignUIOnly.txt
  - Implement active tab styling with .tab-btn.active class
  - Use flex flex-wrap border-b border-slate-200 for tab container
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6_

- [x] 6.5 Implement tab panels
  - Wrap tab content in glass-card with p-4 sm:p-6
  - Apply pt-6 to tab content area
  - Conditionally render panels based on activeTab state
  - Pass appropriate props to each panel component
  - _Requirements: 10.5, 10.7_

- [x] 6.6 Inject global CSS styles

  - Implement useEffect to inject style element
  - Copy exact CSS from NewAnalysisPageDesignUIOnly.txt
  - Include .glass-card, .kpi-card, .kpi-card-icon, scrollbar, .tab-btn styles
  - Clean up style element on unmount
  - _Requirements: 8.1, 8.6_
-

- [x] 7. Implement data calculation utilities




- [x] 7.1 Create chapter performance calculator


  - Create src/utils/analysisCalculations.ts
  - Implement calculateChapterPerformance function
  - Group answer log by chapter using question data
  - Calculate accuracy, correct, incorrect, skipped, avgTime per chapter
  - Return ChapterPerformance[] array
  - _Requirements: 3.2, 7.3_

- [x] 7.2 Create difficulty breakdown calculator


  - Implement calculateDifficultyBreakdown function
  - Map question difficulty levels to easy/medium/hard
  - Count correct, incorrect, skipped for each difficulty
  - Return DifficultyBreakdown object
  - _Requirements: 2.3, 7.3_



- [x] 7.3 Create topper comparison calculator





  - Implement calculateTopperComparison function
  - Calculate chapter-wise accuracy for user and topper
  - Calculate overall accuracy for both
  - Return ComparisonData object with labels and scores
  - Handle null case when topper data unavailable


  - _Requirements: 4.5, 7.3_

- [x] 7.4 Create time formatting utilities





  - Implement formatTimeHHMM function for KPI display
  - Implement formatTimeHHMMSS function for leaderboard


  - Implement formatSeconds function for chapter avg time
  - Handle null and zero cases gracefully
  - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [x] 7.5 Create KPI data mapper





  - Implement mapSessionResultToKPIs function
  - Extract and format all 8 KPI values from SessionResult
  - Calculate accuracy percentage from correct/incorrect
  - Calculate attempt rate from attempted/total
  - Format all values for display
  - _Requirements: 1.5, 1.6, 7.3_

- [x] 8. Create leaderboard API endpoint







- [x] 8.1 Implement GET /api/analysis/leaderboard/[testId]

  - Create src/app/api/analysis/leaderboard/[testId]/route.ts
  - Accept query params: page (default 1), limit (default 10)
  - Fetch all test results for given mock_test_id
  - Sort by score_percentage descending
  - Calculate rank for each entry
  - _Requirements: 5.4, 7.2_

- [x] 8.2 Implement pagination logic in API

  - Calculate totalPages from totalEntries and limit
  - Slice results array for current page
  - Return paginated entries with metadata
  - Include currentUserRank in response
  - _Requirements: 5.4_


- [x] 8.3 Implement user anonymization

  - Replace user names with "You" for current user
  - Anonymize other users (use generic names or "Student #")
  - Set isCurrentUser flag for current user's entry
  - Preserve userId for internal tracking
  - _Requirements: 5.1_

- [x] 9. Integrate components into analysis page




- [x] 9.1 Update AnalysisReportPage


  - Import NewPerformanceAnalysisDashboard
  - Replace PerformanceAnalysisDashboard with new component
  - Pass sessionResult and onNavigateToSolutions props
  - Maintain existing loading and error states
  - _Requirements: 7.1, 11.1, 11.2_

- [x] 9.2 Update API response structure if needed


  - Verify /api/analysis/[resultId] returns all required data
  - Ensure results object is present on testResult
  - Verify topperComparison data structure
  - Add any missing fields to API response
  - _Requirements: 7.2_

- [x] 9.3 Test data flow end-to-end


  - Verify all KPI cards display correct data
  - Verify all charts render with dynamic data
  - Verify chapter table shows accurate calculations
  - Verify leaderboard fetches and displays correctly
  - _Requirements: 7.4_

- [x] 10. Implement loading and error states







- [x] 10.1 Create or update skeleton loader


  - Ensure PerformanceAnalysisSkeletonLoader matches new layout
  - Add skeleton for KPI cards grid
  - Add skeleton for tab navigation
  - Add skeleton for chart areas
  - _Requirements: 11.1_

- [x] 10.2 Implement error handling


  - Display error message with retry button on API failure
  - Style error state with red text and centered layout
  - Implement retry functionality
  - Handle empty data case with appropriate message
  - _Requirements: 11.2, 11.3, 11.4_

- [x] 10.3 Add loading states for leaderboard


  - Show loading indicator during leaderboard fetch
  - Disable pagination buttons during page change
  - Display previous page data while loading
  - Handle leaderboard-specific errors
  - _Requirements: 11.4_

- [x] 10.4 Implement fade-in animations


  - Use framer-motion or CSS transitions for dashboard appearance
  - Apply fade-in and slide-up effects on successful load
  - Ensure smooth transitions between loading and loaded states
  - _Requirements: 11.5_

- [x] 11. Responsive design verification









- [x] 11.1 Test mobile layouts (320px - 767px)


  - Verify KPI grid collapses to 2 columns
  - Verify tab navigation wraps and scrolls horizontally
  - Verify charts maintain aspect ratio
  - Verify chapter table scrolls horizontally
  - Verify leaderboard table is readable
  - _Requirements: 8.3, 8.4, 8.5_



- [x] 11.2 Test tablet layouts (768px - 1023px)
  - Verify KPI grid shows 3 columns
  - Verify tab navigation displays inline
  - Verify charts scale appropriately
  - Verify all tables fit viewport
  - _Requirements: 8.3, 8.4, 8.5_



- [x] 11.3 Test desktop layouts (1024px+)

  - Verify KPI grid shows 5 columns
  - Verify all components use max-w-7xl container
  - Verify glassmorphism effects render correctly
  - Verify hover animations work smoothly
  - _Requirements: 8.3, 8.5_

- [ ] 12. Accessibility implementation
- [ ]* 12.1 Add ARIA labels and roles
  - Add role="tab", aria-selected, aria-controls to tab buttons
  - Add role="tabpanel", aria-labelledby to tab panels
  - Add aria-label to pagination prev/next buttons
  - Add title attributes to breakdown icons
  - _Requirements: Not explicitly in requirements, but essential_

- [ ]* 12.2 Implement keyboard navigation
  - Ensure tab key navigates through all interactive elements
  - Implement arrow key navigation for tabs
  - Ensure Enter/Space activates tabs
  - Test keyboard navigation for pagination
  - _Requirements: Not explicitly in requirements, but essential_

- [ ]* 12.3 Verify color contrast
  - Check all text meets WCAG AA standards
  - Verify chart colors have sufficient contrast
  - Ensure focus indicators are visible
  - Test with color blindness simulators
  - _Requirements: Not explicitly in requirements, but essential_

- [ ] 13. Performance optimization
- [ ]* 13.1 Implement memoization
  - Use useMemo for chapter performance calculations
  - Use useMemo for difficulty breakdown calculations
  - Use useMemo for topper comparison calculations
  - Use React.memo for KpiCard and other pure components
  - _Requirements: Not explicitly in requirements, but essential_

- [ ]* 13.2 Optimize Chart.js usage
  - Ensure Chart.js components registered only once
  - Avoid unnecessary chart re-renders
  - Consider lazy loading chart library
  - Profile chart rendering performance
  - _Requirements: Not explicitly in requirements, but essential_

- [ ]* 13.3 Implement data caching
  - Cache processed chapter data
  - Cache difficulty breakdown data
  - Avoid recalculating on every render
  - Consider using React Query or SWR for API caching
  - _Requirements: Not explicitly in requirements, but essential_

- [ ] 14. Testing and quality assurance
- [ ]* 14.1 Write unit tests for components
  - Test KpiCard renders correctly with various props
  - Test usePagination hook with different scenarios
  - Test data calculation functions
  - Test time formatting utilities
  - _Requirements: Not explicitly in requirements, but essential_

- [ ]* 14.2 Write integration tests
  - Test dashboard renders with mock SessionResult
  - Test tab navigation functionality
  - Test chart rendering with dynamic data
  - Test leaderboard pagination
  - _Requirements: Not explicitly in requirements, but essential_

- [ ]* 14.3 Perform visual regression testing
  - Compare rendered output with NewAnalysisPageDesignUIOnly.txt screenshots
  - Verify glassmorphism effects
  - Verify hover animations
  - Verify responsive layouts at all breakpoints
  - _Requirements: Not explicitly in requirements, but essential_

- [ ]* 14.4 Cross-browser testing
  - Test in Chrome, Firefox, Safari, Edge
  - Verify Chart.js compatibility
  - Verify CSS backdrop-filter support
  - Test on iOS and Android browsers
  - _Requirements: Not explicitly in requirements, but essential_

- [ ] 15. Documentation and cleanup
- [ ]* 15.1 Add component documentation
  - Document props interfaces with JSDoc comments
  - Add usage examples for each component
  - Document data calculation logic
  - Create README for the feature
  - _Requirements: Not explicitly in requirements, but essential_

- [ ]* 15.2 Remove old components
  - Delete old PerformanceAnalysisDashboard if no longer used
  - Remove unused imports
  - Clean up deprecated code
  - Update any references in other files
  - _Requirements: Not explicitly in requirements, but essential_

- [ ]* 15.3 Update type definitions
  - Ensure all TypeScript interfaces are properly exported
  - Add missing type definitions
  - Remove unused types
  - Verify type safety across all components
  - _Requirements: Not explicitly in requirements, but essential_
