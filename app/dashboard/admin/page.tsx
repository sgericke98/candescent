"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Save, X, Users, Building2 } from "lucide-react"

interface DSM {
  id: string
  full_name: string
  email: string
  role: string
}

interface Sponsor {
  id: string
  name: string
}

export default function AdminPage() {
  const [dsms, setDsms] = useState<DSM[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDsmId, setEditingDsmId] = useState<string | null>(null)
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null)
  const [showAddDsm, setShowAddDsm] = useState(false)
  const [showAddSponsor, setShowAddSponsor] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, sponsorsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/exec-sponsors')
      ])

      if (usersRes.ok) {
        const data = await usersRes.json()
        setDsms(data.users || [])
      }

      if (sponsorsRes.ok) {
        const data = await sponsorsRes.json()
        setSponsors(data.sponsors || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDsm = async (formData: FormData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.get('full_name'),
          role: formData.get('role')
        })
      })

      if (response.ok) {
        toast.success('DSM added successfully')
        setShowAddDsm(false)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add DSM')
      }
    } catch {
      toast.error('Failed to add DSM')
    }
  }

  const handleUpdateDsm = async (id: string, formData: FormData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          full_name: formData.get('full_name'),
          role: formData.get('role')
        })
      })

      if (response.ok) {
        toast.success('DSM updated successfully')
        setEditingDsmId(null)
        fetchData()
      } else {
        toast.error('Failed to update DSM')
      }
    } catch {
      toast.error('Failed to update DSM')
    }
  }

  const handleDeleteDsm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })

      if (response.ok) {
        toast.success('User deleted')
        fetchData()
      } else {
        toast.error('Failed to delete user')
      }
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const handleAddSponsor = async (formData: FormData) => {
    try {
      const response = await fetch('/api/exec-sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name')
        })
      })

      if (response.ok) {
        toast.success('Executive Sponsor added successfully')
        setShowAddSponsor(false)
        fetchData()
      } else {
        toast.error('Failed to add sponsor')
      }
    } catch {
      toast.error('Failed to add sponsor')
    }
  }

  const handleUpdateSponsor = async (id: string, formData: FormData) => {
    try {
      const response = await fetch('/api/exec-sponsors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: formData.get('name')
        })
      })

      if (response.ok) {
        toast.success('Sponsor updated successfully')
        setEditingSponsorId(null)
        fetchData()
      } else {
        toast.error('Failed to update sponsor')
      }
    } catch {
      toast.error('Failed to update sponsor')
    }
  }

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this executive sponsor?')) return

    try {
      const response = await fetch(`/api/exec-sponsors?id=${id}`, { method: 'DELETE' })

      if (response.ok) {
        toast.success('Sponsor deleted')
        fetchData()
      } else {
        toast.error('Failed to delete sponsor')
      }
    } catch {
      toast.error('Failed to delete sponsor')
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, DSMs, and executive sponsors
        </p>
      </div>

      <Tabs defaultValue="dsms">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dsms">
            <Users className="h-4 w-4 mr-2" />
            DSMs & Users
          </TabsTrigger>
          <TabsTrigger value="sponsors">
            <Building2 className="h-4 w-4 mr-2" />
            Executive Sponsors
          </TabsTrigger>
        </TabsList>

        {/* DSMs Tab */}
        <TabsContent value="dsms" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>DSMs & Users</CardTitle>
              <Button onClick={() => setShowAddDsm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddDsm && (
                <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg space-y-3">
                  <h4 className="font-semibold">Add New User</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Full Name *</Label>
                      <Input name="full_name" placeholder="John Doe" />
                    </div>
                    <div>
                      <Label>Role *</Label>
                      <select name="role" className="w-full px-3 py-2 border rounded-md" aria-label="User role">
                        <option value="dsm">DSM</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
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
                          if (inputElement.name) formData.append(inputElement.name, inputElement.value)
                        })
                        handleAddDsm(formData)
                      }
                    }}>
                      Save User
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddDsm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-semibold">Full Name</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dsms.map((dsm) => (
                      editingDsmId === dsm.id ? (
                        <tr key={dsm.id} className="border-b bg-blue-50">
                          <td className="py-4">
                            <Input name="full_name" defaultValue={dsm.full_name} className="h-9" />
                          </td>
                          <td className="py-4">
                            <select name="role" defaultValue={dsm.role} className="px-3 py-2 border rounded-md h-9" aria-label="User role">
                              <option value="dsm">DSM</option>
                              <option value="admin">Admin</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <Button size="sm" onClick={(e) => {
                                const form = (e.target as HTMLElement).closest('tr')
                                if (form) {
                                  const formData = new FormData()
                                  const inputs = form.querySelectorAll('input, select')
                                  inputs.forEach((input: Element) => {
                                    const inputElement = input as HTMLInputElement | HTMLSelectElement
                                    if (inputElement.name) formData.append(inputElement.name, inputElement.value)
                                  })
                                  handleUpdateDsm(dsm.id, formData)
                                }
                              }}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setEditingDsmId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={dsm.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 font-medium">{dsm.full_name}</td>
                          <td className="py-4">
                            <Badge variant={dsm.role === 'admin' ? 'destructive' : dsm.role === 'dsm' ? 'default' : 'secondary'}>
                              {dsm.role.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingDsmId(dsm.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500"
                                onClick={() => handleDeleteDsm(dsm.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exec Sponsors Tab */}
        <TabsContent value="sponsors" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Executive Sponsors</CardTitle>
              <Button onClick={() => setShowAddSponsor(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Executive Sponsor
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddSponsor && (
                <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg space-y-3">
                  <h4 className="font-semibold">Add New Executive Sponsor</h4>
                  <div>
                    <Label>Name *</Label>
                    <Input name="name" placeholder="Sponsor name" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={(e) => {
                      const form = (e.target as HTMLElement).closest('.space-y-3')
                      if (form) {
                        const formData = new FormData()
                        const inputs = form.querySelectorAll('input')
                        inputs.forEach((input: Element) => {
                          const inputElement = input as HTMLInputElement
                          if (inputElement.name) formData.append(inputElement.name, inputElement.value)
                        })
                        handleAddSponsor(formData)
                      }
                    }}>
                      Save Sponsor
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddSponsor(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sponsors.map((sponsor) => (
                      editingSponsorId === sponsor.id ? (
                        <tr key={sponsor.id} className="border-b bg-blue-50">
                          <td className="py-4">
                            <Input name="name" defaultValue={sponsor.name} className="h-9" />
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <Button size="sm" onClick={(e) => {
                                const form = (e.target as HTMLElement).closest('tr')
                                if (form) {
                                  const formData = new FormData()
                                  const inputs = form.querySelectorAll('input')
                                  inputs.forEach((input: Element) => {
                                    const inputElement = input as HTMLInputElement
                                    if (inputElement.name) formData.append(inputElement.name, inputElement.value)
                                  })
                                  handleUpdateSponsor(sponsor.id, formData)
                                }
                              }}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setEditingSponsorId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={sponsor.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 font-medium">{sponsor.name}</td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingSponsorId(sponsor.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500"
                                onClick={() => handleDeleteSponsor(sponsor.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
