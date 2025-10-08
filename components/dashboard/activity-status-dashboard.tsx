"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from '@/lib/types/database'
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ActivityStatusData {
  status: string
  count: number
  percentage: number
  color: string
  icon: React.ReactNode
}

interface ActivityStatusDashboardProps {
  activities: Activity[]
}

export function ActivityStatusDashboard({ activities }: ActivityStatusDashboardProps) {
  const [statusData, setStatusData] = useState<ActivityStatusData[]>([])

  const calculateStatusData = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const statusMap: Record<string, number> = {
      'Completed': 0,
      'On Track': 0,
      'Past Due': 0,
      'Roadblocked': 0
    }

    activities.forEach(activity => {
      if (activity.status === 'Completed') {
        statusMap['Completed']++
      } else {
        const dueDate = activity.due_date ? new Date(activity.due_date) : null
        
        if (dueDate && dueDate < today) {
          statusMap['Past Due']++
        } else if (activity.status === 'Not Started') {
          statusMap['Roadblocked']++
        } else {
          statusMap['On Track']++
        }
      }
    })

    const total = activities.length || 1

    const data: ActivityStatusData[] = [
      {
        status: 'Completed',
        count: statusMap['Completed'],
        percentage: (statusMap['Completed'] / total) * 100,
        color: '#22c55e',
        icon: <CheckCircle2 className="h-5 w-5" />
      },
      {
        status: 'On Track',
        count: statusMap['On Track'],
        percentage: (statusMap['On Track'] / total) * 100,
        color: '#3b82f6',
        icon: <Clock className="h-5 w-5" />
      },
      {
        status: 'Past Due',
        count: statusMap['Past Due'],
        percentage: (statusMap['Past Due'] / total) * 100,
        color: '#f59e0b',
        icon: <AlertCircle className="h-5 w-5" />
      },
      {
        status: 'Roadblocked',
        count: statusMap['Roadblocked'],
        percentage: (statusMap['Roadblocked'] / total) * 100,
        color: '#ef4444',
        icon: <XCircle className="h-5 w-5" />
      }
    ]

    setStatusData(data)
  }, [activities])

  useEffect(() => {
    calculateStatusData()
  }, [calculateStatusData])

  const chartData = statusData.map(item => ({
    name: item.status,
    value: item.count
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const statusInfo = statusData.find(s => s.status === data.name)
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-1">{data.name}</p>
          <p className="text-sm">Count: {data.value}</p>
          <p className="text-sm">Percentage: {statusInfo?.percentage.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Status Dashboard</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track adherence and status of risk intervention activities
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statusData.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border-2 transition-all hover:shadow-md"
              style={{ borderColor: item.color }}
            >
              <div className="flex items-center gap-2 mb-1" style={{ color: item.color }}>
                {item.icon}
                <span className="text-xs font-semibold uppercase">{item.status}</span>
              </div>
              <div className="text-xl font-bold">{item.count}</div>
              <div className="text-xs text-muted-foreground">
                {item.percentage.toFixed(1)}% of total
              </div>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={(entry) => `${entry.value}`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusData[index].color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Key Insights */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Key Insights</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-900">Completion Rate</p>
                <p className="text-2xl font-bold text-green-700">
                  {statusData[0]?.percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {statusData[0]?.count} activities completed
                </p>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-900">Attention Required</p>
                <p className="text-2xl font-bold text-red-700">
                  {(statusData[2]?.count || 0) + (statusData[3]?.count || 0)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Past due or roadblocked activities
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900">Healthy Progress</p>
                <p className="text-2xl font-bold text-blue-700">
                  {statusData[1]?.percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Activities on track
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Total Activities</p>
              <p className="text-xl font-bold">{activities.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">In Progress</p>
              <p className="text-xl font-bold">
                {activities.filter(a => a.status !== 'Completed').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Needs Action</p>
              <p className="text-xl font-bold text-red-600">
                {(statusData[2]?.count || 0) + (statusData[3]?.count || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-1">Completion %</p>
              <p className="text-xl font-bold text-green-600">
                {statusData[0]?.percentage.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
