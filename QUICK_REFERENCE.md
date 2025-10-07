# 🚀 Quick Reference Card

## Setup Commands

```bash
# 1. Apply database migration (run once)
supabase db push

# 2. Create test users and update accounts (run once)
npm run setup:test-users

# 3. Start development server
npm run dev
```

## 🔐 Login Credentials

### Your Admin Access (Auto-Granted)
- **daniel.ban@techtorch.io** - Use magic link
- **santiago.gericke@techtorch.io** - Use magic link

### Test Users (Password Login)
| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@candescent.test | `Admin123!@#` |
| 📊 Exec Sponsor | exec@candescent.test | `Exec123!@#` |
| 👤 DSM | dsm@candescent.test | `DSM123!@#` |

## 🎯 What Each Role Sees

### DSM (Delivery Success Manager)
- **Navigation:** My Accounts only
- **View:** Card-based view with account details
- **Access:** Only their assigned accounts
- **Can't Access:** Executive Summary, Account Search, Admin

### Exec Sponsor (Executive Sponsor)
- **Navigation:** Executive Summary, Account Search
- **View:** Table-based search with filters
- **Access:** All accounts with full filtering
- **Can't Access:** Admin panel, Import

### Admin
- **Navigation:** Everything (Executive Summary, Account Search, Admin, Import)
- **Access:** Full system access

## 🔍 Account Search Filters

### View Options
- **All Accounts** - Show everything
- **At Risk Accounts** - ARR>400k + expiring + risk factors
- **Top 50 At Risk** - Worst 50 by health score
- **Contract Expiring Soon** - Within 90 days

### Additional Filters
- **DSM Filter** - Filter by specific DSM (not visible to DSM users)
- **Exec Sponsor Filter** - Filter by executive sponsor
- **Search Box** - Search name, location, DSM, exec sponsor

## 📊 Risk Indicators

| Indicator | What it Means |
|-----------|---------------|
| Health<600 | Health score below 600 |
| DSM Risk | DSM flagged this account |
| Auto Renew | Auto-renewal status |
| Price Outlier | Pricing flagged as outlier |

## 🐛 Quick Fixes

### Magic Link Not Working?
1. Clear browser cache/cookies
2. Check spam folder
3. Try incognito mode
4. Make sure migration ran: `supabase db push`

### Can't See Accounts?
1. Run: `npm run setup:test-users`
2. Make sure you're logged in as correct role
3. Check DSM has accounts assigned

### No Risk Indicators?
1. Run: `npm run setup:test-users`
2. This updates all accounts with risk data

## 📱 Test Scenarios

**Quick Test Flow:**
1. Login as DSM → See only "My Accounts" tab with card-based view
2. Login as Exec → See "Executive Summary" + "Account Search" tabs
3. Try filters in Account Search (table view with risk indicators)
4. Export CSV from Account Search
5. Login with your @techtorch.io email → See everything as admin

## 📂 Important Files

```
app/
├── auth/
│   ├── callback/route.ts       # Fixed: Creates user records
│   └── login/page.tsx          # Fixed: Ensures user records
├── dashboard/
│   ├── layout.tsx              # Fixed: Fallback user creation
│   ├── accounts/page.tsx       # Account Search (Exec/Admin)
│   └── my-accounts/page.tsx    # My Accounts (DSM)
├── api/
│   ├── accounts/route.ts       # Role-based filtering
│   └── users/me/route.ts       # Get current user
components/
└── dashboard/
    └── account-search.tsx      # Enhanced search component
scripts/
└── setup-test-users.ts         # Creates test users
```

## 🎨 Color Codes (Just for Reference)

- 🟢 Green Status (Health ≥ 700)
- 🟡 Yellow Status (500-699)
- 🔴 Red Status (< 500)

---

**Keep this handy for quick testing!** ✨
