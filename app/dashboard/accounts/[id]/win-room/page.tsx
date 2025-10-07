"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AccountWithDetails } from "@/lib/types/database"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { ArrowLeft, Plus, Calendar, Edit, Trash2, Info, Target, Save, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { HistoricalAccountView } from "@/components/historical-account-view"
import { WinRoom } from "@/lib/types/database"

export default function WinRoomPage() {
  const params = useParams()
  const router = useRouter()
  const [account, setAccount] = useState<AccountWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [selectedHistoricalWinRoom, setSelectedHistoricalWinRoom] = useState<WinRoom | null>(null)
  const [isHistoricalViewOpen, setIsHistoricalViewOpen] = useState(false)
  const [editingStakeholderId, setEditingStakeholderId] = useState<string | null>(null)
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [showAddStakeholder, setShowAddStakeholder] = useState(false)
  const [showAddRisk, setShowAddRisk] = useState(false)
  const [showAddActivity, setShowAddActivity] = useState(false)

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch(`/api/accounts/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setAccount(data.account)
        }
      } catch (error) {
        console.error('Error fetching account:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAccount()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!account) {
    return (
      <div className="container mx-auto p-6">
        <p>Account not found</p>
      </div>
    )
  }

  const sortedWinRooms = [...(account.win_rooms || [])].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRiskTypeColor = (riskType: string) => {
    switch (riskType) {
      case 'Relationship': return 'bg-red-100 text-red-800'
      case 'Product': return 'bg-orange-100 text-orange-800'
      case 'Competition': return 'bg-yellow-100 text-yellow-800'
      case 'Price': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteStakeholder = async (stakeholderId: string) => {
    if (!confirm('Are you sure you want to delete this stakeholder?')) return
    
    try {
      const response = await fetch(`/api/stakeholders?id=${stakeholderId}`, { method: 'DELETE' })
      if (response.ok) {
        setAccount(prev => prev ? { ...prev, stakeholders: prev.stakeholders.filter(s => s.id !== stakeholderId) } : null)
        toast.success('Stakeholder deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete stakeholder')
    }
  }

  const handleSaveStakeholder = async (stakeholderId: string, formData: FormData) => {
    try {
      const updateData = {
        id: stakeholderId,
        name: formData.get('name'),
        role: formData.get('role'),
        description: formData.get('description'),
        status: formData.get('status') || null
      }

      const response = await fetch('/api/stakeholders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const { stakeholder } = await response.json()
        setAccount(prev => prev ? {
          ...prev,
          stakeholders: prev.stakeholders.map(s => s.id === stakeholderId ? stakeholder : s)
        } : null)
        toast.success('Stakeholder updated')
        setEditingStakeholderId(null)
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast.error('Failed to update stakeholder')
    }
  }

  const handleDeleteRisk = async (riskId: string) => {
    if (!confirm('Are you sure you want to delete this risk?')) return
    
    try {
      const response = await fetch(`/api/risks?id=${riskId}`, { method: 'DELETE' })
      if (response.ok) {
        setAccount(prev => prev ? { ...prev, risks: prev.risks.filter(r => r.id !== riskId) } : null)
        toast.success('Risk deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete risk')
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return
    
    try {
      const response = await fetch(`/api/activities?id=${activityId}`, { method: 'DELETE' })
      if (response.ok) {
        setAccount(prev => prev ? { ...prev, activities: prev.activities.filter(a => a.id !== activityId) } : null)
        toast.success('Activity deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete activity')
    }
  }

  const handleSaveActivity = async (activityId: string, formData: FormData) => {
    try {
      const updateData = {
        id: activityId,
        activity: formData.get('activity'),
        description: formData.get('description'),
        status: formData.get('status'),
        due_date: formData.get('due_date') || null
      }

      const response = await fetch('/api/activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const { activity } = await response.json()
        setAccount(prev => prev ? {
          ...prev,
          activities: prev.activities.map(a => a.id === activityId ? activity : a)
        } : null)
        toast.success('Activity updated')
        setEditingActivityId(null)
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast.error('Failed to update activity')
    }
  }

  const handleAddStakeholder = async (formData: FormData) => {
    try {
      const newStakeholder = {
        account_id: params.id,
        name: formData.get('name'),
        role: formData.get('role'),
        description: formData.get('description'),
        status: formData.get('status') || null
      }

      const response = await fetch('/api/stakeholders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStakeholder)
      })

      if (response.ok) {
        const { stakeholder } = await response.json()
        setAccount(prev => prev ? {
          ...prev,
          stakeholders: [...prev.stakeholders, stakeholder]
        } : null)
        toast.success('Stakeholder added')
        setShowAddStakeholder(false)
      } else {
        throw new Error('Failed to add')
      }
    } catch (error) {
      toast.error('Failed to add stakeholder')
    }
  }

  const handleAddRisk = async (formData: FormData) => {
    try {
      const newRisk = {
        account_id: params.id,
        risk_type: formData.get('risk_type'),
        key_risk: formData.get('key_risk'),
        summary: formData.get('summary'),
        supporting_evidence: formData.get('supporting_evidence'),
        levers_to_pull: formData.get('levers_to_pull')
      }

      const response = await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRisk)
      })

      if (response.ok) {
        const { risk } = await response.json()
        setAccount(prev => prev ? {
          ...prev,
          risks: [...prev.risks, risk]
        } : null)
        toast.success('Risk added')
        setShowAddRisk(false)
      } else {
        throw new Error('Failed to add')
      }
    } catch (error) {
      toast.error('Failed to add risk')
    }
  }

  const handleAddActivity = async (formData: FormData) => {
    try {
      const newActivity = {
        account_id: params.id,
        activity: formData.get('activity'),
        description: formData.get('description'),
        status: formData.get('status') || 'Not Started',
        due_date: formData.get('due_date') || null,
        owner_id: null // Could be enhanced to select owner
      }

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity)
      })

      if (response.ok) {
        const { activity } = await response.json()
        setAccount(prev => prev ? {
          ...prev,
          activities: [...prev.activities, activity]
        } : null)
        toast.success('Activity added')
        setShowAddActivity(false)
      } else {
        throw new Error('Failed to add')
      }
    } catch (error) {
      toast.error('Failed to add activity')
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{account.name}</h1>
            <p className="text-muted-foreground">Win Room Dashboard</p>
          </div>
        </div>
        <Button onClick={() => setShowScheduleForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Win Room
        </Button>
      </div>

      {/* Schedule Win Room Form */}
      {showScheduleForm && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Schedule New Win Room</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="win-room-date">Date</Label>
              <Input
                id="win-room-date"
                type="date"
                placeholder="Select date"
              />
            </div>
            <div>
              <Label htmlFor="win-room-notes">Outcome Notes (Optional)</Label>
              <textarea
                id="win-room-notes"
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                placeholder="Add notes about objectives, outcomes, or next steps..."
              />
            </div>
            <div className="flex gap-2">
              <Button>
                Save Win Room
              </Button>
              <Button variant="outline" onClick={() => setShowScheduleForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Overall Account Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Current Status */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">CURRENT STATUS</h3>
                  <p className="text-sm text-blue-800">
                    {account.subscription_end ? 
                      `${Math.ceil((new Date(account.subscription_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))} months out from first full Candescent renewal with Wintrust. ` :
                      'Renewal timeline not set. '
                    }
                    Internal alignment needed on renewal objectives and understanding of client goals.
                  </p>
                </div>
              </div>
            </div>

            {/* Strategic Objectives */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">STRATEGIC OBJECTIVES</h3>
                  <p className="text-sm text-green-800">
                    {account.current_solutions || 'Buy more, save more mentality; renewal timed near FIS completion; additional objectives TBD.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stakeholders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Stakeholders</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAddStakeholder(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Stakeholder
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Stakeholder Form */}
          {showAddStakeholder && (
            <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Add New Stakeholder</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowAddStakeholder(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name *</Label>
                  <Input name="name" placeholder="Stakeholder name" className="h-9" />
                </div>
                <div>
                  <Label>Role *</Label>
                  <Input name="role" placeholder="e.g., Decision Maker" className="h-9" />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Input name="description" placeholder="Optional description" className="h-9" />
                </div>
                <div>
                  <Label>Status</Label>
                  <select name="status" className="w-full px-3 py-2 border rounded-md h-9" aria-label="Stakeholder status">
                    <option value="">None</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="red">Red</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={(e) => {
                  const form = (e.target as HTMLElement).closest('.space-y-3')
                  if (form) {
                    const formData = new FormData()
                    const inputs = form.querySelectorAll('input, select')
                    inputs.forEach((input: any) => {
                      if (input.name) {
                        formData.append(input.name, input.value)
                      }
                    })
                    handleAddStakeholder(formData)
                  }
                }}>
                  Save Stakeholder
                </Button>
                <Button variant="outline" onClick={() => setShowAddStakeholder(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-semibold">Stakeholder Name</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {account.stakeholders && account.stakeholders.length > 0 ? (
                  account.stakeholders.map((stakeholder) => (
                    editingStakeholderId === stakeholder.id ? (
                      <tr key={stakeholder.id} className="border-b bg-blue-50">
                        <td className="py-4">
                          <Input
                            name="name"
                            defaultValue={stakeholder.name}
                            className="h-8"
                          />
                        </td>
                        <td className="py-4">
                          <Input
                            name="role"
                            defaultValue={stakeholder.role}
                            className="h-8"
                          />
                        </td>
                        <td className="py-4">
                          <Input
                            name="description"
                            defaultValue={stakeholder.description || ''}
                            className="h-8"
                          />
                        </td>
                        <td className="py-4">
                          <select
                            name="status"
                            defaultValue={stakeholder.status || ''}
                            className="px-2 py-1 border rounded text-sm h-8"
                            aria-label="Stakeholder status"
                          >
                            <option value="">None</option>
                            <option value="green">Green</option>
                            <option value="yellow">Yellow</option>
                            <option value="red">Red</option>
                          </select>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={(e) => {
                                const form = (e.target as HTMLElement).closest('tr')
                                if (form) {
                                  const formData = new FormData()
                                  const inputs = form.querySelectorAll('input, select')
                                  inputs.forEach((input: any) => {
                                    if (input.name) {
                                      formData.append(input.name, input.value)
                                    }
                                  })
                                  handleSaveStakeholder(stakeholder.id, formData)
                                }
                              }}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingStakeholderId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={stakeholder.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-4 font-medium">{stakeholder.name}</td>
                        <td className="py-4 text-sm">{stakeholder.role}</td>
                        <td className="py-4 text-sm">{stakeholder.description || '-'}</td>
                        <td className="py-4">
                          {stakeholder.status ? (
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-3 h-3 rounded-full ${
                                  stakeholder.status === 'green' ? 'bg-green-500' :
                                  stakeholder.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              />
                              <span className="text-sm capitalize">{stakeholder.status}</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingStakeholderId(stakeholder.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteStakeholder(stakeholder.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No stakeholders added
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Risks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Risks</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAddRisk(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Risk
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Risk Form */}
          {showAddRisk && (
            <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Add New Risk</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowAddRisk(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Risk Type *</Label>
                  <select name="risk_type" className="w-full px-3 py-2 border rounded-md h-9" aria-label="Risk type">
                    <option value="Relationship">Relationship</option>
                    <option value="Product">Product</option>
                    <option value="Competition">Competition</option>
                    <option value="Price">Price</option>
                  </select>
                </div>
                <div>
                  <Label>Key Risk *</Label>
                  <Input name="key_risk" placeholder="Main risk title" className="h-9" />
                </div>
                <div className="col-span-2">
                  <Label>Summary</Label>
                  <textarea name="summary" className="w-full px-3 py-2 border rounded-md min-h-[60px]" placeholder="Risk summary..."></textarea>
                </div>
                <div className="col-span-2">
                  <Label>Supporting Evidence</Label>
                  <textarea name="supporting_evidence" className="w-full px-3 py-2 border rounded-md min-h-[60px]" placeholder="Evidence..."></textarea>
                </div>
                <div className="col-span-2">
                  <Label>Levers to Pull</Label>
                  <textarea name="levers_to_pull" className="w-full px-3 py-2 border rounded-md min-h-[60px]" placeholder="Mitigation strategies..."></textarea>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={(e) => {
                  const form = (e.target as HTMLElement).closest('.space-y-3')
                  if (form) {
                    const formData = new FormData()
                    const inputs = form.querySelectorAll('input, select, textarea')
                    inputs.forEach((input: any) => {
                      if (input.name) {
                        formData.append(input.name, input.value)
                      }
                    })
                    handleAddRisk(formData)
                  }
                }}>
                  Save Risk
                </Button>
                <Button variant="outline" onClick={() => setShowAddRisk(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-4">
            {account.risks && account.risks.length > 0 ? (
              account.risks.map((risk) => (
                <div key={risk.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Badge className={getRiskTypeColor(risk.risk_type)}>
                        {risk.risk_type}
                      </Badge>
                      <h4 className="font-semibold text-lg">{risk.key_risk}</h4>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingRiskId(risk.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteRisk(risk.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {risk.summary && (
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground">Summary</Label>
                      <p className="text-sm mt-1">{risk.summary}</p>
                    </div>
                  )}
                  
                  {risk.supporting_evidence && (
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground">Supporting Evidence</Label>
                      <p className="text-sm mt-1">{risk.supporting_evidence}</p>
                    </div>
                  )}
                  
                  {risk.levers_to_pull && (
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground">Levers to Pull</Label>
                      <p className="text-sm mt-1">{risk.levers_to_pull}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No risks identified
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Battle Plan Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Battle Plan Activities</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAddActivity(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Activity
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Activity Form */}
          {showAddActivity && (
            <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Add New Activity</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowAddActivity(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Activity *</Label>
                  <Input name="activity" placeholder="Activity name" className="h-9" />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input name="due_date" type="date" className="h-9" />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Input name="description" placeholder="Activity description" className="h-9" />
                </div>
                <div>
                  <Label>Status</Label>
                  <select name="status" className="w-full px-3 py-2 border rounded-md h-9" aria-label="Activity status">
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={(e) => {
                  const form = (e.target as HTMLElement).closest('.space-y-3')
                  if (form) {
                    const formData = new FormData()
                    const inputs = form.querySelectorAll('input, select')
                    inputs.forEach((input: any) => {
                      if (input.name) {
                        formData.append(input.name, input.value)
                      }
                    })
                    handleAddActivity(formData)
                  }
                }}>
                  Save Activity
                </Button>
                <Button variant="outline" onClick={() => setShowAddActivity(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-semibold">Timeframe</th>
                  <th className="pb-3 font-semibold">Activity</th>
                  <th className="pb-3 font-semibold">Team</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {account.activities && account.activities.length > 0 ? (
                  account.activities.map((activity) => (
                    editingActivityId === activity.id ? (
                      <tr key={activity.id} className="border-b bg-blue-50">
                        <td className="py-4">
                          <Input
                            name="due_date"
                            type="date"
                            defaultValue={activity.due_date || ''}
                            className="h-8"
                          />
                        </td>
                        <td className="py-4">
                          <Input
                            name="activity"
                            defaultValue={activity.activity}
                            className="h-8"
                          />
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {activity.owner?.full_name || 'Unassigned'}
                        </td>
                        <td className="py-4">
                          <Input
                            name="description"
                            defaultValue={activity.description || ''}
                            className="h-8"
                          />
                        </td>
                        <td className="py-4">
                          <select
                            name="status"
                            defaultValue={activity.status}
                            className="px-2 py-1 border rounded text-sm h-8"
                            aria-label="Activity status"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={(e) => {
                                const form = (e.target as HTMLElement).closest('tr')
                                if (form) {
                                  const formData = new FormData()
                                  const inputs = form.querySelectorAll('input, select')
                                  inputs.forEach((input: any) => {
                                    if (input.name) {
                                      formData.append(input.name, input.value)
                                    }
                                  })
                                  handleSaveActivity(activity.id, formData)
                                }
                              }}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingActivityId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={activity.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-4 text-sm">
                          {activity.due_date ? formatDate(activity.due_date) : 'Not set'}
                        </td>
                        <td className="py-4 font-medium">{activity.activity}</td>
                        <td className="py-4 text-sm">{activity.owner?.full_name || 'Unassigned'}</td>
                        <td className="py-4 text-sm">{activity.description || '-'}</td>
                        <td className="py-4">
                          <Badge className={
                            activity.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            activity.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {activity.status}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingActivityId(activity.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteActivity(activity.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No activities found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Next Win Room */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-700" />
            Next Win Room
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {account.next_win_room ? formatDate(account.next_win_room) : 'Not scheduled'}
          </div>
          {account.next_win_room && (
            <p className="text-sm text-green-700 mt-2">
              {Math.ceil((new Date(account.next_win_room).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days from now
            </p>
          )}
        </CardContent>
      </Card>

      {/* Win Room History */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Win Room History</h2>
        {sortedWinRooms.length > 0 ? (
          sortedWinRooms.map((winRoom) => (
            <Card 
              key={winRoom.id}
              className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{formatDate(winRoom.date)}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedHistoricalWinRoom(winRoom)
                          setIsHistoricalViewOpen(true)
                        }}
                      >
                        📸 View Complete Snapshot
                      </Button>
                      {!winRoom.account_snapshot && (
                        <Badge variant="secondary" className="text-xs">
                          Legacy record - limited data
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {winRoom.account_snapshot ? (
                      <>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Health Score</p>
                          <Badge className={
                            winRoom.account_snapshot.status === 'green' ? 'bg-green-100 text-green-800' :
                            winRoom.account_snapshot.status === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {winRoom.account_snapshot.health_score}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">ARR</p>
                          <p className="font-semibold">
                            ${((winRoom.account_snapshot.arr_usd || 0) * 1000).toLocaleString()}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No snapshot available
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Outcome Notes Preview */}
                {winRoom.outcome_notes && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="text-sm font-semibold text-blue-900">Outcome & Next Steps</Label>
                    <p className="text-sm mt-2 line-clamp-3">{winRoom.outcome_notes}</p>
                  </div>
                )}
                
                {/* Snapshot Summary */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{winRoom.stakeholders_snapshot?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Stakeholders</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{winRoom.risks_snapshot?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Risks</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{winRoom.activities_snapshot?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Activities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No win room history</p>
              <Button className="mt-4" onClick={() => setShowScheduleForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Your First Win Room
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Historical Account View Modal */}
      <HistoricalAccountView
        winRoom={selectedHistoricalWinRoom}
        isOpen={isHistoricalViewOpen}
        onClose={() => {
          setIsHistoricalViewOpen(false)
          setSelectedHistoricalWinRoom(null)
        }}
      />
    </div>
  )
}
