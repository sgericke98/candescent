"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { HealthChip } from "@/components/health-chip"
import { AccountDetailModal } from "@/components/account-detail-modal"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Search, Filter, Download } from "lucide-react"
import { Account, AccountWithDetails } from "@/lib/types/database"

export function AtRiskSearch() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDsm, setSelectedDsm] = useState('')
  const [selectedSponsor, setSelectedSponsor] = useState('')
  const [sortBy, setSortBy] = useState<'arr' | 'health' | 'next_win_room'>('arr')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedAccount, setSelectedAccount] = useState<AccountWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingAccount, setLoadingAccount] = useState(false)

  useEffect(() => {
    // Fetch accounts from API with at-risk filter
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts?atRisk=true')
        if (response.ok) {
          const data = await response.json()
          setAccounts(data.accounts || [])
        } else {
          console.error('Failed to fetch at-risk accounts')
        }
      } catch (error) {
        console.error('Error fetching accounts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAccounts()
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

  const handleAccountClick = async (accountId: string) => {
    setLoadingAccount(true)
    setIsModalOpen(true)
    
    try {
      const response = await fetch(`/api/accounts/${accountId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedAccount(data.account)
      } else {
        console.error('Failed to fetch account details')
      }
    } catch (error) {
      console.error('Error fetching account:', error)
    } finally {
      setLoadingAccount(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAccount(null)
  }

  // Get unique DSMs and Exec Sponsors from accounts for filter dropdowns
  const uniqueDsms = Array.from(
    new Map(
      accounts
        .filter(acc => acc.dsm)
        .map(acc => [acc.dsm_id, acc.dsm])
    ).values()
  )

  const uniqueSponsors = Array.from(
    new Map(
      accounts
        .filter(acc => acc.exec_sponsor)
        .map(acc => [acc.exec_sponsor_id, acc.exec_sponsor])
    ).values()
  )

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
              <label htmlFor="dsm-filter" className="text-sm font-medium">DSM:</label>
              <select 
                id="dsm-filter"
                value={selectedDsm} 
                onChange={(e) => setSelectedDsm(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
                aria-label="Filter by DSM"
              >
                <option value="">All DSMs</option>
                {uniqueDsms.map(dsm => (
                  <option key={dsm?.id} value={dsm?.id}>
                    {dsm?.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sponsor-filter" className="text-sm font-medium">Exec Sponsor:</label>
              <select 
                id="sponsor-filter"
                value={selectedSponsor} 
                onChange={(e) => setSelectedSponsor(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
                aria-label="Filter by Executive Sponsor"
              >
                <option value="">All Exec Sponsors</option>
                {uniqueSponsors.map(sponsor => (
                  <option key={sponsor?.id} value={sponsor?.id}>
                    {sponsor?.name}
                  </option>
                ))}
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
                    onClick={() => handleAccountClick(account.id)}
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

      <AccountDetailModal
        account={selectedAccount}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        canEdit={true}
      />
    </div>
  )
}
