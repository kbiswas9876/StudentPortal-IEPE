# Design Document

## Overview

This design document outlines the technical approach for redesigning the Performance Analysis page UI/UX. The redesign transforms the current single-column layout into a structured two-column dashboard with improved visual hierarchy, modern data visualizations, and enhanced user experience. The implementation will modify existing React components while preserving all current functionality and data flows.

### Design Principles

1. **Visual Hierarchy**: Primary metrics are visually prominent; secondary metrics provide supporting context
2. **Information Density**: Maximize insight per screen area without overwhelming the user
3. **Consistency**: Unified design language across all components using Tailwind CSS utilities
4. **Responsiveness**: Graceful degradation on mobile devices with vertical stacking
5. **Accessibility**: Maintain WCAG 2.1 AA compliance with proper color contrast and semantic HTML

## Architecture

### Component Hierarchy

```
PerformanceAnalysisDashboard (Modified)
├── Page Header (Existing)
├── Two-Column Layout Container (New)
│   ├── Left Column (70% width)
│   │   ├── GlobalPerformanceHeader (Modified)
│   │   │   ├── Primary Metrics Row (Modified)
│   │   │   └── Secondary Metrics Row (Modified)
│   │   └── Tabbed Content (Existing)
│   │       ├── ChapterWisePerformanceTable (Modified)
│   │       ├── DifficultyBreakdown (Modified)
│   │       ├── TopperComparison (Existing)
│   │       └── Leaderboard (Modified)
│   └── Right Column (30% width)
│       ├── QuestionBreakdownChart (New)
│       └── ActionableInsights (Repositioned)
└── Floating Action Button (Modified)
```

### Data Flow

The existing data flow remains unchanged:
1. Page component fetches session data from `/api/analysis/[resultId]`
2. Data is passed down to `PerformanceAnalysisDashboard` as `SessionResult`
3. Child components receive and process the data independently
4. Leaderboard component fetches its own data from `/api/mock-tests/[testId]/leaderboard`

## Components and Interfaces

### 1. PerformanceAnalysisDashboard (Modified)

**File**: `src/components/PerformanceAnalysisDashboard.tsx`

**Changes**:
- Wrap main content in a two-column grid layout
- Move Question Breakdown chart from GlobalPerformanceHeader to right column
- Reposition ActionableInsights to right column
- Convert sticky footer button to floating button (bottom-right corner)

**Layout Structure**:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
  {/* Left Column */}
  <div className="space-y-6">
    <GlobalPerformanceHeader />
    <Tabs.Root>...</Tabs.Root>
  </div>
  
  {/* Right Column */}
  <div className="space-y-6">
    <QuestionBreakdownChart />
    <ActionableInsights />
  </div>
</div>

{/* Floating Action Button */}
<div className="fixed bottom-6 right-6 z-50">
  <PrimaryActionButton />
</div>
```

**Responsive Behavior**:
- Desktop (≥1024px): Two columns side-by-side
- Tablet/Mobile (<1024px): Single column, stacked vertically

### 2. GlobalPerformanceHeader (Modified)

**File**: `src/components/GlobalPerformanceHeader.tsx`

**Changes**:
- Restructure metric cards into two distinct tiers
- Increase Primary Metric card sizes (larger padding, bigger fonts)
- Reduce Secondary Metric card sizes (compact layout)
- Remove Question Breakdown doughnut chart (moved to right column)
- Add consistent icon set (using existing lucide-react icons)

**Primary Metrics Layout**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <PrimaryMetricCard icon={<BarChart2 />} label="Score" value="13.75" subValue="/ 22" />
  <PrimaryMetricCard icon={<Award />} label="Rank" value="#1" subValue="/ 1" />
  <PrimaryMetricCard icon={<TrendingUp />} label="Percentile" value="99.5%" />
  <PrimaryMetricCard icon={<Target />} label="Accuracy" value="80.0%" />
</div>
```

**Secondary Metrics Layout**:
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
  <SecondaryMetricCard icon={<Check />} label="Correct" value={4} />
  <SecondaryMetricCard icon={<X />} label="Incorrect" value={1} />
  <SecondaryMetricCard icon={<HelpCircle />} label="Skipped" value={4} />
  <SecondaryMetricCard icon={<CheckCircle />} label="Attempt Rate" value="55.6%" />
  <SecondaryMetricCard icon={<Hash />} label="Total Questions" value={9} />
