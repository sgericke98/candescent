"use client"

import { useState, useEffect } from 'react'
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AccountDetailModal } from "@/components/account-detail-modal"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Account, AccountWithDetails, Activity as ActivityType } from "@/lib/types/database"
import { TrendingUp, TrendingDown, Users, Calendar, Activity } from "lucide-react"
import { toast } from "sonner"
import { AccountsByExecSponsorChart } from "@/components/charts/accounts-by-exec-sponsor-chart"
import { ARRTrendChart } from "@/components/charts/arr-trend-chart"
import { AccountsByExpiryChart } from "@/components/charts/accounts-by-expiry-chart"
import { RiskWaterfallChartsCard } from "@/components/charts/risk-waterfall-chart"
import { RiskCompositionCharts } from "@/components/charts/risk-composition-chart"
import { ActivityStatusDashboard } from "@/components/dashboard/activity-status-dashboard"
import { WinRoomEffectiveness } from "@/components/dashboard/win-room-effectiveness"

interface KPIs {
  total_arr_at_risk: number
  total_arr_top50: number
  accounts_at_risk: number
  accounts_top50_at_risk: number
  wow_change_count: number
  wow_change_pct: number
  accounts_through_win_room: number
  outstanding_followups: number
}

interface CriticalAccountData {
  id: string
  account: string
  dsm: string
  arr: number
  health: number
  winRoomDate: string
  activitiesCount: number
}

