"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Account } from '@/lib/types/database'

interface AccountsByExpiryChartProps {
  accounts: Account[]
}

export function AccountsByExpiryChart({ accounts }: AccountsByExpiryChartProps) {
  // Group accounts by subscription end date (monthly buckets)
  const generateExpiryData = () => {
    const expiryBuckets: Record<string, number> = {}
    const today = new Date()
    
    accounts.forEach(account => {
      if (account.subscription_end) {
        const expiryDate = new Date(account.subscription_end)
        
        // Only include future expiry dates
        if (expiryDate > today) {
          const monthYear = expiryDate.toLocaleString('default', { 
            month: 'short', 
            year: '2-digit' 
          })
          
          expiryBuckets[monthYear] = (expiryBuckets[monthYear] || 0) + 1
        }
      }
    })
    
    // Convert to array and sort by date
    return Object.entries(expiryBuckets)
      .map(([period, count]) => ({
        period,
        count,
        sortDate: new Date(period)
      }))
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .slice(0, 12) // Show next 12 months
      .map(({ period, count }) => ({ period, count }))
  }
  
  const expiryData = generateExpiryData()
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={expiryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="period" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis label={{ value: 'Count of accounts', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Bar dataKey="count" fill="#3b82f6" name="Count of accounts" />
      </BarChart>
    </ResponsiveContainer>
  )
}
