"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { HealthChip } from "@/components/health-chip"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Search, Filter, Download } from "lucide-react"
import { Account } from "@/lib/types/database"

export function AtRiskSearch() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDsm, setSelectedDsm] = useState('')
  const [selectedSponsor, setSelectedSponsor] = useState('')
  const [sortBy, setSortBy] = useState<'arr' | 'health' | 'next_win_room'>('arr')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
      name: 'Community Credit Union',
      type: 'Credit Union',
      location: 'California',
      rssid: 'RSS234567',
      di_number: 'DI890123',
      aum: 1800,
      arr_usd: 1800,
      platform_fee_usd: 180,
      dsm_id: 'user-2',
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
      dsm: { id: 'user-2', full_name: 'Mike Chen', role: 'dsm', created_at: '', updated_at: '' },
      exec_sponsor: { id: 'sponsor-2', name: 'Robert Thompson', created_at: '', updated_at: '' }
    },
    {
      id: '3',
      name: 'Regional Savings Bank',
      type: 'Bank',
      location: 'Texas',
      rssid: 'RSS345678',
      di_number: 'DI901234',
      aum: 3200,
      arr_usd: 2500,
      platform_fee_usd: 250,
      dsm_id: 'user-3',
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
      dsm: { id: 'user-3', full_name: 'Emily Rodriguez', role: 'dsm', created_at: '', updated_at: '' },
      exec_sponsor: { id: 'sponsor-3', name: 'Amanda Davis', created_at: '', updated_at: '' }
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAccounts(mockAccounts)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = !searchQuery || 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.dsm?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDsm = !selectedDsm || account.dsm_id === selectedDsm
    const matchesSponsor = !selectedSponsor || account.exec_sponsor_id === selectedSponsor
    
    return matchesSearch && matchesDsm && matchesSponsor
  })

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'arr':
        aValue = a.arr_usd
        bValue = b.arr_usd
        break
      case 'health':
        aValue = a.health_score
        bValue = b.health_score
        break
      case 'next_win_room':
        aValue = new Date(a.next_win_room || '')
        bValue = new Date(b.next_win_room || '')
        break
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>At-Risk Account Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Account Name, DSM, or Type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">DSM:</label>
              <select 
                value={selectedDsm} 
                onChange={(e) => setSelectedDsm(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="">All DSMs</option>
                <option value="user-1">Sarah Johnson</option>
                <option value="user-2">Mike Chen</option>
                <option value="user-3">Emily Rodriguez</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Exec Sponsor:</label>
              <select 
                value={selectedSponsor} 
                onChange={(e) => setSelectedSponsor(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="">All Exec Sponsors</option>
                <option value="sponsor-1">Jennifer Martinez</option>
                <option value="sponsor-2">Robert Thompson</option>
                <option value="sponsor-3">Amanda Davis</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Account Name</th>
                  <th className="text-left p-4 font-medium">DSM</th>
                  <th 
                    className="text-right p-4 font-medium cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('arr')}
                  >
                    ARR {sortBy === 'arr' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-center p-4 font-medium cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('health')}
                  >
                    Health {sortBy === 'health' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-4 font-medium">Exec Sponsor</th>
                  <th className="text-center p-4 font-medium">Path to Green</th>
                  <th className="text-left p-4 font-medium">Last Win Room</th>
                  <th 
                    className="text-left p-4 font-medium cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('next_win_room')}
                  >
                    Next Win Room {sortBy === 'next_win_room' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAccounts.map((account) => (
                  <tr 
                    key={account.id} 
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      // Open account detail modal
                      console.log('Open account:', account.id)
                    }}
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">{account.location}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{account.dsm?.full_name}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-medium">{formatCurrency(account.arr_usd * 1000)}</div>
                    </td>
                    <td className="p-4 text-center">
                      <HealthChip score={account.health_score} />
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{account.exec_sponsor?.name}</div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={account.path_to_green ? "default" : "secondary"}>
                        {account.path_to_green ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {account.last_qbr_date ? formatDate(account.last_qbr_date) : 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {account.next_win_room ? formatDate(account.next_win_room) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {sortedAccounts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No accounts found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDsm('')
                  setSelectedSponsor('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
