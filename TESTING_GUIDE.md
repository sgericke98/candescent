# Testing Guide - Role-Based Access Control

## 🚀 Quick Setup

### Step 1: Apply Database Migration
First, ensure the database has the latest schema with exec_sponsor role and risk indicators:

```bash
cd /Users/danielban/candescent
supabase db push
```

### Step 2: Create Test Users
Run the setup script to create test users and update account risk indicators:

```bash
npm run setup:test-users
```

This will:
- Create 3 test users with different roles
- Set up admin access for your TechTorch emails
- Update existing accounts with risk indicator fields
- Assign some accounts to the Test DSM

## 🔐 Test User Credentials

You can now test the application with these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@candescent.test | Admin123!@# |
| **Executive Sponsor** | exec@candescent.test | Exec123!@# |
| **DSM** | dsm@candescent.test | DSM123!@# |

## 👥 Admin Access (Auto-Granted)

These emails are automatically granted admin role when they log in (via magic link or password):
- daniel.ban@techtorch.io
- santiago.gericke@techtorch.io

## 🧪 Testing Scenarios

### Test 1: Magic Link Authentication (Fixed!)
1. Go to login page
2. Switch to "Magic Link" tab
3. Enter `daniel.ban@techtorch.io`
4. Check your email and click the magic link
5. ✅ You should be redirected to `/dashboard` (not back to login)
6. ✅ You should see all admin navigation options

**What Was Fixed:**
- Auth callback now creates user record in `users` table automatically
- Admin emails are auto-detected and granted admin role
- No more redirect loop back to login page

### Test 2: Password Login
1. Go to login page
2. Use one of the test credentials above
3. Sign in with email/password
4. ✅ You should be logged in and see appropriate navigation based on role

### Test 3: DSM Role Access
1. Log in as: `dsm@candescent.test` / `DSM123!@#`
2. ✅ You should see only "My Accounts" in navigation
3. ✅ You should only see accounts assigned to you
4. Try navigating to `/dashboard/executive-summary`
   - ✅ Should redirect to `/dashboard/my-accounts`
5. Try navigating to `/dashboard/accounts`
   - ✅ Should redirect to `/dashboard/my-accounts`

### Test 4: Exec Sponsor Role Access
1. Log in as: `exec@candescent.test` / `Exec123!@#`
2. ✅ You should see "Executive Summary" and "Account Search" in navigation
3. Go to "Account Search"
4. ✅ You should see ALL accounts in the system
5. Test the filters:
   - **View Filter:** Try "All", "At Risk", "Top 50 At Risk", "Contract Expiring"
   - **DSM Filter:** Filter by specific DSM
   - **Exec Sponsor Filter:** Filter by executive sponsor
6. ✅ Verify risk indicator columns show data:
   - Health<600
   - DSM Risk
   - Auto Renew
   - Price Outlier
7. Click "Export" button
   - ✅ CSV file should download with all data

### Test 5: Admin Role Access
1. Log in as: `admin@candescent.test` / `Admin123!@#`
2. ✅ You should see all navigation options:
   - Executive Summary
   - Account Search
   - Admin
   - Import
3. ✅ All features should be accessible

### Test 6: At-Risk Filter Logic
Go to Account Search and apply "At Risk Accounts" filter.

Accounts should appear if they meet ALL of these criteria:
1. ✅ ARR > $400,000
2. ✅ Contract expiring within 90 days
3. ✅ At least one risk factor:
   - Health score < 600 OR
   - DSM risk assessment = true OR
   - Path to green = false OR
   - Auto renew = false OR
   - Pricing outlier = true

### Test 7: Top 50 At Risk
1. Apply "Top 50 At Risk" filter
2. ✅ Should show maximum 50 accounts
3. ✅ Should be sorted by health score (worst first)
4. ✅ All accounts should meet at-risk criteria

### Test 8: Contract Expiring Soon
1. Apply "Contract Expiring Soon" filter
2. ✅ Should show accounts with subscription_end within 90 days
3. ✅ Contracts should be sorted by date

## 🔍 What to Verify

