# Customer Health Score System

## Industry Standards

Based on research from Gainsight and other CS platforms:

### Status Thresholds
- 🟢 **Green (Healthy)**: ≥ 700/1000 - Will definitely renew, fully satisfied
- 🟡 **Yellow (At Risk)**: 500-699 - Likely renewal but with concerns
- 🔴 **Red (Critical)**: < 500 - High churn risk, immediate action needed

## Weighted Metric Framework

### Health Score Calculation (0-1000 scale)

Health Score = Σ (Metric Score × Weight)

#### 1. **Product Adoption & Usage** (40% weight = 400 points)
Measures how deeply the customer is using your solutions

**Metrics:**
- **Solutions Adopted**: Number of Candescent products in use
  - 1 solution: 100 points
  - 2-3 solutions: 250 points
  - 4+ solutions: 400 points

- **Platform Fee Growth**: YoY growth in platform fees
  - Negative growth: 0 points
  - 0-10% growth: 200 points
  - >10% growth: 400 points

**Implementation:**
```typescript
const adoptionScore = calculateAdoptionScore(account)
// Based on current_solutions text parsing or dedicated adoption tracking
```

#### 2. **Engagement & Activity** (30% weight = 300 points)

**Metrics:**
- **QBR Recency**: Days since last QBR
  - < 30 days: 100 points
  - 30-60 days: 75 points
  - 60-90 days: 50 points
  - > 90 days: 0 points

- **Win Room Participation**: Win rooms in last 6 months
  - 3+ win rooms: 100 points
  - 1-2 win rooms: 50 points
  - 0 win rooms: 0 points

- **Activity Completion Rate**: % of activities completed on time
  - > 80%: 100 points
  - 50-80%: 50 points
  - < 50%: 0 points

**Implementation:**
```typescript
const engagementScore = calculateEngagementScore(account, activities, winRooms)
```

#### 3. **Financial & Contract Health** (20% weight = 200 points)

**Metrics:**
- **ARR Growth**: Year-over-year ARR change
  - Positive growth: 100 points
  - Flat (±5%): 50 points
  - Declining: 0 points

- **Contract Renewal Proximity**: Days until subscription end
  - > 180 days: 100 points
  - 90-180 days: 75 points
  - 30-90 days: 50 points
  - < 30 days: 25 points

**Implementation:**
```typescript
const financialScore = calculateFinancialHealth(account)
```

#### 4. **Risk & Relationship Indicators** (10% weight = 100 points)

**Metrics:**
- **Active Risks**: Number and severity of risks
  - 0 risks: 100 points
  - 1-2 risks: 50 points
  - 3+ risks: 0 points
  - Multiply by 0.5 if any "Relationship" risk exists

- **Stakeholder Sentiment**: Average stakeholder status
  - All green: 100 points
  - Mixed (some yellow): 50 points
  - Any red: 0 points

- **Path to Green**: Clear recovery plan exists
  - Yes: Bonus +50 points
  - No: 0 points

**Implementation:**
```typescript
const riskScore = calculateRiskScore(account, risks, stakeholders)
```

## Automatic Calculation Algorithm

```typescript
function calculateHealthScore(account, activities, risks, stakeholders, winRooms) {
  let score = 0
  
  // 1. Product Adoption (400 points max)
  const solutionsCount = (account.current_solutions?.split(',').length || 0)
  score += Math.min(solutionsCount * 100, 400)
  
  // 2. Engagement (300 points max)
  // QBR Recency
  const daysSinceQBR = account.last_qbr_date ? 
    Math.floor((Date.now() - new Date(account.last_qbr_date).getTime()) / (1000 * 60 * 60 * 24)) : 
    999
  score += daysSinceQBR < 30 ? 100 : daysSinceQBR < 60 ? 75 : daysSinceQBR < 90 ? 50 : 0
  
  // Win Room Participation (last 6 months)
  const recentWinRooms = winRooms.filter(wr => 
    (Date.now() - new Date(wr.date).getTime()) < (180 * 24 * 60 * 60 * 1000)
  ).length
  score += recentWinRooms >= 3 ? 100 : recentWinRooms >= 1 ? 50 : 0
  
  // Activity Completion Rate
  const completedActivities = activities.filter(a => a.status === 'Completed').length
  const completionRate = activities.length > 0 ? completedActivities / activities.length : 0
  score += completionRate > 0.8 ? 100 : completionRate > 0.5 ? 50 : 0
  
  // 3. Financial Health (200 points max)
  const daysToRenewal = account.subscription_end ?
    Math.floor((new Date(account.subscription_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) :
    999
  score += daysToRenewal > 180 ? 100 : daysToRenewal > 90 ? 75 : daysToRenewal > 30 ? 50 : 25
  
  // ARR stability (100 points if ARR > $1M)
  score += account.arr_usd >= 1000 ? 100 : account.arr_usd >= 500 ? 50 : 0
  
  // 4. Risk Indicators (100 points max)
  const riskPenalty = Math.min(risks.length * 25, 100)
  const hasRelationshipRisk = risks.some(r => r.risk_type === 'Relationship')
  score += 100 - (hasRelationshipRisk ? riskPenalty * 1.5 : riskPenalty)
  
  // Stakeholder sentiment
  const greenStakeholders = stakeholders.filter(s => s.status === 'green').length
  const stakeholderScore = stakeholders.length > 0 ? 
    (greenStakeholders / stakeholders.length) * 50 : 
    0
  score += stakeholderScore
  
  // Path to green bonus
  if (account.path_to_green) {
    score += 50
  }
  
  // Cap at 1000
  return Math.min(Math.max(Math.round(score), 0), 1000)
}
```

## Database Schema Enhancements

Add these fields to track health score history:

```sql
-- Add health score tracking
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS health_score_last_calculated TIMESTAMPTZ;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS health_score_manual_override BOOLEAN DEFAULT false;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS health_score_manual_reason TEXT;

-- Create health score history table
CREATE TABLE IF NOT EXISTS health_score_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL,
  calculated_score INTEGER NOT NULL,
  manual_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  metrics_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_score_history_account_id 
  ON health_score_history(account_id);
CREATE INDEX IF NOT EXISTS idx_health_score_history_created_at 
  ON health_score_history(created_at DESC);
```

## Manual Override Capability

Allow DSMs/Admins to:
1. **View calculated score** with metric breakdown
2. **Manually adjust** if they have business context the algorithm doesn't capture
3. **Provide reason** for manual override (required for audit trail)
4. **See history** of score changes over time

## UI Components Needed

1. **Health Score Manager Modal**
   - Current score display
   - Metric breakdown (visual)
   - Manual override toggle
   - Reason text field
   - Recalculate button

2. **Health Score Trend Chart**
   - Shows score over time
   - Indicates manual vs automatic changes
   - Highlights significant drops

3. **Health Score Badge**
   - Color-coded (green/yellow/red)
   - Tooltip showing last calculation date
   - Click to open manager modal

## Implementation Files

I'll create:
1. `/lib/health-score-calculator.ts` - Core calculation logic
2. `/app/api/accounts/[id]/health-score/route.ts` - API for calculation & update
3. `/components/health-score-manager.tsx` - UI component
4. Database migration for new fields

Should I proceed with implementing this comprehensive system?
