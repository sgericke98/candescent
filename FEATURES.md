# Candescent Win Room Dashboard - Features Documentation

## Overview
Complete customer success management platform for tracking financial institution accounts, health scores, risks, and win room activities.

## Core Features

### 1. Dashboard Views
- **Executive Summary** - KPIs, charts, next/previous win rooms, critical accounts
- **At-Risk Account Search** - Searchable/filterable table of at-risk accounts
- **DSM Account View** - Accounts grouped by DSM with summary cards

### 2. Account Management
- **Detail View Modal** - Complete account information with all fields
- **Edit Functionality** - Update account details (purple-highlighted fields)
- **Battle Plan Navigation** - Quick access to comprehensive planning
- **Win Room Dashboard** - Full context with snapshots

### 3. Win Room Dashboard (`/dashboard/accounts/[id]/win-room`)
- **Overall Account Summary** - Current status and strategic objectives
- **Stakeholders** - Full table with add/edit/delete
- **Risks** - Complete risk management with evidence and levers
- **Battle Plan Activities** - Task tracking with owners
- **Historical Snapshots** - Complete account state at each win room (read-only)

### 4. Data Import System (`/dashboard/import`)
- **CSV/Excel Upload** - Drag & drop or click to upload
- **Smart Field Mapping** - Auto-detects columns
- **Data Preview** - Review before importing
- **Bulk Import** - Accounts, stakeholders, risks, activities, win rooms
- **Template Download** - Get properly formatted templates

### 5. Interactive Charts
- **Accounts at Risk by Exec Sponsor** - Bar chart
- **Total ARR at Risk Trend** - Line chart (6 months)
- **Accounts by Contract Expiry** - Bar chart (renewal pipeline)

## Technical Stack
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Notifications**: Sonner
- **Authentication**: Supabase Auth

## Database Schema
- `accounts` - 18 fields including health scores, dates, financials
- `users` - DSMs, admins, viewers
- `exec_sponsors` - Executive sponsors
- `stakeholders` - Account stakeholders with sentiment
- `risks` - Risk tracking with evidence and mitigation
- `activities` - Tasks and actions with owners
- `win_rooms` - Win room records with complete snapshots

## Health Score System
**Thresholds:**
- 🟢 Green (Healthy): ≥ 700
- 🟡 Yellow (At Risk): 500-699
- 🔴 Red (Critical): < 500

## Key Workflows

### Creating a Win Room
1. Navigate to account's Win Room Dashboard
2. Click "Schedule Win Room"
3. Enter date and outcome notes
4. System automatically captures complete snapshot
5. Snapshot preserved as read-only historical record

### Viewing Historical Snapshots
1. Open Win Room Dashboard
2. Scroll to "Win Room History"
3. Click any historical win room card
4. View complete account state as it was at that time

### Importing Data
1. Click "Import Data" button
2. Select entity type
3. Upload CSV/Excel file
4. Map fields (auto-suggested)
5. Preview and confirm
6. Import completes with results

## Security
- Row Level Security (RLS) policies
- Authenticated access required
- Role-based permissions (DSM, Admin, Viewer)
- Audit trails via updated_at timestamps

## API Endpoints
- GET/PATCH `/api/accounts` - Account management
- GET `/api/accounts/[id]` - Single account with relations
- POST/PATCH/DELETE `/api/activities` - Activity CRUD
- POST/PATCH/DELETE `/api/stakeholders` - Stakeholder CRUD
- POST/PATCH/DELETE `/api/risks` - Risk CRUD
- POST `/api/win-rooms/create-with-snapshot` - Create with snapshot
- GET `/api/kpis` - Calculate dashboard KPIs
- POST `/api/import/accounts` - Bulk import

## Data Integrity
- All frontend fields backed by database columns
- Foreign key relationships enforced
- Automatic triggers for activity counts
- Historical snapshots immutable
- Type-safe TypeScript throughout

## For More Information
- See `README.md` for setup instructions
- See `QUICKSTART.md` for getting started
- See `supabase/schema.sql` for complete database schema