### Navigation
- [ ] DSM sees only "My Accounts"
- [ ] Exec Sponsor sees "Executive Summary" + "Account Search"
- [ ] Admin sees all options including "Admin" and "Import"

### Data Access
- [ ] DSM sees only their own accounts
- [ ] Exec Sponsor sees all accounts
- [ ] Admin sees all accounts

### Redirects
- [ ] DSM accessing `/dashboard/executive-summary` → redirects to `/dashboard/my-accounts`
- [ ] DSM accessing `/dashboard/accounts` → redirects to `/dashboard/my-accounts`
- [ ] Exec Sponsor cannot access `/dashboard/admin` → redirects
- [ ] Exec Sponsor cannot access `/dashboard/import` → redirects

### Risk Indicators
- [ ] Health<600 badge shows correctly
- [ ] DSM Risk badge shows correctly
- [ ] Auto Renew status shows correctly
- [ ] Price Outlier badge shows correctly

### Filtering
- [ ] Search box filters across multiple fields
- [ ] DSM filter works (Exec Sponsor only)
- [ ] Exec Sponsor filter works
- [ ] View filters apply correct logic

### Export
- [ ] Export button generates CSV
- [ ] CSV includes all visible columns
- [ ] CSV includes risk indicator columns

## 🐛 Troubleshooting

### Issue: Magic link still redirects to login
**Solution:**
1. Clear browser cookies and cache
2. Make sure you've applied the database migration
3. Check that the auth callback route has been updated
4. Try again with a fresh magic link

### Issue: User not found after login
**Solution:**
1. Run `npm run setup:test-users` again
2. The system should auto-create user records now
3. If still failing, check Supabase logs

### Issue: DSM sees all accounts
**Solution:**
1. Verify the DSM user has accounts assigned to them
2. Check the `/api/accounts` endpoint is filtering by role
3. Run the setup script to assign accounts: `npm run setup:test-users`

### Issue: Risk indicators show "No" for everything
**Solution:**
1. Run `npm run setup:test-users` to populate risk indicators
2. This script updates all existing accounts with sample risk data

### Issue: At-risk filter shows no results
**Solution:**
1. The at-risk definition is strict (requires ARR>400k, contract expiring, and risk factors)
2. Run `npm run setup:test-users` to ensure accounts have risk indicators set
3. Check that accounts exist meeting all criteria

## 📊 Sample Data

After running `npm run setup:test-users`, you should have:
- 3 test users (admin, exec sponsor, DSM)
- Updated accounts with risk indicators set
- 5 accounts assigned to Test DSM
- ~70% of accounts with auto-renew enabled
- High-value accounts flagged as pricing outliers
- Some accounts flagged by DSM as at-risk

## 🔄 Resetting Test Data

To reset and recreate test users:

```bash
# This will update existing users or create new ones
npm run setup:test-users
```

To fully reset the database (WARNING: deletes all data):

```bash
supabase db reset
npm run seed
npm run setup:test-users
```

## 📧 Email Testing

### For TechTorch Admins:
1. Go to login page
2. Switch to "Magic Link"
3. Enter your @techtorch.io email
4. Check your email for the magic link
5. Click the link
6. ✅ You should be logged in with admin access

### For Test Users:
Use the password login with the credentials provided above.

## 🎯 Success Criteria

All tests pass when:
- ✅ Magic link authentication works without redirect loop
- ✅ All three test user types can log in
- ✅ DSM users see only their accounts
- ✅ Exec Sponsors see all accounts with full filtering
- ✅ Risk indicators display correctly
- ✅ At-risk filters apply correct logic
- ✅ Export functionality works
- ✅ Role-based navigation works
- ✅ Role-based redirects work

## 📝 Notes

- **Passwords are simple for testing** - Use stronger passwords in production
- **Test emails use @candescent.test domain** - These are local test accounts
- **Admin emails are hardcoded** - You can add more in the auth callback and login code
- **Risk indicators are randomly generated** - Real data should come from your system

---

**Happy Testing!** 🚀

If you encounter any issues, check the browser console and Supabase logs for error messages.
