"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AccountCard } from "@/components/account-card"
import { AccountDetailModal } from "@/components/account-detail-modal"
import { Account, AccountWithDetails } from "@/lib/types/database"
import { Search } from "lucide-react"

interface DsmViewProps {
  dsmName: string
}

export function DsmView({ dsmName }: DsmViewProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<AccountWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts')
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
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = !searchQuery || 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div>
        <h2 className="text-xl font-semibold">{dsmName}&apos;s Accounts</h2>
        <p className="text-sm text-muted-foreground">
          {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''} assigned
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Cards Grid */}
      {filteredAccounts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {accounts.length === 0 
                ? "No accounts assigned yet." 
                : "No accounts match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onClick={() => handleAccountClick(account.id)}
            />
          ))}
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