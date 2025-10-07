"use client"

import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { TrendingUp, TrendingDown, Users, Calendar, Activity } from "lucide-react"

// Mock data - in real app this would come from API
const kpis = {
  total_arr_at_risk: 55200000,
  accounts_at_risk: 24,
  wow_change_pct: -8,
  accounts_through_win_room: 15,
  outstanding_followups: 174
}

const nextWinRooms = [
  {
    account: "First National Bank",
    dsm: "Sarah Johnson",
    arr: 3200000,
    health: 441,
    date: "2024-01-15"
  },
  {
    account: "Community Credit Union",
    dsm: "Mike Chen",
    arr: 1800000,
    health: 523,
    date: "2024-01-18"
  },
  {
    account: "Regional Savings Bank",
    dsm: "Emily Rodriguez",
    arr: 2500000,
    health: 387,
    date: "2024-01-22"
  }
]

const previousWinRooms = [
  {
    account: "Metro Bank",
    dsm: "David Kim",
    arr: 4100000,
    health: 678,
    date: "2024-01-08"
  },
  {
    account: "State Credit Union",
    dsm: "Lisa Wang",
    arr: 2200000,
    health: 745,
    date: "2024-01-05"
  }
]

const criticalAccounts = [
  {
    account: "First National Bank",
    dsm: "Sarah Johnson",
    arr: 3200000,
    health: 441,
    winRoomDate: "2024-01-15",
    activities: [
      { activity: "Schedule executive meeting", owner: "Sarah Johnson", dueDate: "2024-01-12", goal: "Secure renewal commitment", status: "Not Started" },
      { activity: "Prepare risk mitigation plan", owner: "Sarah Johnson", dueDate: "2024-01-14", goal: "Address key concerns", status: "Not Started" }
    ]
  }
]

export function ExecutiveSummary() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <StatCard
          title="Total ARR at Risk"
          value={formatCurrency(kpis.total_arr_at_risk)}
          delta={{
            value: kpis.wow_change_pct,
            label: `${kpis.wow_change_pct}% WoW`
          }}
        />
        <StatCard
          title="Accounts at Risk"
          value={kpis.accounts_at_risk}
          delta={{
            value: -3,
            label: "-3 this week"
          }}
        />
        <StatCard
          title="WoW Change"
          value={`${kpis.wow_change_pct}%`}
          delta={{
            value: kpis.wow_change_pct,
            label: "At-risk accounts"
          }}
        />
        <StatCard
          title="Accounts Through Win Room"
          value={kpis.accounts_through_win_room}
          delta={{
            value: 5,
            label: "+5 this month"
          }}
        />
        <StatCard
          title="Outstanding Follow-Ups"
          value={kpis.outstanding_followups}
          delta={{
            value: -12,
            label: "-12 this week"
          }}
        />
      </div>

      {/* Tables and Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
              {nextWinRooms.map((room, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">{room.account}</p>
                    <p className="text-sm text-muted-fg">{room.dsm}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">{formatCurrency(room.arr)}</p>
                    <Badge variant={room.health >= 500 ? "default" : "destructive"}>
                      {room.health}
                    </Badge>
                    <p className="text-sm text-muted-fg">
                      {formatDate(room.date)}
                    </p>
                  </div>
                </div>
              ))}
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
              {previousWinRooms.map((room, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">{room.account}</p>
                    <p className="text-sm text-muted-fg">{room.dsm}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">{formatCurrency(room.arr)}</p>
                    <Badge variant={room.health >= 500 ? "default" : "destructive"}>
                      {room.health}
                    </Badge>
                    <p className="text-sm text-muted-fg">
                      {formatDate(room.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-fg">
              Charts will be implemented with Recharts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Accounts - Action Required */}
      <Card className="border-danger/20 bg-danger-50/50">
        <CardHeader>
          <CardTitle className="text-danger">Critical Accounts – Action Required</CardTitle>
        </CardHeader>
        <CardContent>
          {criticalAccounts.map((account, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-danger/20">
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
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
