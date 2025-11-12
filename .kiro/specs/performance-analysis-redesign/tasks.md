# Implementation Plan

- [x] 1. Create QuestionBreakdownChart component





  - Extract doughnut chart logic from GlobalPerformanceHeader into a new standalone component
  - Create `src/components/QuestionBreakdownChart.tsx` with proper TypeScript interfaces
  - Implement responsive chart sizing for right column placement
  - Use existing recharts library (PieChart with innerRadius for doughnut effect)
  - Apply consistent styling with other dashboard cards (rounded-2xl, shadow-lg, proper padding)
  - _Requirements: 1.2, 1.3, 10.1, 10.2, 10.3_

- [x] 2. Restructure GlobalPerformanceHeader component





  - [x] 2.1 Remove Question Breakdown doughnut chart section


    - Delete the doughnut chart rendering code and related data preparation
    - Remove the right column grid section that contained the chart
    - _Requirements: 1.2, 1.3_
  
  - [x] 2.2 Implement hierarchical metric card structure


    - Create two distinct card components: PrimaryMetricCard and SecondaryMetricCard
    - Implement PrimaryMetricCard with larger sizing (p-6, text-3xl for value, w-7 h-7 icons)
    - Implement SecondaryMetricCard with compact sizing (p-4, text-xl for value, w-5 h-5 icons)
    - Apply proper styling differences (shadow-lg vs shadow-md, rounded-2xl vs rounded-xl)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 2.3 Reorganize metrics into Primary and Secondary rows


    - Create Primary Metrics row with 4-column grid for Score, Rank, Percentile, Accuracy
    - Create Secondary Metrics row with 5-column grid for Correct, Incorrect, Skipped, Attempt Rate, Total Questions
    - Implement responsive grid breakpoints (grid-cols-1 md:grid-cols-2 lg:grid-cols-4 for primary)
    - Add proper spacing between rows (mt-6)
    - _Requirements: 2.1, 2.2_

- [x] 3. Implement two-column dashboard layout





  - [x] 3.1 Modify PerformanceAnalysisDashboard main container


    - Wrap content in CSS Grid with 70/30 split (grid-cols-1 lg:grid-cols-[70%_30%])
    - Create left column container for existing content (GlobalPerformanceHeader and Tabs)
    - Create right column container for QuestionBreakdownChart and ActionableInsights
    - Add proper gap spacing between columns (gap-6)
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 3.2 Implement responsive stacking behavior


    - Configure grid to stack vertically on mobile/tablet (grid-cols-1 on screens <1024px)
    - Test layout at breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop)
    - Ensure proper spacing in stacked layout
    - _Requirements: 1.4_
  
  - [x] 3.3 Reposition ActionableInsights component


    - Move ActionableInsights from bottom of page to right column
    - Position below QuestionBreakdownChart with proper spacing
    - Ensure width matches right column constraints
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 4. Convert sticky footer to floating action button





  - Remove fixed bottom footer container from PerformanceAnalysisDashboard
  - Create floating button positioned at bottom-right corner (fixed bottom-6 right-6)
  - Maintain z-index layering (z-50) to stay above content
  - Ensure button doesn't obscure critical content with proper sizing
  - Test visibility and accessibility across different viewport sizes
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 5. Redesign ChapterWisePerformanceTable with inline progress bars




  - [x] 5.1 Remove vertical bar chart visualization


    - Delete the ResponsiveContainer and BarChart components
    - Remove the chart grid column from the layout
    - Update component to single-column table layout
    - _Requirements: 3.1, 3.2_
  
  - [x] 5.2 Add Performance column with horizontal progress bars


    - Add new "Performance" column header to table
    - Implement inline progress bar for each chapter row
    - Create progress bar container (w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3)
    - Create filled bar with dynamic width based on accuracy percentage
    - Apply color coding: green (≥70%), amber (40-69%), red (<40%)
    - Add smooth transition animation (transition-all duration-300)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 5.3 Update table styling for consistency


    - Ensure proper column spacing and alignment
    - Maintain clear, readable column headers
    - Apply consistent row styling with existing design system
    - _Requirements: 3.4_

