# Battle Plan Screen Refactoring Summary

## Overview
This document summarizes the changes made to refactor the Battle Plan screen, including renaming "Battle Plan Activities" to "Activities", converting the Risks section to a table format, and updating the risk types.

## Changes Made

### 1. Database Schema Updates

#### File: `supabase/schema.sql`
- Updated `risk_type` enum from 4 types to 6 types:
  - **Old**: `'Relationship', 'Product', 'Competition', 'Price'`
  - **New**: `'Competition', 'Price', 'Product', 'Delivery', 'Relationship', 'Changes'`

#### File: `supabase/migrations/update_risk_type_enum.sql` (NEW)
- Created migration file to add new risk type values:
  - Added `'Delivery'`
  - Added `'Changes'`
  - Note: PostgreSQL doesn't allow removing enum values, so old values remain valid

### 2. TypeScript Type Definitions

#### File: `lib/types/database.ts`
- Updated `RiskType` type definition to match new enum:
  ```typescript
  export type RiskType = 'Competition' | 'Price' | 'Product' | 'Delivery' | 'Relationship' | 'Changes'
  ```

### 3. Win Room Page (Battle Plan Screen)

#### File: `app/dashboard/accounts/[id]/win-room/page.tsx`

**Renamed Section:**
- Changed "Battle Plan Activities" to "Activities"

**Risks Section Conversion:**
- Converted from card-based layout to table format
- New table columns:
  1. Risk Type (with dropdown)
  2. Key Risk
  3. Summary
  4. Supporting Evidence
  5. Levers to Pull
  6. Actions (Edit/Delete buttons)

**Added Functionality:**
- Added `handleSaveRisk` function for inline risk editing
- Updated risk type dropdown in Add Risk form to include all 6 types
- Made table rows editable with inline forms

**Updated Functions:**
- `getRiskTypeColor` - Now handles all 6 risk types with color coding:
  - Competition: Yellow
  - Price: Blue
  - Product: Orange
  - Delivery: Purple
  - Relationship: Red
  - Changes: Green

### 4. Historical Account View Component

#### File: `components/historical-account-view.tsx`
- Updated `getRiskTypeColor` function to handle all 6 new risk types
- Maintains same color scheme as Win Room page for consistency

### 5. Account Detail Modal Component

#### File: `components/account-detail-modal.tsx`
- Updated `getRiskTypeColor` function to handle all 6 new risk types
- Ensures consistent risk type coloring across the application

### 6. Seed Script

#### File: `scripts/seed.ts`
- Updated `riskTypes` array to include all 6 new risk types:
  ```typescript
  const riskTypes = ['Competition', 'Price', 'Product', 'Delivery', 'Relationship', 'Changes']
  ```

## User Interface Changes

### Before:
- **Activities Section**: Titled "Battle Plan Activities"
- **Risks Section**: Card-based layout with badges and expandable details

### After:
- **Activities Section**: Titled "Activities" (simplified naming)
- **Risks Section**: Professional table layout matching the provided design
  - Headers: Risk Type | Key Risk | Summary | Supporting Evidence | Levers to Pull | Actions
  - Inline editing capability
  - Dropdown for risk type selection with 6 options
  - Clean, scannable format

## Risk Type Dropdown Options
The risk type dropdown now includes these 6 options in order:
1. **Competition** - Competitive alternatives being evaluated
2. **Price** - Pricing sensitivity concerns
3. **Product** - Product gaps identified
4. **Delivery** - Delivery-related issues
5. **Relationship** - Relationship-based risks
6. **Changes** - Changes in strategy, personnel, or priorities

## Color Coding
Each risk type has a distinct color badge:
- 🟡 **Competition**: Yellow
- 🔵 **Price**: Blue
- 🟠 **Product**: Orange
- 🟣 **Delivery**: Purple
- 🔴 **Relationship**: Red
- 🟢 **Changes**: Green

## Files Modified
1. `supabase/schema.sql`
2. `supabase/migrations/update_risk_type_enum.sql` (NEW)
3. `lib/types/database.ts`
4. `app/dashboard/accounts/[id]/win-room/page.tsx`
5. `components/historical-account-view.tsx`
6. `components/account-detail-modal.tsx`
7. `scripts/seed.ts`

## Testing Recommendations
1. ✅ Verify risk type dropdown shows all 6 options
2. ✅ Test adding new risks with different risk types
3. ✅ Test editing existing risks with new risk types
4. ✅ Verify risk type badges show correct colors
5. ✅ Check historical snapshots display risks correctly
6. ✅ Verify account detail modal shows risks properly
7. ✅ Test seed script generates risks with new types

## Database Migration Notes
To apply the migration:
```sql
-- Run the migration file
psql -d your_database < supabase/migrations/update_risk_type_enum.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

## Accessibility
- All form fields have proper `aria-label` attributes
- Table structure uses semantic HTML
- Keyboard navigation supported for all interactive elements

---

**Date**: October 7, 2025
**Status**: ✅ Complete - All TODOs completed, linter errors fixed
