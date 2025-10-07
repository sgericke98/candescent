# Candescent Win Room Dashboard - System Documentation

## Table of Contents
1. [User Roles & Access Control](#user-roles--access-control)
2. [Health Score Calculation](#health-score-calculation)
3. [KPI Calculations](#kpi-calculations)
4. [Data Management](#data-management)
5. [Win Room Snapshots](#win-room-snapshots)
6. [Important Workflows](#important-workflows)

---

## User Roles & Access Control

### Available Roles

Your system has **3 predefined roles** (defined in `user_role` ENUM):

| Role | Description | Badge Color | Use Case |
|------|-------------|-------------|----------|
| **Admin** | Full system access | 🔴 Red | System administrators, leadership |
| **DSM** | Digital Success Manager | 🔵 Blue | Account managers, CSMs |
| **Viewer** | Read-only access | ⚪ Gray | Stakeholders, observers |

### Role-Based Permissions

| Feature | Viewer | DSM | Admin |
|---------|--------|-----|-------|
| **View Dashboard** | ✅ | ✅ | ✅ |
| **View All Accounts** | ✅ | ✅ | ✅ |
| **View KPIs & Charts** | ✅ | ✅ | ✅ |
| **Edit Own Accounts** | ❌ | ✅ | ✅ |
| **Edit Any Account** | ❌ | ❌ | ✅ |
| **Add/Edit/Delete Stakeholders** | ❌ | ✅ (own accounts) | ✅ (all) |
| **Add/Edit/Delete Risks** | ❌ | ✅ (own accounts) | ✅ (all) |
| **Add/Edit/Delete Activities** | ❌ | ✅ (own accounts) | ✅ (all) |
| **Schedule Win Rooms** | ❌ | ✅ (own accounts) | ✅ (all) |
| **Import Data** | ❌ | ❌ | ✅ |
| **Manage Users** | ❌ | ❌ | ✅ |
| **Manage Exec Sponsors** | ❌ | ❌ | ✅ |

### Admin Management

**Access**: `/dashboard/admin` (Admin button on main dashboard)

**Capabilities:**

#### **DSMs & Users Management**
- **Add Users**: Create new DSMs, Admins, or Viewers
- **Edit Users**: Change name or role
- **Delete Users**: Remove users from system
- **View All**: See all users with their roles

**Fields:**
- Full Name (required)
- Role (required): DSM, Admin, or Viewer

#### **Executive Sponsors Management**
- **Add Sponsors**: Create new executive sponsors
- **Edit Sponsors**: Update sponsor names
- **Delete Sponsors**: Remove sponsors
- **View All**: List all executive sponsors

**Fields:**
- Name (required)

### Database Structure

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Roles enum
CREATE TYPE user_role AS ENUM ('viewer', 'dsm', 'admin');
```

---

## Health Score Calculation

### Overview

Health scores range from **0 to 1000** and determine account status.

### Status Thresholds

| Status | Health Score | Color | Meaning |
|--------|--------------|-------|---------|
| 🟢 **Green** (Healthy) | **≥ 700** | Green | Account is in good standing, will renew |
| 🟡 **Yellow** (At Risk) | **500-699** | Yellow | Account needs attention, some risk |
| 🔴 **Red** (Critical) | **< 500** | Red | High churn risk, urgent action needed |

### Automatic Calculation Formula

Health Score is calculated using **weighted metrics** (industry best practices):

```typescript
Health Score = Σ (Metric Score × Weight)
```

#### **1. Product Adoption & Usage (40% = 400 points)**

**Solutions Adopted:**
- 1 solution: 100 points
- 2-3 solutions: 250 points
- 4+ solutions: 400 points

Based on: `current_solutions` field (comma-separated list)

**Platform Fee Growth:**
- Negative growth: 0 points
- 0-10% growth: 200 points
- >10% growth: 400 points

Based on: `platform_fee_usd` YoY comparison

#### **2. Engagement & Activity (30% = 300 points)**

**QBR Recency** (100 points max):
- < 30 days ago: 100 points
- 30-60 days ago: 75 points
- 60-90 days ago: 50 points
- > 90 days ago: 0 points

Based on: `last_qbr_date`

**Win Room Participation** (100 points max):
- 3+ win rooms (last 6 months): 100 points
- 1-2 win rooms: 50 points
- 0 win rooms: 0 points

Based on: `win_rooms` table count

**Activity Completion Rate** (100 points max):
- > 80% completed: 100 points
- 50-80% completed: 50 points
- < 50% completed: 0 points

Based on: `activities` table, `status = 'Completed'` ratio

#### **3. Financial & Contract Health (20% = 200 points)**

**Contract Renewal Proximity** (100 points max):
- > 180 days until expiry: 100 points
- 90-180 days: 75 points
- 30-90 days: 50 points
- < 30 days: 25 points

Based on: `subscription_end` date

**ARR Stability** (100 points max):
- ARR ≥ $1M: 100 points
- ARR ≥ $500K: 50 points
- ARR < $500K: 0 points

Based on: `arr_usd` field

#### **4. Risk & Relationship Indicators (10% = 100 points)**

**Active Risks** (penalty system):
- 0 risks: 100 points
- 1-2 risks: 50 points
- 3+ risks: 0 points
- **×0.5 if any "Relationship" risk exists**

Based on: `risks` table count and `risk_type`

**Stakeholder Sentiment** (50 points max):
- All green stakeholders: 50 points
- Mixed (some yellow): 25 points
- Any red stakeholders: 0 points

Based on: `stakeholders` table, `status` field

**Path to Green Bonus** (50 points):
- Has clear path to green: +50 points
- No path: 0 points

Based on: `path_to_green` boolean field

### Manual Override

Admins/DSMs can manually adjust health scores if they have business context the algorithm doesn't capture.

**Fields for Override:**
- `health_score_manual_override` (BOOLEAN)
- `health_score_override_reason` (TEXT)
- `health_score_last_calculated` (TIMESTAMPTZ)

### Implementation

```typescript
function calculateHealthScore(account, activities, risks, stakeholders, winRooms) {
  let score = 0
  
  // 1. Product Adoption (400 points)
  const solutionsCount = (account.current_solutions?.split(',').length || 0)
  score += Math.min(solutionsCount * 100, 400)
  
  // 2. Engagement (300 points)
  const daysSinceQBR = getDaysSince(account.last_qbr_date)
  score += daysSinceQBR < 30 ? 100 : daysSinceQBR < 60 ? 75 : daysSinceQBR < 90 ? 50 : 0
  
  const recentWinRooms = winRooms.filter(wr => isWithinLast6Months(wr.date)).length
  score += recentWinRooms >= 3 ? 100 : recentWinRooms >= 1 ? 50 : 0
  
  const completionRate = calculateCompletionRate(activities)
  score += completionRate > 0.8 ? 100 : completionRate > 0.5 ? 50 : 0
  
  // 3. Financial Health (200 points)
  const daysToRenewal = getDaysUntil(account.subscription_end)
  score += daysToRenewal > 180 ? 100 : daysToRenewal > 90 ? 75 : daysToRenewal > 30 ? 50 : 25
  score += account.arr_usd >= 1000 ? 100 : account.arr_usd >= 500 ? 50 : 0
  
  // 4. Risk Indicators (100 points)
  const riskPenalty = Math.min(risks.length * 25, 100)
  const hasRelationshipRisk = risks.some(r => r.risk_type === 'Relationship')
  score += 100 - (hasRelationshipRisk ? riskPenalty * 1.5 : riskPenalty)
  
  const greenStakeholders = stakeholders.filter(s => s.status === 'green').length
  score += stakeholders.length > 0 ? (greenStakeholders / stakeholders.length) * 50 : 0
  
  if (account.path_to_green) score += 50
  
  return Math.min(Math.max(Math.round(score), 0), 1000)
}
```

---

## KPI Calculations

All KPIs are calculated in real-time from the database via `/api/kpis`.

### 1. Total ARR at Risk

```sql
SELECT SUM(arr_usd) * 1000 
FROM accounts 
WHERE status IN ('yellow', 'red')
```

**Returns**: Dollar amount of at-risk ARR

### 2. Accounts at Risk

```sql
SELECT COUNT(*) 
FROM accounts 
WHERE status IN ('yellow', 'red')
```

**Returns**: Count of yellow and red accounts

### 3. WoW Change

```sql
SELECT COUNT(*) 
FROM accounts 
WHERE status IN ('yellow', 'red')
  AND updated_at >= (CURRENT_DATE - INTERVAL '7 days')
```

**Calculation**: 
```typescript
wowChangePercent = (recentlyAtRisk / totalAtRisk) * 100
```

**Returns**: Percentage of accounts that became at-risk this week

### 4. Accounts Through Win Room

```sql
SELECT COUNT(DISTINCT account_id) 
FROM win_rooms 
WHERE date >= (CURRENT_DATE - INTERVAL '30 days')
```

**Returns**: Unique count of accounts that had win rooms in last 30 days

### 5. Outstanding Follow-Ups

```sql
SELECT COUNT(*) 
FROM activities 
WHERE status != 'Completed'
```

**Returns**: Count of open activities (Not Started + In Progress)

### Top-50 Risk List

```typescript
const top50AtRisk = accounts
  .filter(acc => acc.status === 'yellow' || acc.status === 'red')
  .sort((a, b) => a.health_score - b.health_score)  // Lowest first
  .slice(0, 50)
```

Identifies the 50 accounts with lowest health scores that are at risk.

---

## Data Management

### Import System

**Access**: `/dashboard/import` (Admin only)

**Supported Formats:**
- CSV files (.csv)
- Excel files (.xlsx, .xls)
- Clipboard paste (from Excel/Google Sheets)

**Import Process:**
1. **Upload/Paste** - Choose file or paste data
2. **Map Fields** - Auto-mapping with manual adjustment
3. **Preview** - Review first 5 rows
4. **Import** - Process all records with validation
5. **Results** - Success/failure counts with errors

**Entities Supported:**
- Accounts (18 fields)
- Stakeholders (4 fields)
- Risks (5 fields)
- Activities (5 fields)
- Win Rooms (2 fields)

**Validation:**
- Required field checks
- Type conversion (numbers, dates, booleans)
- Default values for missing data
- Per-row error reporting

**Upsert Logic:**
- Existing records (by name) are updated
- New records are created
- No duplicates

---

## Win Room Snapshots

### Purpose

Win Rooms capture a **complete point-in-time snapshot** of the account state, creating an immutable historical record.

### What's Captured

When a win room is created, the system snapshots:

1. **Complete Account Object** (`account_snapshot` JSONB)
   - All 18 account fields
   - DSM information
   - Exec Sponsor information
   - Health score
   - Status
   - ARR
   - All dates and metrics

2. **All Stakeholders** (`stakeholders_snapshot` JSONB)
   - Names, roles, descriptions
   - Status indicators

3. **All Risks** (`risks_snapshot` JSONB)
   - Risk types, key risks
   - Summaries, evidence, levers

4. **All Activities** (`activities_snapshot` JSONB)
   - Activities with descriptions
   - Owners and statuses
   - Due dates

5. **Outcome Notes** (`outcome_notes` TEXT)
   - Meeting outcomes
   - Decisions made
   - Next steps

### Historical View

**Click any past win room** → Opens **Historical Account View Modal**

Shows the **entire account detail page** as it was at that moment:
- All account fields (read-only, gray background)
- All stakeholders that existed
- All risks that were documented
- All activities that were in progress
- Win room outcomes

**Benefits:**
- Compare account evolution over time
- Reference past states for decision making
- Audit trail of account changes
- Immutable records for compliance

### Database Schema

```sql
ALTER TABLE win_rooms ADD COLUMN account_snapshot JSONB;
ALTER TABLE win_rooms ADD COLUMN stakeholders_snapshot JSONB;
ALTER TABLE win_rooms ADD COLUMN risks_snapshot JSONB;
ALTER TABLE win_rooms ADD COLUMN activities_snapshot JSONB;
ALTER TABLE win_rooms ADD COLUMN is_historical BOOLEAN DEFAULT true;
```

---

## Important Workflows

### 1. Creating a Win Room with Snapshot

**Process:**
1. Navigate to account's Win Room Dashboard
2. Click "Schedule Win Room"
3. Enter date and outcome notes
4. System automatically:
   - Captures current account state
   - Snapshots all stakeholders
   - Snapshots all risks
   - Snapshots all activities
   - Creates immutable record

**API**: `POST /api/win-rooms/create-with-snapshot`

### 2. Viewing Historical Snapshots

**Process:**
1. Open Win Room Dashboard
2. Scroll to "Win Room History"
3. Click "📸 View Complete Snapshot" button
4. Modal opens showing account as it was

**Result:**
- Complete account detail page
- All fields from that point in time
- Read-only view
- Historical context preserved

### 3. Managing DSMs & Executive Sponsors

**Access**: Admin only

**DSM Management:**
1. Click "👤 Admin" button on dashboard
2. Go to "DSMs & Users" tab
3. Click "Add User" or edit existing
4. Assign role: DSM, Admin, or Viewer
5. Save changes

**Sponsor Management:**
1. Go to "Executive Sponsors" tab
2. Click "Add Executive Sponsor"
3. Enter sponsor name
4. Save

**Effect:**
- New DSMs appear in account assignments
- New sponsors appear in account dropdowns
- Changes reflect immediately across all views

### 4. Bulk Data Import

**Access**: Admin only via "Import Data" button

**Process:**
1. Select entity type (Accounts, Stakeholders, etc.)
2. Choose import method:
   - Upload CSV/Excel file
   - Paste from clipboard
   - Download template for reference
3. Map fields (auto-suggested)
4. Preview data
5. Import with validation
6. Review results

**Supports:**
- Up to thousands of records
- Field mapping for any column names
- Validation and error reporting
- Upsert (update existing or create new)

### 5. Account Health Monitoring

**Automatic:**
- Health scores auto-calculated based on metrics
- Status updated based on score thresholds
- Historical snapshots track changes

**Manual:**
- Admin/DSM can manually adjust health scores
- Must provide reason for override
- System tracks both calculated and manual scores

---

## Historical Data Tracking

### Health Score Snapshots Table

Stores daily/weekly snapshots for trending:

```sql
CREATE TABLE health_score_snapshots (
  account_id UUID,
  health_score INTEGER,
  status account_status,
  arr_usd NUMERIC,
  snapshot_date DATE,
  UNIQUE(account_id, snapshot_date)
);
```

**Purpose:**
- Powers ARR Trend Chart
- Tracks health score changes over time
- Enables historical analysis

**Capture:**
- Automatic (daily via scheduled job)
- Manual via: `POST /api/snapshots/capture`

**Usage:**
```bash
# Capture today's snapshot
curl -X POST http://localhost:3000/api/snapshots/capture

# Generate historical data (6 months)
npx tsx scripts/generate-historical-snapshots.ts
```

---

## Charts Data Sources

All charts use **100% real database data**:

### 1. Accounts at Risk by Exec Sponsor

```typescript
accounts
  .filter(account => has exec_sponsor)
  .groupBy(exec_sponsor.name)
  .count(status === 'green' vs. status !== 'green')
```

**Real-time calculation** from current accounts

### 2. Total ARR at Risk Trend

```typescript
health_score_snapshots
  .filter(status === 'yellow' OR status === 'red')
  .groupBy(month)
  .sum(arr_usd)
```

**Historical data** from snapshots table (last 6 months)

### 3. Accounts by Contract Expiry Date

```typescript
accounts
  .filter(subscription_end > today)
  .groupBy(month_year of subscription_end)
  .count()
```

**Real-time calculation** from subscription dates

---

## Security & Data Integrity

### Row Level Security (RLS)

**All tables have RLS enabled:**
- Authenticated users can read all data
- DSMs can edit their own accounts' data
- Admins have full access
- Policies prevent unauthorized modifications

### Audit Trail

**Tracked Automatically:**
- `created_at` - When record was created
- `updated_at` - Last modification time
- Win room snapshots preserve historical states
- Health score history tracks changes

### API Authorization

**Every admin-only endpoint checks:**
1. User is authenticated (`auth.uid()`)
2. User's role from database
3. Returns 403 if not admin

**Protected Endpoints:**
- `/api/users` (POST, PATCH, DELETE)
- `/api/exec-sponsors` (POST, PATCH, DELETE)
- `/api/import/*` (all methods)

---

## Key Database Fields

### Accounts Table (18 fields)

| Field | Type | Description | Editable |
|-------|------|-------------|----------|
| `name` | TEXT | Account name | ❌ |
| `type` | TEXT | Bank, Credit Union, etc. | ❌ |
| `location` | TEXT | Geographic location | ❌ |
| `rssid` | TEXT | RSS Identifier | ❌ |
| `di_number` | TEXT | DI Number | ❌ |
| `aum` | NUMERIC | Assets Under Management | ❌ |
| `arr_usd` | NUMERIC | Annual Recurring Revenue | ❌ |
| `platform_fee_usd` | NUMERIC | Platform fee | ❌ |
| `dsm_id` | UUID | Assigned DSM | ❌ |
| `exec_sponsor_id` | UUID | Executive Sponsor | ❌ |
| `health_score` | INTEGER | 0-1000 score | 🔜 |
| `status` | ENUM | green/yellow/red | Auto |
| `path_to_green` | BOOLEAN | Recovery plan exists | ✅ |
| `last_qbr_date` | DATE | Last QBR | ✅ |
| `last_touchpoint` | DATE | Last interaction | ✅ |
| `subscription_end` | DATE | Contract expiry | ✅ |
| `current_solutions` | TEXT | Products in use | ✅ |
| `next_win_room` | DATE | Next win room date | ✅ |
| `open_activities_count` | INTEGER | Open activity count | Auto |

---

## For Developers

### Key Files

**Backend:**
- `app/api/kpis/route.ts` - KPI calculations
- `app/api/accounts/*/route.ts` - Account CRUD
- `app/api/users/route.ts` - User management (admin)
- `app/api/exec-sponsors/route.ts` - Sponsor management (admin)
- `app/api/snapshots/capture/route.ts` - Snapshot system

**Frontend:**
- `components/dashboard/executive-summary.tsx` - Main dashboard
- `app/dashboard/accounts/[id]/win-room/page.tsx` - Win Room Dashboard
- `app/dashboard/admin/page.tsx` - Admin settings
- `app/dashboard/import/page.tsx` - Data import
- `components/account-detail-modal.tsx` - Account details

**Database:**
- `supabase/schema.sql` - Complete schema
- `supabase/migrations/*` - Schema updates
- `scripts/seed.ts` - Sample data generation

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

---

## Support & Troubleshooting

### Common Issues

**1. "Infinite recursion in policy"**
- Run `scripts/fix-rls-clean.sql` in Supabase
- Ensures policies don't self-reference

**2. "Account detail modal won't open"**
- Check that account has `dsm` and `exec_sponsor` joined
- Verify RLS policies allow reading related tables

**3. "Import fails with errors"**
- Check required fields (account name)
- Verify data types match (numbers as numbers, dates as YYYY-MM-DD)
- Review error messages in results

**4. "Charts show no data"**
- Run snapshot generation: `npx tsx scripts/generate-historical-snapshots.ts`
- Verify accounts have `exec_sponsor` and `subscription_end` populated

### Getting Help

For issues:
1. Check browser console for errors
2. Check terminal for API errors
3. Review `supabase/schema.sql` for database structure
4. Verify user has appropriate role permissions

---

## Roadmap & Future Enhancements

**Potential Additions:**
- Automated health score calculation (scheduled job)
- Health score trend visualization per account
- Email notifications for at-risk accounts
- Slack/Teams integration for alerts
- Advanced filtering and search
- Export to PDF/Excel
- Custom dashboard views per role
- Activity assignment to specific users
- Bulk operations on multiple accounts
- Custom fields per account type
- Integration with CRM systems (Salesforce, HubSpot)
- Advanced analytics and predictive models

---

*Last Updated: [Current Date]*  
*Version: 1.0*