- [x] 6. Update Leaderboard API endpoint





  - [x] 6.1 Modify leaderboard data query


    - Update `/api/mock-tests/[testId]/leaderboard` to fetch marks_obtained and total_marks
    - Add queries to calculate correct, incorrect, and skipped counts per user
    - Join with answer_log table to aggregate question status counts
    - Ensure proper data structure matches new LeaderboardEntry interface
    - _Requirements: 5.1, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 6.2 Remove accuracy and percentile from response


    - Remove accuracy and percentile calculations from the API response
    - Update response type to match new LeaderboardEntry interface
    - _Requirements: 5.2, 5.3_

- [x] 7. Redesign Leaderboard component





  - [x] 7.1 Update LeaderboardEntry interface


    - Add marks_obtained, total_marks, correct, incorrect, skipped fields
    - Remove accuracy and percentile fields
    - Update TypeScript types throughout component
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 7.2 Modify table structure


    - Remove Accuracy and Percentile column headers
    - Add Performance Breakdown column header
    - Update table header row structure
    - _Requirements: 5.2, 5.3, 6.1_
  
  - [x] 7.3 Implement Score column with marks format


    - Change score display from percentage to "[Marks Obtained] / [Total Marks]" format
    - Format marks with 2 decimal places (e.g., "13.75 / 22")
    - Apply font-semibold styling for emphasis
    - _Requirements: 5.1, 5.4_
  
  - [x] 7.4 Create PerformanceChip component


    - Create reusable chip component with type prop (correct | incorrect | skipped)
    - Implement correct chip: green background (bg-green-100 dark:bg-green-900/30), checkmark icon (✓)
    - Implement incorrect chip: red background (bg-red-100 dark:bg-red-900/30), cross icon (✗)
    - Implement skipped chip: gray background (bg-slate-100 dark:bg-slate-700), arrow icon (→)
    - Style chips as compact pills (px-2 py-1 rounded-full text-xs font-medium)
    - Display count alongside icon in each chip
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_
  

  - [x] 7.5 Render Performance Breakdown column


    - Create flex container for chips (flex items-center gap-2)
    - Render three PerformanceChip components for each leaderboard entry
    - Pass correct, incorrect, and skipped counts to respective chips
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 7.6 Add medal icons for top 3 ranks

    - Add gold medal emoji (🥇) for rank 1
    - Add silver medal emoji (🥈) for rank 2
    - Add bronze medal emoji (🥉) for rank 3
    - Position medals before rank number with proper spacing (mr-2)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 7.7 Enhance current user row highlighting

    - Apply distinct background color for current user row (bg-indigo-100 dark:bg-indigo-900/40)
    - Display "YOU" in bold text instead of user name
    - Ensure highlighting is visually distinct from other rows
    - Maintain consistent styling across viewport sizes
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 8. Verify responsive behavior across breakpoints





  - Test desktop layout (1920x1080): verify two-column layout, metric card sizing, chart positioning
  - Test tablet layout (768x1024): verify column stacking, responsive grids
  - Test mobile layout (375x667): verify single-column layout, floating button placement, touch targets
  - Verify smooth transitions between breakpoints
  - _Requirements: 1.4, 9.4_

- [ ] 9. Validate accessibility compliance
  - Verify keyboard navigation for all interactive elements (floating button, tabs, table rows)
  - Test screen reader compatibility with semantic HTML and ARIA labels
  - Validate color contrast ratios meet WCAG AA standards (4.5:1 for normal text)
  - Test dark mode color contrast for all new components
  - Ensure minimum touch target sizes (44x44px) for mobile interactions
  - _Requirements: All requirements (accessibility is cross-cutting)_

- [ ] 10. Create visual regression tests
  - Set up screenshot tests for desktop, tablet, and mobile viewports
  - Create baseline images for two-column layout
  - Test Primary vs Secondary metric card rendering
  - Verify chart positioning in right column
  - Test leaderboard table with performance chips and medals
  - Test chapter performance table with inline progress bars
  - _Requirements: All requirements (testing validation)_
