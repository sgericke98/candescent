"use client"

import { useState, useEffect } from 'react'
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AccountDetailModal } from "@/components/account-detail-modal"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Account, AccountWithDetails } from "@/lib/types/database"
import { TrendingUp, TrendingDown, Users, Calendar, Activity } from "lucide-react"
import { toast } from "sonner"
import { AccountsByExecSponsorChart } from "@/components/charts/accounts-by-exec-sponsor-chart"
import { ARRTrendChart } from "@/components/charts/arr-trend-chart"
import { AccountsByExpiryChart } from "@/components/charts/accounts-by-expiry-chart"

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

export function ExecutiveSummary() {
  const [selectedAccount, setSelectedAccount] = useState<AccountWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingAccount, setLoadingAccount] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
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
        // Fetch KPIs
        const kpisResponse = await fetch('/api/kpis')
        if (kpisResponse.ok) {
          const kpisData = await kpisResponse.json()
          setKpis(kpisData.kpis)
        }
        
        // Fetch accounts
        const accountsResponse = await fetch('/api/accounts')
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json()
          setAccounts(accountsData.accounts || [])
        } else {
          console.error('Failed to fetch accounts:', accountsResponse.status)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

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

  // Get critical accounts (red status with low health scores)
  const criticalAccounts = accounts
    .filter(acc => acc.status === 'red' && acc.health_score < 500)
    .sort((a, b) => a.health_score - b.health_score)
    .slice(0, 3)
    .map(acc => ({
      id: acc.id,
      account: acc.name,
      dsm: acc.dsm?.full_name || 'Unassigned',
      arr: acc.arr_usd * 1000,
      health: acc.health_score,
      winRoomDate: acc.next_win_room || 'Not scheduled',
      activities: []
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
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Critical Accounts - Action Required */}
      <Card className="border-danger/20 bg-danger-50/50">
        <CardHeader>
          <CardTitle className="text-danger">Critical Accounts – Action Required</CardTitle>
        </CardHeader>
        <CardContent>
          {criticalAccounts.length > 0 ? criticalAccounts.map((account, index) => (
            <div key={index} className="space-y-4">
              <div 
                className="flex items-center justify-between p-4 bg-surface rounded-lg border border-danger/20 cursor-pointer hover:bg-danger/5 transition-colors"
                onClick={() => handleAccountClick(account.id)}
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{account.account}</h3>
                  <p className="text-sm text-muted-fg">DSM: {account.dsm}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-medium">{formatCurrency(account.arr)}</p>
                  <Badge variant="destructive">{account.health}</Badge>
                  <p className="text-sm text-muted-fg">
                    Win Room: {formatDate(account.winRoomDate)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-danger">Activities Not Started</h4>
                <div className="space-y-2">
                  {account.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="flex items-center justify-between p-3 bg-surface rounded border border-danger/10">
                      <div className="space-y-1">
                        <p className="font-medium">{activity.activity}</p>
                        <p className="text-sm text-muted-fg">
                          Owner: {activity.owner} | Due: {formatDate(activity.dueDate)}
                        </p>
                        <p className="text-sm text-muted-fg">
                          Goal: {activity.goal}
                        </p>
                      </div>
                      <Badge variant="destructive">{activity.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No critical accounts at this time</p>
              <p className="text-sm text-muted-foreground mt-2">All accounts are performing well</p>
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
