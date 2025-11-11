# FINAL BLUEPRINT: Next-Generation Mock Test Performance Analysis Dashboard

**To:** Development Team / Lead AI Analyst  
**Subject:** Finalized Blueprint for a Consistent, Professional Performance Analysis Dashboard

## 1. Final Directive & Primary Objective

This is the definitive blueprint for the redesign of the Mock Test Performance Analysis page. The primary objective is to achieve **100% data consistency** with the metrics already presented on the **Completed Mock Test Card**. The existing scoring logic on that card is proven and correct; the new dashboard will adopt it as the single source of truth, fixing the flawed scoring of the previous analysis page. This is a **complete overhaul**, not an incremental update.

## 2. Source of Truth: The `TestCard` Component

Investigation of the `src/components/tests/TestCard.tsx` component reveals that all core performance metrics are pre-calculated on the backend and passed to the component in a `results` object.

**`Test.results` Object Structure:**
```typescript
{
  marks_obtained: number,
  total_marks: number,
  percentile: number,
  rank: number,
  total_test_takers: number
}
```
There is no complex client-side calculation. The backend provides the final numbers. **This is the logic to be replicated.** The new analysis page must be powered by the same data structure, ensuring what a user sees on the `TestCard` is identical to what they see on the detailed analysis page.

## 3. Proposed Wireframe & Layout (Final)

The dashboard will be a fresh, single-page experience built from the ground up.

**Layout Structure:**

1.  **[Global Performance Header] (New)**: A non-legacy header displaying the core, consistent metrics.
2.  **[Tabbed Detailed Analysis]**: A tabbed interface for deeper analysis.
    *   **Tab 1: Performance Breakdown (Default)**
        *   Chapter-wise Performance Table
        *   Difficulty-wise Performance Analysis
    *   **Tab 2: Topper Comparison**
        *   Comparative Metrics (You vs. Topper)
        *   Question-by-Question Comparison
    *   **Tab 3: Full Leaderboard (Enhanced UI)**
3.  **[Actionable Insights]**: AI-generated feedback.
4.  **[Footer Actions]**: A sticky footer with a link to the **untouched** "View Solution" page.

---

## 4. Component Specifications (Final)

### 4.1. Global Performance Header (New)

This component replaces the old `KPICards` entirely. It is the primary display for the core metrics.

*   **Component:** `GlobalPerformanceHeader.tsx`
*   **Data Source:** It will directly consume the backend-provided `results` object.
*   **Data Points:**
    *   **Score:** `results.marks_obtained` / `results.total_marks`
    *   **Overall Rank:** `results.rank` / `results.total_test_takers`
    *   **Percentile:** `results.percentile`
    *   **Accuracy:** (Calculated from `answerLog` data)
    *   **Attempt Rate:** (Calculated from `answerLog` data)
*   **Visuals:** A clean, prominent header section at the top of the page, visually separating it from the deeper analysis tabs below.

### 4.2. Tab 1: Performance Breakdown

#### 4.2.1. Chapter-wise Performance

*   **Component:** `ChapterWisePerformanceTable.tsx`
*   **Status:** To be built fresh or heavily refactored to fit the new design.
*   **Enhancement:** Will be accompanied by a bar chart to visualize accuracy per chapter.

#### 4.2.2. Difficulty-wise Performance

*   **Component:** `DifficultyBreakdown.tsx`
*   **Status:** New component.
*   **Purpose:** To analyze performance across Easy, Medium, and Hard questions.
*   **Visuals:** A stacked bar chart and a detailed table.

### 4.3. Tab 2: Topper Comparison

*   **Component:** `TopperComparison.tsx`
*   **Status:** New component.
*   **Purpose:** To provide a direct comparison against the top-performing student.

### 4.4. Tab 3: Full Leaderboard

*   **Component:** `Leaderboard.tsx`
*   **Status:** The backend logic for fetching leaderboard data can be reused.
*   **UI/UX:** The frontend will be a new, modern implementation featuring highlighting for the current user, search functionality, and pagination.

### 4.5. Actionable Insights

*   **Component:** `ActionableInsights.tsx`
*   **Status:** New component.
*   **Purpose:** Provide automated, data-driven advice based on the full analysis data.

### 4.6. "View Solution" Page Integration

*   **Strict Rule:** The existing "Detailed Solution Review" page (`/analysis/[resultId]/solutions`) is **preserved and untouched**.
*   **Integration:** A button labeled **"View Detailed Solutions"** in the sticky footer will navigate the user to this page.

---

## 5. Technical Notes & Implementation Strategy (Final)

### 5.1. Backend API & Data Flow

*   **Critical Requirement:** The main data-fetching mechanism for the analysis page (identified by `resultId`) **must** return the same `results` object used by `TestCard.tsx`.
*   The API response should be extended to also include:
    *   The full `answerLog` for calculating secondary metrics (e.g., accuracy, attempt rate, chapter-wise breakdowns).
    *   The `questions` array, with `difficulty` specified for each question.
    *   The `testResult` and `answerLog` for the Rank #1 student (the "topper").
    *   A separate, paginated endpoint for the full leaderboard must be available.

### 5.2. Frontend Implementation

*   **Complete Overhaul:** All legacy components from the previous analysis page, especially `KPICards`, are to be discarded. The implementation will be based entirely on this new blueprint.
*   **Charting Library:** **`recharts`** is the recommended library for all data visualizations.
*   **Component-Driven Development:** Build each new component (`GlobalPerformanceHeader`, `DifficultyBreakdown`, etc.) in isolation before integrating them into the final tabbed layout.

This final blueprint provides a clear and consistent plan. By aligning the dashboard's core metrics with the existing, functional logic of the `TestCard`, we ensure accuracy and user trust while delivering a feature-rich, professional analysis experience.