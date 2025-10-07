# RBAC Quick Start Guide

## 🎯 What Was Built

A comprehensive role-based access control system that differentiates between Executive Sponsors and DSMs, with enhanced account search capabilities and risk analysis.

## 📊 User Role Matrix

```
┌─────────────────┬───────────────────────┬────────────────┬──────────────────┐
│ Role            │ Navigation            │ Account Access │ Key Features     │
├─────────────────┼───────────────────────┼────────────────┼──────────────────┤
│ DSM             │ • My Accounts         │ Own accounts   │ • Account mgmt   │
│                 │                       │ only           │ • Limited view   │
├─────────────────┼───────────────────────┼────────────────┼──────────────────┤
│ Exec Sponsor    │ • Executive Summary   │ All accounts   │ • Full analytics │
│                 │ • Account Search      │                │ • Risk filters   │
│                 │                       │                │ • Export data    │
├─────────────────┼───────────────────────┼────────────────┼──────────────────┤
│ Admin           │ • Executive Summary   │ All accounts   │ • All features   │
│                 │ • Account Search      │                │ • Admin panel    │
│                 │ • Admin               │                │ • Import data    │
│                 │ • Import              │                │                  │
├─────────────────┼───────────────────────┼────────────────┼──────────────────┤
│ Viewer          │ • Executive Summary   │ All accounts   │ • Read-only      │
│                 │                       │ (read-only)    │                  │
└─────────────────┴───────────────────────┴────────────────┴──────────────────┘
```

## 🔐 Security Architecture

```
Request Flow:
┌──────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────┐
│  User    │────▶│ Auth Check   │────▶│ Role Check    │────▶│ Data     │
│ Request  │     │ (Supabase)   │     │ (API Layer)   │     │ Filter   │
└──────────┘     └──────────────┘     └───────────────┘     └──────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │ DSM? Filter by  │
                                     │ dsm_id = user.id│
                                     └─────────────────┘
```

## 🎨 New Account Search Features

### Filter Options:
```
View:
├── All Accounts
├── At Risk Accounts (>400k ARR + contract expiring + risk factors)
├── Top 50 At Risk (worst health scores)
└── Contract Expiring Soon (within 90 days)

By DSM: (Exec Sponsor/Admin only)
├── All DSMs
└── Select specific DSM

By Exec Sponsor:
├── All Exec Sponsors
└── Select specific Exec Sponsor
```

### Risk Indicators Displayed:
```
┌─────────────────┬────────────────────────────────────────┐
│ Indicator       │ Criteria                               │
├─────────────────┼────────────────────────────────────────┤
│ Health < 600    │ health_score < 600                     │
│ DSM Risk        │ dsm_risk_assessment = true             │
│ Auto Renew      │ auto_renew status                      │
│ Price Outlier   │ pricing_outlier = true                 │
└─────────────────┴────────────────────────────────────────┘
```

## 🗄️ Database Changes

### New Fields on `accounts` table:
```sql
dsm_risk_assessment BOOLEAN DEFAULT false
auto_renew          BOOLEAN DEFAULT false
pricing_outlier     BOOLEAN DEFAULT false
```

### New User Role:
```sql
user_role ENUM: 'viewer', 'dsm', 'admin', 'exec_sponsor'
```

## 🚀 Getting Started (3 Steps)

### Step 1: Apply Migration
```bash
cd /Users/danielban/candescent
supabase db push
```

### Step 2: Update User Roles
```sql
-- Make users Exec Sponsors
UPDATE users SET role = 'exec_sponsor' 
WHERE email IN ('exec1@company.com', 'exec2@company.com');

-- Make users DSMs
UPDATE users SET role = 'dsm' 
WHERE email IN ('dsm1@company.com', 'dsm2@company.com');
```

### Step 3: Test Access
1. Log in as DSM → See only "My Accounts" with your accounts
2. Log in as Exec Sponsor → See "Executive Summary" + "Account Search" with all accounts

## 📁 File Structure

```
candescent/
├── supabase/
│   ├── migrations/
│   │   └── add_exec_sponsor_role_and_risk_fields.sql  ← NEW
│   └── schema.sql  ← UPDATED
├── app/
│   ├── api/
│   │   ├── accounts/route.ts  ← UPDATED (role-based filtering)
│   │   └── users/me/route.ts  ← NEW
│   └── dashboard/
│       ├── layout.tsx  ← UPDATED (role-based nav)
│       ├── page.tsx  ← UPDATED (role-based redirect)
│       ├── accounts/page.tsx  ← NEW (Exec Sponsor view)
│       ├── my-accounts/page.tsx  ← NEW (DSM view)
│       └── executive-summary/page.tsx  ← UPDATED
├── components/
│   └── dashboard/
│       └── account-search.tsx  ← NEW (replaces at-risk-search)
├── lib/
│   └── types/database.ts  ← UPDATED
└── Documentation:
    ├── ROLE_BASED_ACCESS_CONTROL.md  ← Complete guide
    ├── IMPLEMENTATION_SUMMARY_RBAC.md  ← Detailed summary
    └── RBAC_QUICK_START.md  ← This file
```

## 🎯 At-Risk Logic

An account is flagged as "At Risk" when **ALL THREE** conditions are met:

```
1. ✅ ARR > $400,000
        AND
2. ✅ Contract expiring within 90 days
        AND
3. ✅ At least ONE risk factor:
   • Health score < 600
   • DSM risk assessment = true
   • Path to green = false
   • Auto renew = false
   • Pricing outlier = true
```

## 🔍 Testing Checklist

### DSM User:
- [ ] Sees only "My Accounts" in navigation
- [ ] Sees only accounts where dsm_id = their user ID
- [ ] Redirected when trying to access /dashboard/executive-summary
- [ ] Redirected when trying to access /dashboard/accounts

### Exec Sponsor User:
- [ ] Sees "Executive Summary" and "Account Search" in navigation
- [ ] Can see all accounts in Account Search
- [ ] Can filter by DSM
- [ ] Can filter by Exec Sponsor
- [ ] Can apply risk filters (All, At Risk, Top 50, Expiring)
- [ ] Risk indicator columns display correctly
- [ ] Export to CSV works

### Admin User:
- [ ] Sees all navigation items
- [ ] All features work as expected

## 💡 Key Benefits

✅ **Enhanced Security** - Role-based filtering at API level
✅ **Better UX** - Users see only relevant data
✅ **Risk Visibility** - Clear risk indicators in table
✅ **Flexible Filtering** - Multiple filter combinations
✅ **Data Export** - CSV export with all risk data
✅ **Scalable** - Easy to add new roles or permissions

## 📞 Need Help?

- See `ROLE_BASED_ACCESS_CONTROL.md` for comprehensive documentation
- See `IMPLEMENTATION_SUMMARY_RBAC.md` for detailed implementation notes

---

**Ready to go!** 🚀 Apply the migration and start testing!
