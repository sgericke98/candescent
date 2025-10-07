# DSM View & Executive Access Implementation

## Summary of Changes

This document describes the implementation to ensure proper role-based views:
1. **DSMs** see "My Accounts" with a card-based view
2. **Executive Sponsors** see both "Executive Summary" and "Account Search" tabs

## Changes Made

### 1. New Component: DSM Card View
**File:** `components/dashboard/dsm-view.tsx`

Created a new component specifically for DSM users that displays their assigned accounts as cards. Features:
- Card-based layout (responsive grid: 1 column mobile, 2 tablet, 3 desktop)
- Search functionality to filter accounts by name or location
- Shows account count
- Displays account details including:
  - Account name and location
  - Status badge (GREEN/YELLOW/RED)
  - ARR (Annual Recurring Revenue)
  - Health Score with color chip
  - Path to Green indicator
  - Next Win Room date
  - Open Activities count
- Click on any card to view full account details in modal

### 2. Updated My Accounts Page
**File:** `app/dashboard/my-accounts/page.tsx`

Changed from using the table-based `AccountSearch` component to the new card-based `DsmView` component.

**Before:** DSMs saw a table view (same as Account Search)
**After:** DSMs see a card view optimized for their workflow

### 3. Updated Documentation
**File:** `QUICK_REFERENCE.md`

Updated to clearly document:
- DSMs see "My Accounts" with card-based view
- Exec Sponsors see both "Executive Summary" and "Account Search" tabs
- Different view types for different roles

### 4. Diagnostic Script
**File:** `scripts/check-exec-roles.ts`

Created a utility script to verify user roles in the database. Useful for troubleshooting access issues.

Usage:
```bash
npx tsx scripts/check-exec-roles.ts
```

## Role-Based Views

### DSM (Delivery Success Manager)
- **Navigation Tabs:** My Accounts only
- **View Type:** Card-based grid
- **What They See:** Only accounts assigned to them
- **Features:**
  - Visual card layout
  - Search by account name/location
  - Quick overview of key metrics
  - Click to view detailed modal

### Executive Sponsor
- **Navigation Tabs:** Executive Summary + Account Search
- **View Type:** Table-based with filters
- **What They See:** All accounts across the organization
- **Features:**
  - Comprehensive filtering (by DSM, Exec Sponsor, risk level)
  - Sortable columns
  - Risk indicator columns
  - Export to CSV

### Admin
- **Navigation Tabs:** Executive Summary + Account Search + Admin + Import
- **View Type:** Full access to all views
- **What They See:** Everything

## Configuration Location

The role-based navigation is configured in:
**File:** `app/dashboard/layout.tsx` (lines 53-77)

```typescript
if (currentUser.role === 'dsm') {
  navigation.push(
    { name: 'My Accounts', href: '/dashboard/my-accounts' }
  )
} else if (currentUser.role === 'exec_sponsor') {
  navigation.push(
    { name: 'Executive Summary', href: '/dashboard/executive-summary' },
    { name: 'Account Search', href: '/dashboard/accounts' }
  )
} else if (currentUser.role === 'admin') {
  navigation.push(
    { name: 'Executive Summary', href: '/dashboard/executive-summary' },
    { name: 'Account Search', href: '/dashboard/accounts' },
    { name: 'Admin', href: '/dashboard/admin' },
    { name: 'Import', href: '/dashboard/import' }
  )
}
```

## Testing

### Test DSM View
1. Login as `dsm@candescent.test` (password: `DSM123!@#`)
2. Verify you see only "My Accounts" in the navigation
3. Verify accounts are displayed as cards (not a table)
4. Test search functionality
5. Click on a card to open the detail modal

### Test Executive Sponsor View
1. Login as `exec@candescent.test` (password: `Exec123!@#`)
2. Verify you see both "Executive Summary" and "Account Search" tabs
3. Navigate to Account Search
4. Verify you see a table with all accounts and filter options
5. Test various filters (At Risk, DSM filter, Exec Sponsor filter)

### Verify User Roles
Run the diagnostic script:
```bash
npx tsx scripts/check-exec-roles.ts
```

This will show all users and their roles. If an executive sponsor doesn't see both tabs, check their role in the database.

## Troubleshooting

### Executive Sponsor Only Sees One Tab
**Problem:** An executive sponsor user only sees "Executive Summary" tab

**Solution:**
1. Check their role: `npx tsx scripts/check-exec-roles.ts`
2. If their role is not `exec_sponsor`, update it:
   ```sql
   UPDATE users SET role = 'exec_sponsor' WHERE id = 'user-id';
   ```
3. Have them logout and login again

### DSM Sees Table Instead of Cards
**Problem:** DSM sees a table view instead of cards

**Cause:** The page might be cached or the role is incorrect

**Solution:**
1. Hard refresh the browser (Cmd+Shift+R or Ctrl+Shift+R)
2. Check the user's role is set to `dsm`
3. Verify the page is `/dashboard/my-accounts` not `/dashboard/accounts`

### No Accounts Showing for DSM
**Problem:** DSM sees "No accounts assigned yet"

**Solution:**
1. Assign accounts to the DSM:
   ```sql
   UPDATE accounts SET dsm_id = 'dsm-user-id' WHERE id = 'account-id';
   ```
2. Or run: `npm run setup:test-users` to assign test accounts

## Files Modified

- ✅ `components/dashboard/dsm-view.tsx` (NEW)
- ✅ `app/dashboard/my-accounts/page.tsx` (UPDATED)
- ✅ `QUICK_REFERENCE.md` (UPDATED)
- ✅ `scripts/check-exec-roles.ts` (NEW - diagnostic tool)

## Files NOT Modified

These files were already correctly configured:
- `app/dashboard/layout.tsx` - Navigation was already correct
- `app/dashboard/accounts/page.tsx` - Already allows exec_sponsor access
- `app/dashboard/executive-summary/page.tsx` - Already allows exec_sponsor access
- `app/api/accounts/route.ts` - Already filters correctly by role

## Next Steps

1. Test with actual users to ensure everything works
2. If needed, run the diagnostic script to verify user roles
3. Update user roles in the database as needed

---

**Implementation Date:** Current
**Status:** ✅ Complete
