"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AccountCard } from "@/components/account-card"
import { AccountDetailModal } from "@/components/account-detail-modal"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Account, AccountWithDetails } from "@/lib/types/database"
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
  const [selectedAccount, setSelectedAccount] = useState<AccountWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingAccount, setLoadingAccount] = useState(false)

  useEffect(() => {
    // Fetch real accounts from API
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts')
        if (response.ok) {
          const data = await response.json()
          const accounts = data.accounts || []
          
          // Group accounts by DSM
          const groupedData: { [key: string]: DSMData } = {}
          
          accounts.forEach((account: Account) => {
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
        } else {
          console.error('Failed to fetch accounts for DSM View')
        }
      } catch (error) {
        console.error('Error fetching accounts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAccounts()
  }, [])

  const filteredData = selectedDsm 
    ? dsmData.filter(d => d.dsm.id === selectedDsm)
    : dsmData

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>DSM Account View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label htmlFor="dsm-select" className="text-sm font-medium">Filter by DSM:</label>
            <select 
              id="dsm-select"
              value={selectedDsm} 
              onChange={(e) => setSelectedDsm(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
              aria-label="Filter accounts by DSM"
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
            <Card 
              key={dsm.dsm.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedDsm(dsm.dsm.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {dsm.dsm.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Accounts</p>
                    <p className="text-2xl font-bold">{dsm.accounts.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total ARR</p>
                    <p className="text-2xl font-bold">{formatCurrency(dsm.totalArr * 1000)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Healthy</p>
                      <p className="text-xl font-bold">{dsm.healthyCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">At Risk</p>
                      <p className="text-xl font-bold">{dsm.atRiskCount}</p>
                    </div>
                  </div>
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
            <h2 className="text-2xl font-bold">{dsm.dsm.full_name}&apos;s Accounts</h2>
            <Badge variant="outline">{dsm.accounts.length} accounts</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dsm.accounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onClick={() => handleAccountClick(account.id)}
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

      <AccountDetailModal
        account={selectedAccount}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        canEdit={true}
      />
    </div>
  )
}