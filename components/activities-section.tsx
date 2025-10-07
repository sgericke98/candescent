"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Save, X, Target } from "lucide-react"
import { Activity } from "@/lib/types/database"
import { formatDate, formatDateShort } from "@/lib/utils"

interface ActivitiesSectionProps {
  activities: Activity[]
  accountId: string
  onActivitiesUpdate: (activities: Activity[]) => void
  canEdit?: boolean
  showAddButton?: boolean
  title?: string
  variant?: 'full' | 'compact'
}

export function ActivitiesSection({
  activities,
  accountId,
  onActivitiesUpdate,
  canEdit = false,
  showAddButton = true,
  title = "Activities",
  variant = 'full'
}: ActivitiesSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAddActivity = async (formData: FormData) => {
    try {
      const newActivity = {
        account_id: accountId,
        activity: formData.get('activity'),
        description: formData.get('description'),
        status: formData.get('status') || 'Not Started',
        due_date: formData.get('due_date') || null,
        owner_id: null
      }

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity)
      })

      if (response.ok) {
        const { activity } = await response.json()
        onActivitiesUpdate([...activities, activity])
        toast.success('Activity added')
        setShowAddForm(false)
      } else {
        throw new Error('Failed to add')
      }
    } catch (error) {
      toast.error('Failed to add activity')
    }
  }

  const handleUpdateActivity = async (activityId: string, formData: FormData) => {
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
        onActivitiesUpdate(activities.map(a => a.id === activityId ? activity : a))
        toast.success('Activity updated')
        setEditingId(null)
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast.error('Failed to update activity')
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return
    
    try {
      const response = await fetch(`/api/activities?id=${activityId}`, { method: 'DELETE' })
      if (response.ok) {
        onActivitiesUpdate(activities.filter(a => a.id !== activityId))
        toast.success('Activity deleted')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete activity')
    }
  }

  const handleStatusUpdate = async (activityId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activityId, status: newStatus })
      })

      if (response.ok) {
        const { activity } = await response.json()
        onActivitiesUpdate(activities.map(a => a.id === activityId ? activity : a))
        toast.success('Activity status updated')
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast.error('Failed to update activity status')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          {title}
        </CardTitle>
        {canEdit && showAddButton && (
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Activity
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Activity Form */}
        {showAddForm && canEdit && (
          <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Add New Activity</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
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
                  inputs.forEach((input: Element) => {
                    const inputElement = input as HTMLInputElement | HTMLSelectElement
                    if (inputElement.name) {
                      formData.append(inputElement.name, inputElement.value)
                    }
                  })
                  handleAddActivity(formData)
                }
              }}>
                Save Activity
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Activities Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                {variant === 'full' && <th className="pb-3 font-medium">Timeframe</th>}
                <th className="pb-3 font-medium">Activity</th>
                <th className="pb-3 font-medium">Owner</th>
                {variant === 'full' && <th className="pb-3 font-medium">Description</th>}
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Due Date</th>
                {canEdit && <th className="pb-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {activities && activities.length > 0 ? (
                activities.map((activity) => (
                  editingId === activity.id ? (
                    // Edit Mode
                    <tr key={activity.id} className="border-b bg-blue-50">
                      {variant === 'full' && (
                        <td className="py-4">
                          <Input
                            name="due_date"
                            type="date"
                            defaultValue={activity.due_date || ''}
                            className="h-8"
                          />
                        </td>
                      )}
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
                      {variant === 'full' && (
                        <td className="py-4">
                          <Input
                            name="description"
                            defaultValue={activity.description || ''}
                            className="h-8"
                          />
                        </td>
                      )}
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
                      {variant === 'full' && (
                        <td className="py-4">
                          <Input
                            name="due_date"
                            type="date"
                            defaultValue={activity.due_date || ''}
                            className="h-8"
                          />
                        </td>
                      )}
                      {canEdit && (
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
                                  inputs.forEach((input: Element) => {
                                    const inputElement = input as HTMLInputElement | HTMLSelectElement
                                    if (inputElement.name) {
                                      formData.append(inputElement.name, inputElement.value)
                                    }
                                  })
                                  handleUpdateActivity(activity.id, formData)
                                }
                              }}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ) : (
                    // View Mode
                    <tr key={activity.id} className="border-b last:border-0 hover:bg-gray-50">
                      {variant === 'full' && (
                        <td className="py-4 text-sm">
                          {activity.due_date ? formatDate(activity.due_date) : 'Not set'}
                        </td>
                      )}
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
                      {variant === 'full' && (
                        <td className="py-4 text-sm text-muted-foreground max-w-xs truncate">
                          {activity.description || '-'}
                        </td>
                      )}
                      <td className="py-4">
                        {canEdit ? (
                          <select
                            value={activity.status}
                            onChange={(e) => handleStatusUpdate(activity.id, e.target.value)}
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
                      {canEdit && (
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingId(activity.id)}
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
                      )}
                    </tr>
                  )
                ))
              ) : (
                <tr>
                  <td colSpan={variant === 'full' ? 7 : 5} className="py-8 text-center text-muted-foreground">
                    No activities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
