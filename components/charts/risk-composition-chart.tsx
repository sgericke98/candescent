"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from '@/lib/utils'
import { Account } from '@/lib/types/database'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CompositionData {
  category: string
  logoCount: number
  arr: number
  percentage: number
}

interface RiskCompositionProps {
  accounts: Account[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1']

export function RiskCompositionCharts({ accounts }: RiskCompositionProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'size' | 'type' | 'team' | 'sponsor'>('size')

  const atRiskAccounts = accounts.filter(acc => 
    acc.status === 'yellow' || acc.status === 'red'
  )

  const getCompositionData = (): CompositionData[] => {
    const groupMap: Record<string, { logoCount: number; arr: number }> = {}

    atRiskAccounts.forEach(account => {
      let category = 'Unknown'

      switch (viewMode) {
        case 'size':
          const arr = account.arr_usd * 1000
          if (arr < 50000) category = '<$50K'
          else if (arr < 100000) category = '$50K-$100K'
          else if (arr < 250000) category = '$100K-$250K'
          else if (arr < 500000) category = '$250K-$500K'
          else if (arr < 1000000) category = '$500K-$1M'
          else category = '>$1M'
          break

        case 'type':
          category = account.type || 'Unknown'
          break

        case 'team':
          category = account.dsm?.full_name || 'Unassigned'
          break

        case 'sponsor':
          category = account.exec_sponsor?.name || 'Unassigned'
          break
      }

      if (!groupMap[category]) {
        groupMap[category] = { logoCount: 0, arr: 0 }
      }
      groupMap[category].logoCount++
      groupMap[category].arr += account.arr_usd * 1000
    })

    const totalARR = Object.values(groupMap).reduce((sum, val) => sum + val.arr, 0)

    return Object.entries(groupMap)
      .map(([category, data]) => ({
        category,
        logoCount: data.logoCount,
        arr: data.arr,
        percentage: totalARR > 0 ? (data.arr / totalARR) * 100 : 0
      }))
      .sort((a, b) => b.arr - a.arr)
  }

  const compositionData = getCompositionData()

  const handleBarClick = (data: unknown) => {
    if (data && typeof data === 'object' && 'category' in data && typeof (data as { category: string }).category === 'string') {
      const category = (data as { category: string }).category
      // Navigate based on view mode
      if (viewMode === 'team') {
        router.push('/dashboard/executive-summary?tab=dsm-view&dsm=' + encodeURIComponent(category))
      } else if (viewMode === 'sponsor') {
        router.push('/dashboard/executive-summary?tab=at-risk&sponsor=' + encodeURIComponent(category))
      } else {
        // For size and type, just go to at-risk search
        router.push('/dashboard/executive-summary?tab=at-risk')
      }
    }
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: CompositionData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-2">{data.category}</p>
          <p className="text-sm">
            <span className="font-medium">Logos:</span> {data.logoCount}
          </p>
          <p className="text-sm">
            <span className="font-medium">ARR:</span> {formatCurrency(data.arr)}
          </p>
          <p className="text-sm">
            <span className="font-medium">% of At-Risk ARR:</span> {data.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>At-Risk Portfolio Composition</CardTitle>
        <p className="text-sm text-muted-foreground">
          Firmographics breakdown of accounts at risk
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View Mode Selector */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'size', label: 'By Size' },
            { value: 'type', label: 'By Type' },
            { value: 'team', label: 'By DSM' },
            { value: 'sponsor', label: 'By Exec Sponsor' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setViewMode(option.value as typeof viewMode)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Bar Chart */}
        <div>
          <h3 className="text-sm font-semibold mb-4">ARR Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart 
              data={compositionData} 
              margin={{ top: 5, right: 10, left: 10, bottom: 70 }}
              onClick={handleBarClick}
              style={{ cursor: viewMode === 'team' || viewMode === 'sponsor' ? 'pointer' : 'default' }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 9 }}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                label={{ value: 'ARR at Risk', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
              <Bar dataKey="arr" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {compositionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Table */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Detailed Breakdown</h3>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 text-xs">Category</th>
                  <th className="text-right p-2 text-xs">Logos</th>
                  <th className="text-right p-2 text-xs">ARR</th>
                  <th className="text-right p-2 text-xs">%</th>
                </tr>
              </thead>
              <tbody>
                {compositionData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50">
                    <td className="p-2 font-medium">{item.category}</td>
                    <td className="p-2 text-right">{item.logoCount}</td>
                    <td className="p-2 text-right whitespace-nowrap">{formatCurrency(item.arr)}</td>
                    <td className="p-2 text-right">
                      <Badge variant="outline" className="text-xs">{item.percentage.toFixed(1)}%</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted font-semibold border-t-2">
                <tr>
                  <td className="p-2">Total</td>
                  <td className="p-2 text-right">
                    {compositionData.reduce((sum, item) => sum + item.logoCount, 0)}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {formatCurrency(compositionData.reduce((sum, item) => sum + item.arr, 0))}
                  </td>
                  <td className="p-2 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
