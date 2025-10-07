"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Account } from '@/lib/types/database'

interface ARRTrendChartProps {
  accounts: Account[]
}

interface TrendDataPoint {
  month: string
  arr: number
}

export function ARRTrendChart({ accounts }: ARRTrendChartProps) {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch historical snapshot data
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch('/api/snapshots/capture?days=180')
        if (response.ok) {
          const data = await response.json()
          const snapshots = data.snapshots || []
          
          // Group by month and calculate ARR at risk
          const monthlyData = groupSnapshotsByMonth(snapshots)
          setTrendData(monthlyData)
        } else {
          // Fallback to current data if no snapshots exist
          setTrendData(generateFallbackData())
        }
      } catch (error) {
        console.error('Error fetching historical data:', error)
        setTrendData(generateFallbackData())
      } finally {
        setLoading(false)
      }
    }
    
    fetchHistoricalData()
  }, [accounts])

  const groupSnapshotsByMonth = (snapshots: Record<string, unknown>[]) => {
    const monthlyMap: Record<string, { total: number; count: number }> = {}
    
    snapshots.forEach(snapshot => {
      if (snapshot.status === 'yellow' || snapshot.status === 'red') {
        const date = new Date(snapshot.snapshot_date as string)
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`
        const monthName = date.toLocaleString('default', { month: 'short' })
        
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { total: 0, count: 0 }
        }
        monthlyMap[monthKey].total += (snapshot.arr_usd as number) || 0
        monthlyMap[monthKey].count++
      }
    })
    
    // Get last 6 months
    const result = []
    const today = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const monthData = monthlyMap[monthKey]
      const avgARR = monthData ? monthData.total / monthData.count : 0
      
      result.push({
        month: monthName,
        arr: Math.round(avgARR / 100) / 10 // Convert to millions with 1 decimal
      })
    }
    
    return result
  }

  const generateFallbackData = () => {
    // If no snapshots exist, show current ARR across all months
    const atRiskAccounts = accounts.filter(acc => 
      acc.status === 'yellow' || acc.status === 'red'
    )
    const totalARR = atRiskAccounts.reduce((sum, acc) => sum + (acc.arr_usd || 0), 0)
    const arrInMillions = Math.round(totalARR / 100) / 10
    
    const months = []
    const today = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      months.push({
        month: monthName,
        arr: arrInMillions
      })
    }
    
    return months
  }

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trendData} margin={{ top: 20, right: 30, left: 75, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis 
          label={{ value: 'ARR ($M)', angle: -90, position: 'insideLeft', dx: -25 }}
          tickFormatter={(value) => `$${value.toFixed(1)}M`}
        />
        <Tooltip 
          formatter={(value: number) => [`$${value.toFixed(2)}M`, 'ARR at Risk']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="arr" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          name="ARR at Risk"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
