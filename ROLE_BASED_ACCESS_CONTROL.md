# Role-Based Access Control Implementation

## Overview

This document describes the implementation of role-based access control (RBAC) in the Candescent Win Room Dashboard, which differentiates between Executive Sponsors (Exec Sponsor) and Delivery Success Managers (DSM) users.

## User Roles

The system now supports four user roles:

1. **admin** - Full system access
2. **exec_sponsor** - Executive sponsors with strategic overview access
3. **dsm** - Delivery Success Managers who manage specific accounts
4. **viewer** - Read-only access (legacy role)

## Role-Based Access Matrix

| Feature | Admin | Exec Sponsor | DSM | Viewer |
|---------|-------|--------------|-----|--------|
| Executive Summary | ✅ | ✅ | ❌ | ✅ |
| Account Search | ✅ | ✅ | ❌ | ❌ |
| My Accounts | ❌ | ❌ | ✅ | ❌ |
| Admin Panel | ✅ | ❌ | ❌ | ❌ |
| Import Data | ✅ | ❌ | ❌ | ❌ |

## Account Access Control

### Executive Sponsor & Admin
- Can view **all accounts** across the organization
- Full access to Account Search with comprehensive filters
- Can filter by DSM, Exec Sponsor, risk levels, and contract expiration

### DSM (Delivery Success Manager)
- Can **only view their own accounts** (where `dsm_id` = user ID)
- Access restricted to "My Accounts" view
- Cannot access Executive Summary or Account Search
- Automatically filtered at the API level for security

## Database Changes

### New User Role
Added `exec_sponsor` to the `user_role` enum type.

### New Risk Indicator Fields
Three new boolean fields added to the `accounts` table:

1. **dsm_risk_assessment** - DSM has flagged this account as at risk
2. **auto_renew** - Account has auto-renewal enabled
3. **pricing_outlier** - Account pricing is flagged as an outlier

### At-Risk Definition

An account is considered "at risk" when **ALL** of the following criteria are met:

1. **ARR > $400,000** (arr_usd > 400)
2. **Contract expiring soon** (subscription_end within 90 days)
3. **At least one risk factor:**
   - Health score < 600
   - DSM risk assessment = true
   - Path to green = false
   - Auto renew = false
   - Pricing outlier = true

## API Changes

### GET /api/accounts
Enhanced with role-based filtering and new filter options:

**Query Parameters:**
- `filter` - Options: `all`, `at_risk`, `top_50_risk`, `contract_expiring`
- `dsm` - Filter by DSM ID (not available for DSM role)
- `exec_sponsor` - Filter by Executive Sponsor ID
- `query` - Search text

**Response includes:**
- `accounts` - Filtered account list
- `userRole` - Current user's role

### GET /api/users/me
New endpoint to retrieve current user information including role.

## Frontend Changes

### New Components

1. **AccountSearch** (`components/dashboard/account-search.tsx`)
   - Replaces the old "At-Risk Account Search"
   - Comprehensive filtering system
   - Risk indicator columns
   - Export to CSV functionality

### Updated Navigation

The dashboard navigation is now dynamically generated based on user role:

**DSM Navigation:**
- My Accounts

**Exec Sponsor Navigation:**
- Executive Summary
- Account Search

**Admin Navigation:**
- Executive Summary
- Account Search
- Admin
- Import

### New Routes

1. `/dashboard/accounts` - Account Search (Exec Sponsor & Admin only)
2. `/dashboard/my-accounts` - My Accounts (DSM only)
3. `/dashboard/executive-summary` - Executive Summary (Exec Sponsor, Admin, Viewer)

## Account Search Features

### Filter Options

1. **View Filter:**
   - All Accounts
   - At Risk Accounts
   - Top 50 At Risk
   - Contract Expiring Soon

2. **DSM Filter:** Filter by specific DSM (not shown for DSM users)
3. **Exec Sponsor Filter:** Filter by Executive Sponsor
4. **Search:** Full-text search across account name, location, DSM, and Exec Sponsor

### Risk Indicator Columns

The Account Search table displays the following risk indicators:

