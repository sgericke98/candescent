"use client"

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from '@/lib/utils'

interface WaterfallData {
  category: string
  value: number
  displayValue: number
  logoCount: number
  acv: number
}

interface RiskWaterfallChartProps {
  period: 'wow' | 'ytd'
}

export function RiskWaterfallChart({ period }: RiskWaterfallChartProps) {
  const [data, setData] = useState<WaterfallData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'acv' | 'logos'>('acv')

  useEffect(() => {
    const fetchWaterfallData = async () => {
      try {
        const response = await fetch(`/api/analytics/waterfall?period=${period}`)
        if (response.ok) {
          const result = await response.json()
          setData(result.data || [])
        } else {
          console.error('Failed to fetch waterfall data')
        }
      } catch (error) {
        console.error('Error fetching waterfall data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchWaterfallData()
  }, [period])

  const getBarColor = (category: string) => {
    switch (category) {
      case 'Starting At-Risk':
      case 'Ending At-Risk':
        return '#3b82f6' // blue
      case 'Term Notices':
      case 'Risk Escalations':
        return '#ef4444' // red
      case 'Renewals':
      case 'Risk De-escalations':
        return '#22c55e' // green
      default:
        return '#94a3b8' // gray
    }
  }

  const chartData = data.map(item => ({
    ...item,
    value: viewMode === 'acv' ? item.acv : item.logoCount
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: WaterfallData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-2">{data.category}</p>
          <p className="text-sm">
            <span className="font-medium">Logos:</span> {data.logoCount}
          </p>
          <p className="text-sm">
            <span className="font-medium">ACV:</span> {formatCurrency(data.acv)}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('acv')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'acv'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          ACV View
        </button>
        <button
          onClick={() => setViewMode('logos')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'logos'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Logo Count View
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 5, left: 5, bottom: 90 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="category" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 9 }}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            label={{ 
              value: viewMode === 'acv' ? 'ACV ($)' : 'Logos', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 10 }
            }}
            tickFormatter={(value) => 
              viewMode === 'acv' 
                ? `$${(value / 1000000).toFixed(1)}M` 
                : value.toString()
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.category)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats - Hidden on small screens for space */}
      <div className="hidden lg:grid grid-cols-3 gap-2 pt-3 border-t text-xs">
        {data.slice(0, 3).map((item, index) => (
          <div key={index} className="text-center">
            <p className="text-xs text-muted-foreground mb-1 truncate">{item.category}</p>
            <p className="text-sm font-semibold">{item.logoCount}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(item.acv)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RiskWaterfallChartsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Evolution - Waterfall Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track how risk in the portfolio changes over time
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wow" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wow">Week over Week</TabsTrigger>
            <TabsTrigger value="ytd">Year to Date</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wow" className="mt-6">
            <RiskWaterfallChart period="wow" />
          </TabsContent>
          
          <TabsContent value="ytd" className="mt-6">
            <RiskWaterfallChart period="ytd" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
