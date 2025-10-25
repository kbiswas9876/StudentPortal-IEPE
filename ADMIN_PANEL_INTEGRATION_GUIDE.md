# Admin Panel Integration Guide: Structured Error Reporting

## Overview
This guide provides step-by-step instructions for updating the Admin Panel to support the new structured error reporting system implemented in the Student Portal.

## Required Changes

### 1. Create Shared Constants File

**File:** `src/lib/constants.ts` (create if it doesn't exist)

```typescript
export const REPORT_OPTIONS = [
  { tag: 'wrong_question', label: 'Wrong Question' },
  { tag: 'wrong_answer', label: 'Wrong Answer' },
  { tag: 'formatting_issue', label: 'Formatting Issue' },
  { tag: 'no_solution', label: 'No Solution Provided' },
  { tag: 'translation_issue', label: 'Translation Issue' },
  { tag: 'other', label: 'Other...' },
] as const; // 'as const' provides strong type safety

export type ReportTag = typeof REPORT_OPTIONS[number]['tag'];
```

### 2. Update Error Reports Action File

**File:** `src/lib/actions/error-reports.ts`

Update the `getErrorReports` and `getErrorReportsByStatus` functions to include the new `report_tag` field:

```typescript
// Update the RawErrorReport interface
interface RawErrorReport {
  id: number
  question_id: string
  reported_by_user_id: string
  report_tag: string  // ADD THIS LINE
  report_description: string | null  // CHANGE: make nullable
  status: 'new' | 'reviewed' | 'resolved' | 'dismissed'
  admin_notes?: string
  created_at: string
  updated_at?: string
  questions: {
    question_text: string
    book_source: string
    chapter_name: string
  }[] | null
}

// Update the select query in both functions
const { data, error } = await supabase
  .from('error_reports')
  .select(`
    id,
    question_id,
    reported_by_user_id,
    report_tag,  // ADD THIS LINE
    report_description,
    status,
    admin_notes,
    created_at,
    updated_at,
    questions (
      question_text,
      book_source,
      chapter_name
    )
  `)
  .order('created_at', { ascending: false })

// Update the data transformation
return data.map((report: RawErrorReport) => ({
  id: report.id,
  question_id: report.question_id,
  user_id: report.reported_by_user_id,
  report_tag: report.report_tag,  // ADD THIS LINE
  report_description: report.report_description,
  status: report.status,
  admin_notes: report.admin_notes,
  created_at: report.created_at,
  updated_at: report.updated_at,
  user_email: 'Unknown',
  user_full_name: undefined,
  question_text: report.questions?.[0]?.question_text,
  book_source: report.questions?.[0]?.book_source,
  chapter_name: report.questions?.[0]?.chapter_name
}))
```

### 3. Update ErrorReportWithDetails Interface

**File:** `src/lib/supabase/admin.ts` (or wherever this interface is defined)

Add the `report_tag` field to the interface:

```typescript
export interface ErrorReportWithDetails {
  id: number
  question_id: string
  user_id: string
  report_tag: string  // ADD THIS LINE
  report_description: string | null  // CHANGE: make nullable
  status: 'new' | 'reviewed' | 'resolved' | 'dismissed'
  admin_notes?: string
  created_at: string
  updated_at?: string
  user_email: string
  user_full_name?: string
  question_text?: string
  book_source?: string
  chapter_name?: string
}
```

### 4. Update Table Components

#### 4.1 New Reports Table

**File:** `src/components/reports/new-reports-table.tsx`

Add a new column for the report category:

```typescript
import { Badge } from "@/components/ui/badge"
import { REPORT_OPTIONS } from '@/lib/constants'

// Add this function to render the category badge
const renderCategoryBadge = (reportTag: string) => {
  const option = REPORT_OPTIONS.find(opt => opt.tag === reportTag)
  const label = option ? option.label : reportTag?.replace('_', ' ') || 'N/A'
  
  if (reportTag === 'legacy_report') {
    return <Badge variant="outline">Legacy</Badge>
  }

  return <Badge variant="secondary">{label}</Badge>
}

// In the table body, add a new TableCell for the category:
<TableCell className="font-medium">
  {renderCategoryBadge(report.report_tag)}
</TableCell>
```

#### 4.2 In Review Reports Table

**File:** `src/components/reports/in-review-reports-table.tsx`

Apply the same changes as above - add the category badge column.

#### 4.3 Resolved Reports Table

**File:** `src/components/reports/resolved-reports-table.tsx`

Apply the same changes as above - add the category badge column.

### 5. Update Table Headers

Add a new header column for "Category" in all three table components:

```typescript
<TableHead>Category</TableHead>
```

Place this header between the existing headers, typically after "Status" and before "Description".

## Implementation Notes

### Database Migration
The Student Portal has already created the database migration. The Admin Panel will automatically have access to the new `report_tag` column once the migration is applied to the shared Supabase database.

### Backward Compatibility
- Existing reports will have `report_tag` set to `'legacy_report'`
- These will display as "Legacy" badges in the admin interface
- No existing functionality will be broken

### Type Safety
- The `ReportTag` type provides compile-time type safety
- Use the `REPORT_OPTIONS` constant to ensure consistency with the Student Portal

### UI Considerations
- Use the existing Badge component for consistent styling
- Consider adding color coding for different report types if desired
- The category column should be sortable for better admin experience

## Testing Checklist

- [ ] Constants file created and imported correctly
- [ ] Error reports action functions updated to fetch `report_tag`
- [ ] Interface updated to include `report_tag` field
- [ ] All three table components display category badges
- [ ] Legacy reports display as "Legacy" badges
- [ ] New reports show appropriate category badges
- [ ] Table headers include "Category" column
- [ ] No TypeScript errors
- [ ] No runtime errors when viewing reports

## Files to Modify

1. `src/lib/constants.ts` (NEW)
2. `src/lib/actions/error-reports.ts` (MODIFY)
3. `src/lib/supabase/admin.ts` (MODIFY - interface)
4. `src/components/reports/new-reports-table.tsx` (MODIFY)
5. `src/components/reports/in-review-reports-table.tsx` (MODIFY)
6. `src/components/reports/resolved-reports-table.tsx` (MODIFY)

## Support

If you encounter any issues during implementation, refer to the Student Portal implementation for reference patterns, particularly:
- `src/lib/constants.ts` - Constants definition
- `src/app/api/error-reports/route.ts` - API implementation
- `src/types/database.ts` - Database type definitions
