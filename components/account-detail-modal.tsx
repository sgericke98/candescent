"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/status-badge"
import { HealthChip } from "@/components/health-chip"
import { formatCurrency, formatDate, formatDateShort } from "@/lib/utils"
import { AccountWithDetails, Activity, Risk, Stakeholder, WinRoom } from "@/lib/types/database"
import { toast } from "sonner"
import { 
  Edit, 
  Save,
  X,
  Calendar, 
  MapPin, 
  Building, 
  DollarSign, 
  User, 
  Users, 
  TrendingUp,
  FileText,
  Hash,
  CreditCard,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  ExternalLink
} from "lucide-react"

interface AccountDetailModalProps {
  account: AccountWithDetails | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: (updatedAccount: AccountWithDetails) => void
  canEdit?: boolean
}

interface EditableFields {
  path_to_green: boolean
  next_win_room: string
  current_solutions: string
  last_qbr_date: string
  last_touchpoint: string
  subscription_end: string
}

export function AccountDetailModal({ account, isOpen, onClose, onUpdate, canEdit = false }: AccountDetailModalProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedFields, setEditedFields] = useState<EditableFields>({
    path_to_green: false,
    next_win_room: '',
    current_solutions: '',
    last_qbr_date: '',
    last_touchpoint: '',
    subscription_end: ''
  })

  const [localAccount, setLocalAccount] = useState(account)

  useEffect(() => {
    if (account) {
      setLocalAccount(account)
      setEditedFields({
        path_to_green: account.path_to_green || false,
        next_win_room: account.next_win_room || '',
        current_solutions: account.current_solutions || '',
        last_qbr_date: account.last_qbr_date || '',
        last_touchpoint: account.last_touchpoint || '',
        subscription_end: account.subscription_end || ''
      })
    }
  }, [account])

  if (!localAccount) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/accounts/${localAccount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedFields)
      })

      if (!response.ok) {
        throw new Error('Failed to update account')
      }

      const updatedData = await response.json()
      
      // Update local state with new data
      const updatedAccount = { ...localAccount, ...editedFields }
      setLocalAccount(updatedAccount)
      
      toast.success('Account updated successfully')
      setIsEditing(false)
      
      if (onUpdate) {
        onUpdate(updatedAccount)
      }
    } catch (error) {
      console.error('Error updating account:', error)
      toast.error('Failed to update account')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset fields
    if (account) {
      setEditedFields({
        path_to_green: account.path_to_green || false,
        next_win_room: account.next_win_room || '',
        current_solutions: account.current_solutions || '',
        last_qbr_date: account.last_qbr_date || '',
        last_touchpoint: account.last_touchpoint || '',
        subscription_end: account.subscription_end || ''
      })
    }
    setIsEditing(false)
  }

  const handleActivityStatusUpdate = async (activityId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activityId, status: newStatus })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Activity update error:', errorData)
        throw new Error('Failed to update activity')
      }

      const { activity } = await response.json()
      
      // Update local state
      setLocalAccount(prev => prev ? {
        ...prev,
        activities: prev.activities.map(a => a.id === activityId ? activity : a),
        open_activities_count: prev.activities.filter(a => 
          a.id === activityId ? newStatus !== 'Completed' : a.status !== 'Completed'
        ).length
      } : null)
      
      toast.success('Activity status updated')
    } catch (error) {
      console.error('Activity update failed:', error)
      toast.error('Failed to update activity status')
    }
  }

  const handleDeleteStakeholder = async (stakeholderId: string) => {
    if (!confirm('Are you sure you want to delete this stakeholder?')) return
    
    try {
      const response = await fetch(`/api/stakeholders?id=${stakeholderId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setLocalAccount(prev => prev ? {
          ...prev,
          stakeholders: prev.stakeholders.filter(s => s.id !== stakeholderId)
        } : null)
        toast.success('Stakeholder deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete stakeholder')
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return
    
    try {
      const response = await fetch(`/api/activities?id=${activityId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setLocalAccount(prev => prev ? {
          ...prev,
          activities: prev.activities.filter(a => a.id !== activityId),
          open_activities_count: prev.activities.filter(a => 
            a.id !== activityId && a.status !== 'Completed'
          ).length
        } : null)
        toast.success('Activity deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete activity')
    }
  }

  const navigateToBattlePlan = () => {
    if (localAccount) {
      onClose()
      router.push(`/dashboard/accounts/${localAccount.id}/win-room`)
    }
  }

  const navigateToWinRoom = () => {
    if (localAccount) {
      onClose()
      router.push(`/dashboard/accounts/${localAccount.id}/win-room`)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Not Started': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskTypeColor = (riskType: string) => {
    switch (riskType) {
      case 'Competition': return 'bg-yellow-100 text-yellow-800'
      case 'Price': return 'bg-blue-100 text-blue-800'
      case 'Product': return 'bg-orange-100 text-orange-800'
      case 'Delivery': return 'bg-purple-100 text-purple-800'
      case 'Relationship': return 'bg-red-100 text-red-800'
      case 'Changes': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStakeholderStatusColor = (status?: string | null) => {
    if (!status) return 'bg-gray-400'
    switch (status) {
      case 'green': return 'bg-green-500'
      case 'yellow': return 'bg-yellow-500'
      case 'red': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{localAccount.name}</DialogTitle>
            <div className="flex items-center gap-3">
              <StatusBadge status={localAccount.status} />
              <HealthChip score={localAccount.health_score} />
              {canEdit && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  ANNUAL RECURRING REVENUE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(localAccount.arr_usd * 1000)}</p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  HEALTH SCORE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-900">{localAccount.health_score}</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  NEXT WIN ROOM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-900">
                  {localAccount.next_win_room ? formatDateShort(localAccount.next_win_room) : 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  OPEN ACTIVITIES
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-900">{localAccount.open_activities_count}</p>
              </CardContent>
            </Card>
          </div>

          {/* Key Activities Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Key Activities
              </CardTitle>
              {isEditing && (
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Activity</th>
                      <th className="pb-3 font-medium">Owner</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Due Date</th>
                      {isEditing && <th className="pb-3 font-medium">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {localAccount.activities && localAccount.activities.length > 0 ? (
                      localAccount.activities.map((activity) => (
                        <tr key={activity.id} className="border-b last:border-0">
                          <td className="py-4 font-medium">{activity.activity}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {getInitials(activity.owner?.full_name || 'Unknown')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{activity.owner?.full_name || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-muted-foreground max-w-xs truncate">
                            {activity.description || '-'}
                          </td>
                          <td className="py-4">
                            {isEditing ? (
                              <select
                                value={activity.status}
                                onChange={(e) => handleActivityStatusUpdate(activity.id, e.target.value)}
                                className="px-2 py-1 border rounded text-sm"
                                aria-label={`Update status for ${activity.activity}`}
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            ) : (
                              <Badge className={getActivityStatusColor(activity.status)}>
                                {activity.status}
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 text-sm">
                            {activity.due_date ? formatDateShort(activity.due_date) : '-'}
                          </td>
                          {isEditing && (
                            <td className="py-4">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteActivity(activity.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No activities found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Account Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Non-editable fields remain blue */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                    <p className="text-xs text-blue-700 font-medium">LOCATION</p>
                    <p className="font-semibold text-blue-900">{localAccount.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Building className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-700 font-medium">TYPE</p>
                    <p className="font-semibold text-blue-900">{localAccount.type}</p>
                    </div>
                  </div>
                  
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Hash className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                    <p className="text-xs text-blue-700 font-medium">RSSID</p>
                    <p className="font-semibold text-blue-900">{localAccount.rssid || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-700 font-medium">DI #</p>
                    <p className="font-semibold text-blue-900">{localAccount.di_number || 'N/A'}</p>
                    </div>
                  </div>
                  
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                    <p className="text-xs text-blue-700 font-medium">DSM</p>
                    <p className="font-semibold text-blue-900">{localAccount.dsm?.full_name || 'Unassigned'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Users className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-700 font-medium">EXEC SPONSOR</p>
                    <p className="font-semibold text-blue-900">{localAccount.exec_sponsor?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                  
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                    <p className="text-xs text-blue-700 font-medium">AUM</p>
                    <p className="font-semibold text-blue-900">
                      {localAccount.aum ? `$${localAccount.aum.toFixed(2)}M` : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-700 font-medium">ARR</p>
                    <p className="font-semibold text-blue-900">{formatCurrency(localAccount.arr_usd * 1000)}</p>
                    </div>
                  </div>
                  
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                    <p className="text-xs text-blue-700 font-medium">PLATFORM FEE</p>
                    <p className="font-semibold text-blue-900">
                      {localAccount.platform_fee_usd ? `$${localAccount.platform_fee_usd.toFixed(2)}` : 'N/A'}
                    </p>
                  </div>
                  </div>
                  
                {/* Editable fields - purple when in edit mode */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${isEditing ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
                  <Calendar className={`h-5 w-5 flex-shrink-0 ${isEditing ? 'text-purple-600' : 'text-blue-600'}`} />
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${isEditing ? 'text-purple-700' : 'text-blue-700'}`}>SUBSCRIPTION END</p>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedFields.subscription_end}
                        onChange={(e) => setEditedFields({...editedFields, subscription_end: e.target.value})}
                        className="h-7 text-sm mt-1"
                      />
                    ) : (
                      <p className={`font-semibold ${isEditing ? 'text-purple-900' : 'text-blue-900'}`}>
                        {localAccount.subscription_end ? formatDateShort(localAccount.subscription_end) : 'N/A'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${isEditing ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
                  <FileText className={`h-5 w-5 flex-shrink-0 ${isEditing ? 'text-purple-600' : 'text-blue-600'}`} />
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${isEditing ? 'text-purple-700' : 'text-blue-700'}`}>LAST QBR</p>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedFields.last_qbr_date}
                        onChange={(e) => setEditedFields({...editedFields, last_qbr_date: e.target.value})}
                        className="h-7 text-sm mt-1"
                      />
                    ) : (
                      <p className={`font-semibold ${isEditing ? 'text-purple-900' : 'text-blue-900'}`}>
                        {localAccount.last_qbr_date ? formatDateShort(localAccount.last_qbr_date) : 'N/A'}
                      </p>
                    )}
                        </div>
                      </div>
                
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${isEditing ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
                  <Clock className={`h-5 w-5 flex-shrink-0 ${isEditing ? 'text-purple-600' : 'text-blue-600'}`} />
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${isEditing ? 'text-purple-700' : 'text-blue-700'}`}>LAST SOLUTION ASSESSMENT</p>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedFields.last_touchpoint}
                        onChange={(e) => setEditedFields({...editedFields, last_touchpoint: e.target.value})}
                        className="h-7 text-sm mt-1"
                      />
                    ) : (
                      <p className={`font-semibold ${isEditing ? 'text-purple-900' : 'text-blue-900'}`}>
                        {localAccount.last_touchpoint ? formatDateShort(localAccount.last_touchpoint) : 'N/A'}
                      </p>
                    )}
                        </div>
                      </div>
                
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${isEditing ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
                  <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${isEditing ? 'text-purple-600' : 'text-blue-600'}`} />
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${isEditing ? 'text-purple-700' : 'text-blue-700'}`}>PATH TO GREEN Y/N</p>
                    {isEditing ? (
                      <select
                        value={editedFields.path_to_green ? 'true' : 'false'}
                        onChange={(e) => setEditedFields({...editedFields, path_to_green: e.target.value === 'true'})}
                        className="w-full px-2 py-1 border rounded text-sm mt-1"
                        aria-label="Path to green status"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <p className={`font-semibold ${isEditing ? 'text-purple-900' : 'text-blue-900'}`}>
                        {localAccount.path_to_green ? 'Yes' : 'No'}
                      </p>
                    )}
                  </div>
                </div>

                <div className={`col-span-full flex items-start gap-3 p-3 rounded-lg border ${isEditing ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
                  <FileText className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isEditing ? 'text-purple-600' : 'text-blue-600'}`} />
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${isEditing ? 'text-purple-700' : 'text-blue-700'}`}>CURRENT SOLUTIONS</p>
                    {isEditing ? (
                      <textarea
                        value={editedFields.current_solutions}
                        onChange={(e) => setEditedFields({...editedFields, current_solutions: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-sm mt-1 min-h-[60px]"
                        placeholder="Enter current solutions..."
                      />
                    ) : (
                      <p className={`font-semibold mt-1 ${isEditing ? 'text-purple-900' : 'text-blue-900'}`}>
                        {localAccount.current_solutions || 'No solutions listed'}
                      </p>
                          )}
                        </div>
                      </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg border ${isEditing ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
                  <Calendar className={`h-5 w-5 flex-shrink-0 ${isEditing ? 'text-purple-600' : 'text-blue-600'}`} />
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${isEditing ? 'text-purple-700' : 'text-blue-700'}`}>NEXT WIN ROOM</p>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedFields.next_win_room}
                        onChange={(e) => setEditedFields({...editedFields, next_win_room: e.target.value})}
                        className="h-7 text-sm mt-1"
                      />
                    ) : (
                      <p className={`font-semibold ${isEditing ? 'text-purple-900' : 'text-blue-900'}`}>
                        {localAccount.next_win_room ? formatDateShort(localAccount.next_win_room) : 'N/A'}
                      </p>
                      )}
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Battle Plan Navigation Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-purple-200 bg-purple-50/30"
            onClick={navigateToBattlePlan}
          >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-purple-600" />
                  Battle Plan
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-purple-600">View Full Battle Plan →</span>
                  <ExternalLink className="h-4 w-4 text-purple-600" />
                </div>
                        </div>
                      </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                  <p className="text-2xl font-bold text-purple-900">{localAccount.stakeholders?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Stakeholders</p>
                          </div>
                          <div>
                  <p className="text-2xl font-bold text-purple-900">{localAccount.risks?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Risks</p>
                          </div>
                          </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Click to view and manage stakeholders and risks
              </p>
                      </CardContent>
                    </Card>

          {/* Win Room Navigation Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200 bg-blue-50/30"
            onClick={navigateToWinRoom}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Win Room Dashboard
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">View Win Room Dashboard →</span>
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-medium text-green-700">Next Win Room</p>
                  <p className="text-xl font-bold text-green-900 mt-1">
                    {localAccount.next_win_room ? formatDate(localAccount.next_win_room) : 'Not scheduled'}
                  </p>
                  {localAccount.next_win_room && (
                    <p className="text-sm text-green-700 mt-1">
                      {Math.ceil((new Date(localAccount.next_win_room).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days away
                    </p>
                            )}
                          </div>
                
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-medium text-blue-700">Win Room History</p>
                  <p className="text-xl font-bold text-blue-900 mt-1">
                    {localAccount.win_rooms?.length || 0} sessions
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {localAccount.win_rooms && localAccount.win_rooms.length > 0 
                      ? `Last: ${formatDateShort(localAccount.win_rooms[0].date)}`
                      : 'No history'}
                  </p>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Click to view full battle plan, stakeholders, risks, and activities
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