</div>
```

**Styling Specifications**:
- Primary Cards: `p-6`, `text-3xl` for value, `text-lg` for subValue
- Secondary Cards: `p-4`, `text-xl` for value, `text-sm` for label
- All cards: `rounded-2xl` (primary) or `rounded-xl` (secondary), `shadow-lg` (primary) or `shadow-md` (secondary)
- Icons: `w-7 h-7` (primary), `w-5 h-5` (secondary)

### 3. QuestionBreakdownChart (New Component)

**File**: `src/components/QuestionBreakdownChart.tsx`

**Purpose**: Extract the doughnut chart from GlobalPerformanceHeader into a standalone component for the right column.

**Interface**:
```typescript
interface QuestionBreakdownChartProps {
  sessionResult: SessionResult
  className?: string
}
```

**Implementation**:
```tsx
export default function QuestionBreakdownChart({ sessionResult, className }: QuestionBreakdownChartProps) {
  const { answerLog } = sessionResult
  
  const correct = answerLog.filter(a => a.status === 'correct').length
  const incorrect = answerLog.filter(a => a.status === 'incorrect').length
  const skipped = answerLog.filter(a => a.status === 'skipped').length
  
  const data = [
    { name: 'Correct', value: correct },
    { name: 'Incorrect', value: incorrect },
    { name: 'Skipped', value: skipped },
  ]
  
  const COLORS = ['#22c55e', '#ef4444', '#64748b']
  
  return (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Question Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### 4. ChapterWisePerformanceTable (Modified)

**File**: `src/components/ChapterWisePerformanceTable.tsx`

**Changes**:
- Replace vertical bar chart with horizontal progress bars embedded in table rows
- Remove separate chart section
- Add a "Performance" column to the table with inline horizontal bars

**New Table Structure**:
```tsx
<table>
  <thead>
    <tr>
      <th>Chapter</th>
      <th>Performance</th>
      <th>Accuracy</th>
      <th>Correct</th>
      <th>Incorrect</th>
    </tr>
  </thead>
  <tbody>
    {chapters.map(chapter => (
      <tr>
        <td>{chapter.chapterName}</td>
        <td>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-300"
              style={{
                width: `${chapter.accuracy}%`,
                backgroundColor: getAccuracyColor(chapter.accuracy)
              }}
            />
          </div>
        </td>
        <td>{chapter.accuracy.toFixed(1)}%</td>
        <td>{chapter.correct}</td>
        <td>{chapter.incorrect}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Visual Design**:
- Progress bar height: `h-3` (12px)
- Bar colors: Green (≥70%), Amber (40-69%), Red (<40%)
- Smooth transitions: `transition-all duration-300`
- Full-width bars with percentage-based width

### 5. DifficultyBreakdown (Modified)

**File**: `src/components/DifficultyBreakdown.tsx`

**Changes**:
- The component already uses a stacked horizontal bar chart (correct implementation)
- Minor styling adjustments for consistency with new design language
- Ensure proper spacing and alignment with updated layout

**Current Implementation**: Already correct with stacked bars showing Correct (green), Incorrect (red), and Skipped (gray) segments.

**Styling Updates**:
- Increase chart height slightly: `h-72` instead of `h-64`
- Ensure consistent card styling with other components

### 6. Leaderboard (Major Modifications)

**File**: `src/components/Leaderboard.tsx`

**Changes**:
1. Remove `Accuracy` and `Percentile` columns
2. Modify `Score` column to display actual marks format
3. Add new `Performance Breakdown` column with visual chips
4. Add medal icons for top 3 ranks
5. Enhance current user row highlighting

**New Interface**:
```typescript
interface LeaderboardEntry {
  rank: number
  name: string
  user_id: string
  marks_obtained: number  // New field
  total_marks: number     // New field
  correct: number         // New field
  incorrect: number       // New field
  skipped: number         // New field
}
```

**API Modification Required**:
The leaderboard API endpoint (`/api/mock-tests/[testId]/leaderboard`) needs to return additional fields:
- `marks_obtained`
- `total_marks`
- `correct`, `incorrect`, `skipped` counts

**Table Structure**:
```tsx
<table>
  <thead>
    <tr>
      <th>Rank</th>
      <th>Name</th>
      <th>Score</th>
      <th>Performance Breakdown</th>
    </tr>
  </thead>
  <tbody>
    {leaderboard.map(entry => (
      <tr className={entry.user_id === currentUserId ? 'bg-indigo-100 dark:bg-indigo-900/40' : ''}>
        <td>
          {entry.rank === 1 && <span className="mr-2">🥇</span>}
          {entry.rank === 2 && <span className="mr-2">🥈</span>}
          {entry.rank === 3 && <span className="mr-2">🥉</span>}
          {entry.rank}
        </td>
        <td className={entry.user_id === currentUserId ? 'font-bold' : ''}>
          {entry.user_id === currentUserId ? 'YOU' : entry.name}
        </td>
        <td className="font-semibold">
          {entry.marks_obtained.toFixed(2)} / {entry.total_marks}
        </td>
        <td>
          <div className="flex items-center gap-2">
            <PerformanceChip type="correct" count={entry.correct} />
            <PerformanceChip type="incorrect" count={entry.incorrect} />
            <PerformanceChip type="skipped" count={entry.skipped} />
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**PerformanceChip Component**:
```tsx
interface PerformanceChipProps {
  type: 'correct' | 'incorrect' | 'skipped'
  count: number
}

function PerformanceChip({ type, count }: PerformanceChipProps) {
  const config = {
    correct: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      icon: '✓'
    },
    incorrect: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      icon: '✗'
    },
    skipped: {
      bg: 'bg-slate-100 dark:bg-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      icon: '→'
    }
  }
  
  const { bg, text, icon } = config[type]
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <span>{icon}</span>
      <span>{count}</span>
    </span>
  )
}
```

## Data Models

### SessionResult (Existing - No Changes)

```typescript
export interface SessionResult {
  testResult: TestResultRow & { results: PerformanceMetrics }
  answerLog: AnswerLogRow[]
  questions: QuestionRow[]
  topperResult?: {
    testResult: TestResultRow & { results: PerformanceMetrics }
    answerLog: AnswerLogRow[]
  }
  leaderboard?: any[]
}
```

### LeaderboardEntry (Modified)

```typescript
interface LeaderboardEntry {
  rank: number
  name: string
  user_id: string
  marks_obtained: number  // Added
  total_marks: number     // Added
  correct: number         // Added
  incorrect: number       // Added
  skipped: number         // Added
  // Removed: accuracy, percentile
}
```

## Error Handling

### Component-Level Error Boundaries

All modified components will maintain existing error handling patterns:
- Graceful fallbacks for missing data
- Loading states during data fetching
- Error messages for failed API calls

### Responsive Layout Fallbacks

- If viewport is too narrow for two columns, automatically stack vertically
- Ensure all interactive elements remain accessible on mobile devices
- Maintain minimum touch target sizes (44x44px) for buttons

## Testing Strategy

### Visual Regression Testing

1. **Desktop Layout (1920x1080)**:
   - Verify two-column layout renders correctly
   - Check Primary vs Secondary metric card sizing
   - Validate chart positioning in right column

2. **Tablet Layout (768x1024)**:
   - Verify responsive breakpoints trigger correctly
   - Check column stacking behavior

3. **Mobile Layout (375x667)**:
   - Verify single-column vertical layout
   - Check floating button doesn't obscure content
   - Validate touch target sizes

### Component Testing

1. **GlobalPerformanceHeader**:
   - Verify metric calculations are correct
   - Test with edge cases (0 questions, all skipped, etc.)
   - Validate icon rendering

2. **ChapterWisePerformanceTable**:
   - Test horizontal progress bar rendering
   - Verify color coding based on accuracy thresholds
   - Test with varying numbers of chapters

3. **Leaderboard**:
   - Verify score format displays correctly
   - Test performance chip rendering
   - Validate medal icons for top 3
   - Test current user highlighting

### Integration Testing

1. **Data Flow**:
   - Verify SessionResult data propagates correctly to all components
   - Test leaderboard API integration with new fields

2. **User Interactions**:
   - Test floating button functionality
   - Verify tab switching in main content area
   - Test responsive behavior on window resize

### Accessibility Testing

1. **Keyboard Navigation**:
   - Verify all interactive elements are keyboard accessible
   - Test tab order is logical

2. **Screen Reader Compatibility**:
   - Verify semantic HTML structure
   - Test ARIA labels on charts and icons

3. **Color Contrast**:
   - Validate all text meets WCAG AA standards (4.5:1 for normal text)
   - Test dark mode color contrast

## Implementation Notes

### Styling Approach

- Use Tailwind CSS utility classes exclusively
- Maintain existing dark mode support
- Follow existing color palette (indigo primary, slate neutrals)
- Use existing animation patterns (framer-motion)

### Performance Considerations

- No additional API calls required (except leaderboard modification)
- Chart rendering performance unchanged (same libraries)
- Layout shifts minimized with proper sizing

### Browser Compatibility

- Target: Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- CSS Grid support required (available in all target browsers)
- Flexbox fallbacks where appropriate

### Migration Strategy

1. Create new QuestionBreakdownChart component
2. Modify GlobalPerformanceHeader (remove chart, restructure metrics)
3. Update PerformanceAnalysisDashboard layout
4. Modify ChapterWisePerformanceTable (add inline progress bars)
5. Update Leaderboard component and API
6. Test thoroughly before deployment

## Diagrams

### Layout Structure (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│ Performance Analysis Header                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─────────────────────────────────┬─────────────────────────┐  │
│ │ LEFT COLUMN (70%)               │ RIGHT COLUMN (30%)      │  │
│ │                                 │                         │  │
│ │ ┌─────────────────────────────┐ │ ┌─────────────────────┐ │  │
│ │ │ Primary Metrics (4 cards)   │ │ │ Question Breakdown  │ │  │
│ │ └─────────────────────────────┘ │ │ (Doughnut Chart)    │ │  │
│ │                                 │ └─────────────────────┘ │  │
│ │ ┌─────────────────────────────┐ │                         │  │
│ │ │ Secondary Metrics (5 cards) │ │ ┌─────────────────────┐ │  │
│ │ └─────────────────────────────┘ │ │ Actionable Insights │ │  │
│ │                                 │ │                     │ │  │
│ │ ┌─────────────────────────────┐ │ └─────────────────────┘ │  │
│ │ │ Tabbed Content:             │ │                         │  │
│ │ │ - Performance Breakdown     │ │                         │  │
│ │ │ - Topper Comparison         │ │                         │  │
│ │ │ - Leaderboard               │ │                         │  │
│ │ └─────────────────────────────┘ │                         │  │
│ └─────────────────────────────────┴─────────────────────────┘  │
│                                                                   │
│                                      ┌──────────────────────┐   │
│                                      │ View Solutions (FAB) │   │
│                                      └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Leaderboard Table Structure

```
┌──────┬──────────┬──────────────┬────────────────────────────────┐
│ RANK │ NAME     │ SCORE        │ PERFORMANCE BREAKDOWN          │
├──────┼──────────┼──────────────┼────────────────────────────────┤
│ 🥇 1 │ **YOU**  │ 13.75 / 22   │ [✓ 4] [✗ 1] [→ 4]             │
│ 🥈 2 │ John Doe │ 12.50 / 22   │ [✓ 4] [✗ 2] [→ 3]             │
│ 🥉 3 │ Jane     │ 11.00 / 22   │ [✓ 3] [✗ 1] [→ 5]             │
│   4  │ Bob      │ 10.25 / 22   │ [✓ 3] [✗ 2] [→ 4]             │
└──────┴──────────┴──────────────┴────────────────────────────────┘

Legend:
[✓ 4] = Green chip with checkmark and count
[✗ 1] = Red chip with cross and count
[→ 4] = Gray chip with arrow and count
```

### Chapter Performance Table with Inline Bars

```
┌──────────────────┬─────────────────────────┬──────────┬─────────┬───────────┐
│ CHAPTER          │ PERFORMANCE             │ ACCURACY │ CORRECT │ INCORRECT │
├──────────────────┼─────────────────────────┼──────────┼─────────┼───────────┤
│ Algebra          │ ████████████░░░░░░░░░░  │ 85.5%    │ 6       │ 1         │
│ Geometry         │ ██████████░░░░░░░░░░░░  │ 72.3%    │ 5       │ 2         │
│ Trigonometry     │ ████████░░░░░░░░░░░░░░  │ 45.0%    │ 3       │ 4         │
└──────────────────┴─────────────────────────┴──────────┴─────────┴───────────┘

Note: Progress bars are color-coded:
- Green: ≥70% accuracy
- Amber: 40-69% accuracy
- Red: <40% accuracy
```
