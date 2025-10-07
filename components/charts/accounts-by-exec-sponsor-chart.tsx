"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Account } from '@/lib/types/database'

interface AccountsByExecSponsorChartProps {
  accounts: Account[]
}

export function AccountsByExecSponsorChart({ accounts }: AccountsByExecSponsorChartProps) {
  // Group accounts by exec sponsor
  const sponsorData = accounts.reduce((acc, account) => {
    const sponsorName = account.exec_sponsor?.name || 'Unassigned'
    
    if (!acc[sponsorName]) {
      acc[sponsorName] = {
        name: sponsorName,
        atRisk: 0,
        healthy: 0
      }
    }
    
    if (account.status === 'green') {
      acc[sponsorName].healthy++
    } else {
      acc[sponsorName].atRisk++
    }
    
    return acc
  }, {} as Record<string, { name: string; atRisk: number; healthy: number }>)
  
  const chartData = Object.values(sponsorData).sort((a, b) => 
    (b.atRisk + b.healthy) - (a.atRisk + a.healthy)
  )
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="atRisk" fill="#f97316" name="At Risk" />
        <Bar dataKey="healthy" fill="#22c55e" name="Healthy" />
      </BarChart>
    </ResponsiveContainer>
  )
}
