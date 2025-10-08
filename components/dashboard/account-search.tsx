"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HealthChip } from "@/components/health-chip"
import { AccountDetailModal } from "@/components/account-detail-modal"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Search, Download, X, Check } from "lucide-react"
import { Account, AccountWithDetails } from "@/lib/types/database"

interface AccountSearchProps {
  userRole?: string
}

export function AccountSearch({ userRole }: AccountSearchProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDsm, setSelectedDsm] = useState('')
  const [selectedSponsor, setSelectedSponsor] = useState('')
  const [riskFilter, setRiskFilter] = useState<'all' | 'at_risk' | 'top_50_risk' | 'contract_expiring'>('all')
  const [sortBy, setSortBy] = useState<'arr' | 'health' | 'subscription_end'>('arr')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedAccount, setSelectedAccount] = useState<AccountWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (riskFilter !== 'all') {
        params.append('filter', riskFilter)
      }
      
      if (selectedDsm) {
        params.append('dsm', selectedDsm)
      }
      
      if (selectedSponsor) {
        params.append('exec_sponsor', selectedSponsor)
      }
      
      const response = await fetch(`/api/accounts?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      } else {
        console.error('Failed to fetch accounts')
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }, [riskFilter, selectedDsm, selectedSponsor])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = !searchQuery || 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.dsm?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.exec_sponsor?.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    let aValue: number | string | undefined
    let bValue: number | string | undefined
    
    switch (sortBy) {
      case 'arr':
        aValue = a.arr_usd
        bValue = b.arr_usd
        break
      case 'health':
        aValue = a.health_score
        bValue = b.health_score
        break
      case 'subscription_end':
        aValue = a.subscription_end ? new Date(a.subscription_end).getTime() : 0
        bValue = b.subscription_end ? new Date(b.subscription_end).getTime() : 0
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
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAccount(null)
  }

  const handleExport = () => {
    // Convert accounts to CSV
    const headers = [
      'Account Name',
      'Location',
      'DSM',
      'Exec Sponsor',
      'ARR (USD)',
      'Health Score',
      'Path to Green',
      'Subscription End',
      'Health < 600',
      'DSM Risk',
      'Auto Renew',
      'Pricing Outlier'
    ]
    
    const rows = sortedAccounts.map(account => [
      account.name,
      account.location,
      account.dsm?.full_name || '',
      account.exec_sponsor?.name || '',
      account.arr_usd * 1000,
      account.health_score,
      account.path_to_green ? 'Yes' : 'No',
      account.subscription_end || '',
      account.health_score < 600 ? 'Yes' : 'No',
      account.dsm_risk_assessment ? 'Yes' : 'No',
      account.auto_renew ? 'Yes' : 'No',
      account.pricing_outlier ? 'Yes' : 'No'
    ])
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `account-search-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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
          <CardTitle>Account Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Account Name, Location, DSM, or Exec Sponsor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* Risk Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="risk-filter" className="text-sm font-medium">View:</label>
              <Select value={riskFilter} onValueChange={(value: 'all' | 'at_risk' | 'top_50_risk' | 'contract_expiring') => setRiskFilter(value)}>
                <SelectTrigger id="risk-filter" className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="at_risk">At Risk Accounts</SelectItem>
                  <SelectItem value="top_50_risk">Top 50 At Risk</SelectItem>
                  <SelectItem value="contract_expiring">Contract Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* DSM Filter - Only show for non-DSM users */}
            {userRole !== 'dsm' && (
              <div className="flex items-center gap-2">
                <label htmlFor="dsm-filter" className="text-sm font-medium">DSM:</label>
                <Select value={selectedDsm || 'all'} onValueChange={(val) => setSelectedDsm(val === 'all' ? '' : val)}>
                  <SelectTrigger id="dsm-filter" className="w-[180px]">
                    <SelectValue placeholder="All DSMs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All DSMs</SelectItem>
                    {uniqueDsms.map(dsm => (
                      <SelectItem key={dsm?.id} value={dsm?.id || 'unknown'}>
                        {dsm?.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Exec Sponsor Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="sponsor-filter" className="text-sm font-medium">Exec Sponsor:</label>
              <Select value={selectedSponsor || 'all'} onValueChange={(val) => setSelectedSponsor(val === 'all' ? '' : val)}>
                <SelectTrigger id="sponsor-filter" className="w-[180px]">
                  <SelectValue placeholder="All Exec Sponsors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exec Sponsors</SelectItem>
                  {uniqueSponsors.map(sponsor => (
                    <SelectItem key={sponsor?.id} value={sponsor?.id || 'unknown'}>
                      {sponsor?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(riskFilter !== 'all' || selectedDsm || selectedSponsor) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {riskFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {riskFilter === 'at_risk' && 'At Risk Accounts'}
                  {riskFilter === 'top_50_risk' && 'Top 50 At Risk'}
                  {riskFilter === 'contract_expiring' && 'Contract Expiring'}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setRiskFilter('all')} />
                </Badge>
              )}
              {selectedDsm && (
                <Badge variant="secondary" className="gap-1">
                  DSM: {uniqueDsms.find(d => d?.id === selectedDsm)?.full_name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDsm('')} />
                </Badge>
              )}
              {selectedSponsor && (
                <Badge variant="secondary" className="gap-1">
                  Exec: {uniqueSponsors.find(s => s?.id === selectedSponsor)?.name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSponsor('')} />
                </Badge>
              )}
            </div>
          )}
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
                  <th className="text-left p-4 font-medium">Location</th>
                  <th className="text-left p-4 font-medium">DSM</th>
                  <th className="text-left p-4 font-medium">Exec Sponsor</th>
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
                  <th className="text-center p-4 font-medium">Path to Green</th>
                  <th 
                    className="text-left p-4 font-medium cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort('subscription_end')}
                  >
                    Contract End {sortBy === 'subscription_end' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-center p-4 font-medium">Health&lt;600</th>
                  <th className="text-center p-4 font-medium">DSM Risk</th>
                  <th className="text-center p-4 font-medium">Auto Renew</th>
                  <th className="text-center p-4 font-medium">Price Outlier</th>
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
                      <div className="font-medium">{account.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">{account.location}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{account.dsm?.full_name || 'Unassigned'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{account.exec_sponsor?.name || 'Unassigned'}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-medium">{formatCurrency(account.arr_usd * 1000)}</div>
                    </td>
                    <td className="p-4 text-center">
                      <HealthChip score={account.health_score} />
                    </td>
                    <td className="p-4 text-center">
                      {account.path_to_green ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {account.subscription_end ? formatDate(account.subscription_end) : 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {account.health_score < 600 ? (
                        <Badge variant="destructive" className="text-xs">Yes</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">No</Badge>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {account.dsm_risk_assessment ? (
                        <Badge variant="destructive" className="text-xs">Yes</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">No</Badge>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {account.auto_renew ? (
                        <Badge variant="default" className="text-xs">Yes</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">No</Badge>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {account.pricing_outlier ? (
                        <Badge variant="destructive" className="text-xs">Yes</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">No</Badge>
                      )}
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
                  setRiskFilter('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
          
          {sortedAccounts.length > 0 && (
            <div className="p-4 text-sm text-muted-foreground border-t">
              Showing {sortedAccounts.length} account{sortedAccounts.length !== 1 ? 's' : ''}
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