| Column | Description |
|--------|-------------|
| Health<600 | Health score below 600 threshold |
| DSM Risk | DSM has flagged as at risk |
| Auto Renew | Auto-renewal status |
| Price Outlier | Pricing flagged as outlier |

### Additional Columns

- Account Name
- Location
- DSM
- Exec Sponsor
- ARR
- Health Score
- Path to Green
- Contract End Date

### Export Feature

Users can export the filtered account list to CSV including all risk indicators.

## Migration Instructions

### 1. Apply Database Migration

Run the migration to add the new role and fields:

```bash
# Using Supabase CLI
supabase db push

# Or apply the migration file directly
psql -h your-db-host -U postgres -d your-database -f supabase/migrations/add_exec_sponsor_role_and_risk_fields.sql
```

### 2. Update Existing Users

Update user roles in the database as needed:

```sql
-- Update a user to exec_sponsor role
UPDATE users SET role = 'exec_sponsor' WHERE id = 'user-id-here';

-- Update a user to dsm role
UPDATE users SET role = 'dsm' WHERE id = 'user-id-here';
```

### 3. Update Account Risk Indicators

Set the new risk indicator fields for existing accounts:

```sql
-- Example: Set auto_renew based on existing data
UPDATE accounts SET auto_renew = true WHERE ... ;

-- Example: Flag pricing outliers
UPDATE accounts SET pricing_outlier = true WHERE ... ;

-- Example: Set DSM risk assessments
UPDATE accounts SET dsm_risk_assessment = true WHERE ... ;
```

## Testing Guide

### Test DSM Access Control

1. Log in as a DSM user
2. Verify you see only "My Accounts" in the navigation
3. Verify you can only see accounts assigned to you
4. Try accessing `/dashboard/executive-summary` - should redirect to `/dashboard/my-accounts`
5. Try accessing `/dashboard/accounts` - should redirect to `/dashboard/my-accounts`

### Test Exec Sponsor Access Control

1. Log in as an Exec Sponsor user
2. Verify you see "Executive Summary" and "Account Search" in navigation
3. Access Account Search and verify all accounts are visible
4. Test filtering by DSM
5. Test filtering by Exec Sponsor
6. Test filtering by risk level (All, At Risk, Top 50, Contract Expiring)
7. Verify risk indicator columns display correctly
8. Test export functionality

### Test Admin Access Control

1. Log in as an Admin user
2. Verify you see all navigation items
3. Test all filtering options in Account Search
4. Verify you can access all pages

### Test At-Risk Filter Logic

1. Create a test account with:
   - ARR > $400k
   - Contract expiring within 90 days
   - Health score < 600
2. Apply "At Risk Accounts" filter
3. Verify the account appears in results
4. Create another account with ARR < $400k
5. Verify it does NOT appear in "At Risk Accounts" filter

## Security Considerations

1. **Server-Side Filtering:** Account filtering by role is enforced at the API level, not just in the UI
2. **Page-Level Protection:** Each route checks user role server-side before rendering
3. **Automatic Redirects:** Users accessing unauthorized pages are automatically redirected
4. **RLS Policies:** Existing Row Level Security policies in Supabase should be reviewed and updated if needed

## Future Enhancements

Potential improvements for consideration:

1. Add role-based editing permissions for account fields
2. Implement activity ownership restrictions for DSM users
3. Add audit logging for role changes
4. Create role assignment UI in Admin panel
5. Add bulk role update functionality
6. Implement team-based access (DSM managers seeing their team's accounts)

## Rollback Instructions

If issues arise, you can rollback the changes:

```sql
-- Remove new columns from accounts table
ALTER TABLE accounts 
  DROP COLUMN IF EXISTS dsm_risk_assessment,
  DROP COLUMN IF EXISTS auto_renew,
  DROP COLUMN IF EXISTS pricing_outlier;

-- Note: Cannot easily remove enum value, requires recreating the type
-- This is complex and should be done carefully with proper backup
```

It's recommended to backup the database before applying these changes.

## Support

For questions or issues related to role-based access control, please refer to the system documentation or contact the development team.