export function ExecutiveSummary() {
  const [selectedAccount, setSelectedAccount] = useState<AccountWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingAccount, setLoadingAccount] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [criticalAccountsData, setCriticalAccountsData] = useState<CriticalAccountData[]>([])
  const [kpis, setKpis] = useState<KPIs>({
    total_arr_at_risk: 0,
    total_arr_top50: 0,
    accounts_at_risk: 0,
    accounts_top50_at_risk: 0,
    wow_change_count: 0,
    wow_change_pct: 0,
    accounts_through_win_room: 0,
    outstanding_followups: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch KPIs and accounts from API
    const fetchData = async () => {
      try {
        // Fetch all data in parallel for better performance
        const [kpisResponse, accountsResponse, activitiesResponse] = await Promise.all([
          fetch('/api/kpis'),
          fetch('/api/accounts'),
          fetch('/api/activities')
        ])
        
        // Process KPIs
        if (kpisResponse.ok) {
          const kpisData = await kpisResponse.json()
          setKpis(kpisData.kpis)
        }
        
        // Process accounts
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json()
          setAccounts(accountsData.accounts || [])
          
          // Fetch critical accounts with activities (this will be optimized)
          await fetchCriticalAccounts(accountsData.accounts || [])
        } else {
          console.error('Failed to fetch accounts:', accountsResponse.status)
        }

        // Process activities
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivities(activitiesData.activities || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const fetchCriticalAccounts = async (allAccounts: Account[]) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      // Get at-risk accounts
      const atRiskAccounts = allAccounts.filter(acc => 
        acc.status === 'yellow' || acc.status === 'red'
      )
      
      // If no at-risk accounts, set empty array and return
      if (atRiskAccounts.length === 0) {
        setCriticalAccountsData([])
        return
      }
      
      // Fetch activities for all at-risk accounts in a single query
      const accountIds = atRiskAccounts.map(acc => acc.id)
      const activitiesResponse = await fetch(`/api/activities?account_ids=${accountIds.join(',')}`)
      
      let allActivities: ActivityType[] = []
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        allActivities = activitiesData.activities || []
      }
      
      // Group activities by account ID
      const activitiesByAccount = allActivities.reduce((acc, activity) => {
        if (!acc[activity.account_id]) {
          acc[activity.account_id] = []
        }
        acc[activity.account_id].push(activity)
        return acc
      }, {} as Record<string, ActivityType[]>)
      
      // Filter accounts with problematic activities and map to display format
      const critical: CriticalAccountData[] = atRiskAccounts
        .map(acc => {
          const accountActivities = activitiesByAccount[acc.id] || []
          
          // Find activities that are Not Started, past due, or due within 7 days
          const problematicActivities = accountActivities.filter((activity: ActivityType) => {
            if (activity.status === 'Completed') return false
            
            const dueDate = activity.due_date ? new Date(activity.due_date) : null
            const isPastDue = dueDate && dueDate < today
            const isDueSoon = dueDate && dueDate >= today && dueDate <= sevenDaysFromNow
            const isNotStarted = activity.status === 'Not Started'
            
            return isPastDue || isDueSoon || isNotStarted
          })
          
          if (problematicActivities.length === 0) return null
          
          return {
            id: acc.id,
            account: acc.name,
            dsm: acc.dsm?.full_name || 'Unassigned',
            arr: acc.arr_usd * 1000,
            health: acc.health_score,
            winRoomDate: acc.next_win_room || 'Not scheduled',
            activitiesCount: problematicActivities.length,
          }
        })
        .filter((acc): acc is CriticalAccountData => acc !== null)
        .sort((a, b) => b.arr - a.arr)
      
      setCriticalAccountsData(critical)
    } catch (error) {
      console.error('Error fetching critical accounts:', error)
    }
  }

  // Get accounts with upcoming win rooms (sorted by date)
  const nextWinRooms = accounts
    .filter(acc => acc.next_win_room && new Date(acc.next_win_room) > new Date())
    .sort((a, b) => new Date(a.next_win_room!).getTime() - new Date(b.next_win_room!).getTime())
    .slice(0, 3)
    .map(acc => ({
      id: acc.id,
      account: acc.name,
      dsm: acc.dsm?.full_name || 'Unassigned',
      arr: acc.arr_usd * 1000,
      health: acc.health_score,
      date: acc.next_win_room!
    }))

  // Get accounts with recent win rooms (sorted by most recent)
  const previousWinRooms = accounts
    .filter(acc => acc.last_qbr_date && new Date(acc.last_qbr_date) < new Date())
    .sort((a, b) => new Date(b.last_qbr_date!).getTime() - new Date(a.last_qbr_date!).getTime())
    .slice(0, 2)
    .map(acc => ({
      id: acc.id,
      account: acc.name,
      dsm: acc.dsm?.full_name || 'Unassigned',
      arr: acc.arr_usd * 1000,
      health: acc.health_score,
      date: acc.last_qbr_date!
    }))


  const handleAccountClick = async (accountId: string) => {
    setLoadingAccount(true)
    setIsModalOpen(true)
    
    try {
      const response = await fetch(`/api/accounts/${accountId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedAccount(data.account)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch account details:', response.status, errorText)
        toast.error('Failed to load account details')
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error('Error fetching account:', error)
      toast.error('Error loading account details')
      setIsModalOpen(false)
    } finally {
      setLoadingAccount(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAccount(null)
  }
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total ARR at Risk"
          value={kpis.total_arr_at_risk}
          formatAs="currency"
          invertColors={true}
          delta={{
            value: kpis.wow_change_pct,
            label: `${kpis.wow_change_pct}% WoW`
          }}
        />
        <StatCard
          title="Accounts at Risk"
          value={kpis.accounts_at_risk}
          formatAs="number"
          invertColors={true}
          delta={{
            value: kpis.wow_change_count,
            label: `${kpis.wow_change_count > 0 ? '+' : ''}${kpis.wow_change_count} this week`
          }}
        />
        <StatCard
          title="WoW Change"
          value={`${kpis.wow_change_pct}%`}
          formatAs="none"
          invertColors={true}
          delta={{
            value: kpis.wow_change_pct,
            label: "At-risk accounts"
          }}
        />
        <StatCard
          title="Accounts Through Win Room"
          value={kpis.accounts_through_win_room}
          formatAs="number"
          delta={{
            value: kpis.accounts_through_win_room,
            label: "Last 30 days"
          }}
        />
        <StatCard
          title="Outstanding Follow-Ups"
          value={kpis.outstanding_followups}
          formatAs="number"
          delta={{
            value: 0,
            label: "Open activities"
          }}
        />
      </div>

      {/* Win Room Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Next Win Room Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Win Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nextWinRooms.length > 0 ? nextWinRooms.map((room, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleAccountClick(room.id)}
                >
                  <div className="space-y-1">
                    <p className="font-medium">{room.account}</p>
                    <p className="text-sm text-muted-foreground">{room.dsm}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">{formatCurrency(room.arr)}</p>
                    <Badge variant={room.health >= 500 ? "default" : "destructive"}>
                      {room.health}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(room.date)}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  No upcoming win rooms scheduled
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Previous Win Room Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Previous Win Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previousWinRooms.length > 0 ? previousWinRooms.map((room, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleAccountClick(room.id)}
                >
                  <div className="space-y-1">
                    <p className="font-medium">{room.account}</p>
                    <p className="text-sm text-muted-foreground">{room.dsm}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">{formatCurrency(room.arr)}</p>
                    <Badge variant={room.health >= 500 ? "default" : "destructive"}>
                      {room.health}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(room.date)}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  No previous win rooms
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Accounts at Risk by Exec Sponsor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accounts at Risk by Exec Sponsor</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountsByExecSponsorChart accounts={accounts} />
          </CardContent>
        </Card>

        {/* Total ARR at Risk Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total ARR at Risk Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ARRTrendChart accounts={accounts} />
          </CardContent>
        </Card>

        {/* Accounts by Contract Expiry Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accounts by Contract Expiry Date</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountsByExpiryChart accounts={accounts} />
          </CardContent>
        </Card>
      </div>

      {/* New Analytics Section - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Waterfall Charts - Risk Evolution */}
        <RiskWaterfallChartsCard />

        {/* Risk Composition Analysis */}
        <RiskCompositionCharts accounts={accounts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Status Dashboard */}
        <ActivityStatusDashboard activities={activities} />

        {/* Win Room Effectiveness */}
        <WinRoomEffectiveness accounts={accounts} />
      </div>

      {/* Critical Accounts - Action Required - MOVED TO BOTTOM */}
      <Card className="border-red-300 bg-red-50/50">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-red-700">At-Risk Accounts - Action Required</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Activities that are past due, due soon (within 7 days), or not yet started</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {criticalAccountsData.length > 0 ? criticalAccountsData.map((account, index) => (
            <div key={index} className={`space-y-4 ${index > 0 ? 'pt-8 mt-8 border-t-2 border-red-200' : ''}`}>
              <div 
                className="flex items-start justify-between p-5 bg-white rounded-lg border-2 border-red-200 shadow-sm cursor-pointer hover:bg-red-50 hover:border-red-300 transition-all"
                onClick={() => handleAccountClick(account.id)}
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-gray-900">{account.account}</h3>
                  <p className="text-sm text-gray-600">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {account.dsm}
                  </p>
                </div>
                <div className="flex items-start gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-semibold">ARR</p>
                    <p className="font-bold text-green-600">{formatCurrency(account.arr)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Health</p>
                    <p className="font-bold text-red-600">{account.health}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Win Room</p>
                    <p className="font-semibold text-gray-700">{formatDate(account.winRoomDate)}</p>
                  </div>
                </div>
              </div>
              
            </div>
          )) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-muted-foreground font-medium">No critical accounts at this time</p>
              <p className="text-sm text-muted-foreground mt-2">All accounts are on track with their activities</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AccountDetailModal
        account={selectedAccount}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        canEdit={true}
      />
    </div>
  )
}
