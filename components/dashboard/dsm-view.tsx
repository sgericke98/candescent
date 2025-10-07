"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AccountCard } from "@/components/account-card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Account } from "@/lib/types/database"
import { Users, TrendingUp, AlertTriangle } from "lucide-react"

interface DSMData {
  dsm: {
    id: string
    full_name: string
  }
  accounts: Account[]
  totalArr: number
  atRiskCount: number
  healthyCount: number
}

export function DSMView() {
  const [dsmData, setDsmData] = useState<DSMData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDsm, setSelectedDsm] = useState<string>('')

  // Mock data - in real app this would come from API
  const mockAccounts: Account[] = [
    {
      id: '1',
      name: 'First National Bank',
      type: 'Bank',
      location: 'New York',
      rssid: 'RSS123456',
      di_number: 'DI789012',
      aum: 2500,
      arr_usd: 3200,
      platform_fee_usd: 320,
      dsm_id: 'user-1',
      exec_sponsor_id: 'sponsor-1',
      health_score: 441,
      status: 'red',
      path_to_green: false,
      last_qbr_date: '2023-12-15',
      last_touchpoint: '2024-01-10',
      subscription_end: '2024-12-31',
      current_solutions: 'Core Banking',
      next_win_room: '2024-01-15',
      open_activities_count: 3,
      created_at: '2023-06-01T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z',
      dsm: { id: 'user-1', full_name: 'Sarah Johnson', role: 'dsm', created_at: '', updated_at: '' },
      exec_sponsor: { id: 'sponsor-1', name: 'Jennifer Martinez', created_at: '', updated_at: '' }
    },
    {
      id: '2',
      name: 'Metro Savings Bank',
      type: 'Bank',
      location: 'California',
      rssid: 'RSS234567',
      di_number: 'DI890123',
      aum: 1800,
      arr_usd: 1800,
      platform_fee_usd: 180,
      dsm_id: 'user-1',
      exec_sponsor_id: 'sponsor-2',
      health_score: 523,
      status: 'yellow',
      path_to_green: true,
      last_qbr_date: '2023-11-20',
      last_touchpoint: '2024-01-08',
      subscription_end: '2024-11-30',
      current_solutions: 'Digital Platform',
      next_win_room: '2024-01-18',
      open_activities_count: 2,
      created_at: '2023-07-01T00:00:00Z',
      updated_at: '2024-01-08T00:00:00Z',
      dsm: { id: 'user-1', full_name: 'Sarah Johnson', role: 'dsm', created_at: '', updated_at: '' },
      exec_sponsor: { id: 'sponsor-2', name: 'Robert Thompson', created_at: '', updated_at: '' }
    },
    {
      id: '3',
      name: 'Community Credit Union',
      type: 'Credit Union',
      location: 'Texas',
      rssid: 'RSS345678',
      di_number: 'DI901234',
      aum: 3200,
      arr_usd: 2500,
      platform_fee_usd: 250,
      dsm_id: 'user-2',
      exec_sponsor_id: 'sponsor-3',
      health_score: 387,
      status: 'red',
      path_to_green: false,
      last_qbr_date: '2023-10-15',
      last_touchpoint: '2024-01-05',
      subscription_end: '2024-10-31',
      current_solutions: 'Mobile Banking',
      next_win_room: '2024-01-22',
      open_activities_count: 4,
      created_at: '2023-08-01T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z',
      dsm: { id: 'user-2', full_name: 'Mike Chen', role: 'dsm', created_at: '', updated_at: '' },
      exec_sponsor: { id: 'sponsor-3', name: 'Amanda Davis', created_at: '', updated_at: '' }
    },
    {
      id: '4',
      name: 'Regional Financial',
      type: 'Bank',
      location: 'Florida',
      rssid: 'RSS456789',
      di_number: 'DI012345',
      aum: 4200,
      arr_usd: 2800,
      platform_fee_usd: 280,
      dsm_id: 'user-2',
      exec_sponsor_id: 'sponsor-1',
      health_score: 678,
      status: 'green',
      path_to_green: true,
      last_qbr_date: '2023-12-01',
      last_touchpoint: '2024-01-12',
      subscription_end: '2025-12-31',
      current_solutions: 'Payment Processing',
      next_win_room: '2024-02-15',
      open_activities_count: 1,
      created_at: '2023-09-01T00:00:00Z',
      updated_at: '2024-01-12T00:00:00Z',
      dsm: { id: 'user-2', full_name: 'Mike Chen', role: 'dsm', created_at: '', updated_at: '' },
      exec_sponsor: { id: 'sponsor-1', name: 'Jennifer Martinez', created_at: '', updated_at: '' }
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Group accounts by DSM
      const groupedData: { [key: string]: DSMData } = {}
      
      mockAccounts.forEach(account => {
        if (!account.dsm_id || !account.dsm) return
        
        if (!groupedData[account.dsm_id]) {
          groupedData[account.dsm_id] = {
            dsm: account.dsm,
            accounts: [],
            totalArr: 0,
            atRiskCount: 0,
            healthyCount: 0
          }
        }
        
        groupedData[account.dsm_id].accounts.push(account)
        groupedData[account.dsm_id].totalArr += account.arr_usd
        
        if (account.status === 'green') {
          groupedData[account.dsm_id].healthyCount++
        } else {
          groupedData[account.dsm_id].atRiskCount++
        }
      })
      
      setDsmData(Object.values(groupedData))
      setLoading(false)
    }, 1000)
  }, [])

  const filteredData = selectedDsm 
    ? dsmData.filter(d => d.dsm.id === selectedDsm)
    : dsmData

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* DSM Filter */}
      <Card>
        <CardHeader>
          <CardTitle>DSM Account View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by DSM:</label>
            <select 
              value={selectedDsm} 
              onChange={(e) => setSelectedDsm(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="">All DSMs</option>
              {dsmData.map(dsm => (
                <option key={dsm.dsm.id} value={dsm.dsm.id}>
                  {dsm.dsm.full_name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* DSM Summary Cards */}
      {!selectedDsm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dsmData.map(dsm => (
            <Card key={dsm.dsm.id} className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {dsm.dsm.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total ARR</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(dsm.totalArr * 1000)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accounts</p>
                    <p className="text-lg font-semibold">{dsm.accounts.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">At Risk</span>
                  </div>
                  <Badge variant="destructive">{dsm.atRiskCount}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Healthy</span>
                  </div>
                  <Badge variant="default">{dsm.healthyCount}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Account Cards */}
      {filteredData.map(dsm => (
        <div key={dsm.dsm.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{dsm.dsm.full_name}'s Accounts</h2>
            <Badge variant="outline">{dsm.accounts.length} accounts</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dsm.accounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onClick={() => {
                  // Open account detail modal
                  console.log('Open account:', account.id)
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No accounts found for the selected DSM.</p>
        </div>
      )}
    </div>
  )
}
