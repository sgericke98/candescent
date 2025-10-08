"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Account } from '@/lib/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Calendar, TrendingUp, Users, BarChart3 } from 'lucide-react'

interface WinRoomMetrics {
  throughWinRoom: {
    logoCount: number
    totalARR: number
    accounts: Account[]
  }
  notThroughWinRoom: {
    logoCount: number
    totalARR: number
    accounts: Account[]
  }
  upcomingWinRooms: {
    logoCount: number
    totalARR: number
    accounts: Account[]
  }
  winRoomCycles: {
    accountId: string
    accountName: string
    cycleCount: number
    lastWinRoomDate: string
    arr: number
  }[]
}

interface WinRoomEffectivenessProps {
  accounts: Account[]
}

export function WinRoomEffectiveness({ accounts }: WinRoomEffectivenessProps) {
  const [metrics, setMetrics] = useState<WinRoomMetrics>({
    throughWinRoom: { logoCount: 0, totalARR: 0, accounts: [] },
    notThroughWinRoom: { logoCount: 0, totalARR: 0, accounts: [] },
    upcomingWinRooms: { logoCount: 0, totalARR: 0, accounts: [] },
    winRoomCycles: []
  })
  const [loading, setLoading] = useState(true)

  const calculateMetrics = useCallback(async () => {
    try {
      const atRiskAccounts = accounts.filter(acc => 
        acc.status === 'yellow' || acc.status === 'red'
      )

      const today = new Date()
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Fetch win room history for all accounts
      const response = await fetch('/api/win-rooms')
      let winRoomsData: Array<{ account_id: string; date: string }> = []
      
      if (response.ok) {
        const data = await response.json()
        winRoomsData = data.winRooms || []
      }

      // Calculate accounts through win room (had a win room in last 30 days)
      const accountsWithRecentWinRoom = atRiskAccounts.filter(acc => 
        acc.last_qbr_date && new Date(acc.last_qbr_date) >= thirtyDaysAgo
      )

      const accountsWithoutWinRoom = atRiskAccounts.filter(acc => 
        !acc.last_qbr_date || new Date(acc.last_qbr_date) < thirtyDaysAgo
      )

      // Calculate upcoming win rooms
      const accountsWithUpcoming = atRiskAccounts.filter(acc =>
        acc.next_win_room && new Date(acc.next_win_room) > today
      )

      // Calculate cycle counts (how many times each account has been through win room)
      const cycleCounts = atRiskAccounts
        .map(acc => {
          const accountWinRooms = winRoomsData.filter(wr => wr.account_id === acc.id)
          const cycleCount = accountWinRooms.length
          const lastWinRoom = accountWinRooms
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

          return {
            accountId: acc.id,
            accountName: acc.name,
            cycleCount,
            lastWinRoomDate: lastWinRoom?.date || 'Never',
            arr: acc.arr_usd * 1000
          }
        })
        .filter(item => item.cycleCount > 0)
        .sort((a, b) => b.cycleCount - a.cycleCount)

      setMetrics({
        throughWinRoom: {
          logoCount: accountsWithRecentWinRoom.length,
          totalARR: accountsWithRecentWinRoom.reduce((sum, acc) => sum + acc.arr_usd * 1000, 0),
          accounts: accountsWithRecentWinRoom
        },
        notThroughWinRoom: {
          logoCount: accountsWithoutWinRoom.length,
          totalARR: accountsWithoutWinRoom.reduce((sum, acc) => sum + acc.arr_usd * 1000, 0),
          accounts: accountsWithoutWinRoom
        },
        upcomingWinRooms: {
          logoCount: accountsWithUpcoming.length,
          totalARR: accountsWithUpcoming.reduce((sum, acc) => sum + acc.arr_usd * 1000, 0),
          accounts: accountsWithUpcoming.slice(0, 5)
        },
        winRoomCycles: cycleCounts
      })
    } catch (error) {
      console.error('Error calculating win room metrics:', error)
    } finally {
      setLoading(false)
    }
  }, [accounts])

  useEffect(() => {
    calculateMetrics()
  }, [calculateMetrics])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const coveragePercentage = 
    metrics.throughWinRoom.logoCount + metrics.notThroughWinRoom.logoCount > 0
      ? (metrics.throughWinRoom.logoCount / (metrics.throughWinRoom.logoCount + metrics.notThroughWinRoom.logoCount)) * 100
      : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Win Room Effectiveness</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track at-risk accounts through win room intervention process
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-1 text-green-700">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Through Win Room</span>
            </div>
            <div className="text-xl font-bold text-green-900">
              {metrics.throughWinRoom.logoCount}
            </div>
            <div className="text-sm text-green-600">
              {formatCurrency(metrics.throughWinRoom.totalARR)} ARR
            </div>
            <div className="text-xs text-green-600 mt-1">
              Last 30 days
            </div>
          </div>

          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 mb-1 text-red-700">
              <Users className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">Not Through Win Room</span>
            </div>
            <div className="text-xl font-bold text-red-900">
              {metrics.notThroughWinRoom.logoCount}
            </div>
            <div className="text-sm text-red-600">
              {formatCurrency(metrics.notThroughWinRoom.totalARR)} ARR
            </div>
            <div className="text-xs text-red-600 mt-1">
              Needs scheduling
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-1 text-blue-700">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">On Deck</span>
            </div>
            <div className="text-xl font-bold text-blue-900">
              {metrics.upcomingWinRooms.logoCount}
            </div>
            <div className="text-sm text-blue-600">
              {formatCurrency(metrics.upcomingWinRooms.totalARR)} ARR
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Upcoming sessions
            </div>
          </div>
        </div>

        {/* Coverage Percentage */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Win Room Coverage</span>
            <span className="text-2xl font-bold">{coveragePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${coveragePercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Percentage of at-risk accounts that have been through win room in the last 30 days
          </p>
        </div>

        {/* Upcoming Win Rooms */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Accounts On Deck
          </h3>
          <div className="space-y-2">
            {metrics.upcomingWinRooms.accounts.length > 0 ? (
              metrics.upcomingWinRooms.accounts.slice(0, 3).map((account, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{account.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {account.dsm?.full_name || 'Unassigned'}
                    </p>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="font-semibold text-xs">{formatCurrency(account.arr_usd * 1000)}</p>
                    <p className="text-xs text-muted-foreground">
                      {account.next_win_room ? formatDate(account.next_win_room) : 'TBD'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground text-xs">
                No upcoming win rooms scheduled
              </p>
            )}
          </div>
        </div>

        {/* Win Room Cycle Analysis */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Repeat Accounts
          </h3>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Account</th>
                  <th className="text-center p-2">Times</th>
                  <th className="text-right p-2">Last</th>
                  <th className="text-right p-2">ARR</th>
                </tr>
              </thead>
              <tbody>
                {metrics.winRoomCycles.length > 0 ? (
                  metrics.winRoomCycles.slice(0, 5).map((item, index) => (
                    <tr key={index} className="border-t hover:bg-muted/50">
                      <td className="p-2 font-medium truncate max-w-[120px]">{item.accountName}</td>
                      <td className="p-2 text-center">
                        <Badge variant={item.cycleCount > 2 ? "destructive" : "default"} className="text-xs">
                          {item.cycleCount}x
                        </Badge>
                      </td>
                      <td className="p-2 text-right text-muted-foreground whitespace-nowrap">
                        {item.lastWinRoomDate !== 'Never' ? formatDate(item.lastWinRoomDate) : 'Never'}
                      </td>
                      <td className="p-2 text-right font-medium whitespace-nowrap">
                        {formatCurrency(item.arr)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground text-xs">
                      No win room history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {metrics.winRoomCycles.length > 5 && (
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Showing top 5 accounts
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
