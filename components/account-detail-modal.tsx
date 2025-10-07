"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { StatusBadge } from "@/components/status-badge"
import { HealthChip } from "@/components/health-chip"
import { formatCurrency, formatDate } from "@/lib/utils"
import { AccountWithDetails, Stakeholder, Risk, Activity } from "@/lib/types/database"
import { Edit, Calendar, MapPin, Building, DollarSign, User, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface AccountDetailModalProps {
  account: AccountWithDetails | null
  isOpen: boolean
  onClose: () => void
  canEdit?: boolean
}

export function AccountDetailModal({ account, isOpen, onClose, canEdit = false }: AccountDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (!account) return null

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'green': return 'text-green-600'
      case 'yellow': return 'text-yellow-600'
      case 'red': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'Not Started': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{account.name}</DialogTitle>
            <div className="flex items-center gap-4">
              <StatusBadge status={account.status} />
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Details */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="account-details">
              <AccordionTrigger>Account Details</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{account.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{account.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">ARR</p>
                      <p className="font-medium">{formatCurrency(account.arr_usd * 1000)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">DSM</p>
                      <p className="font-medium">{account.dsm?.full_name || 'Unassigned'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Exec Sponsor</p>
                      <p className="font-medium">{account.exec_sponsor?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Next Win Room</p>
                      <p className="font-medium">
                        {account.next_win_room ? formatDate(account.next_win_room) : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Battle Plan */}
            <AccordionItem value="battle-plan">
              <AccordionTrigger>Battle Plan</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <HealthChip score={account.health_score} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Account is currently {account.status} with a health score of {account.health_score}. 
                          {account.path_to_green ? ' There is a clear path to green status.' : ' Immediate action required to improve status.'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Path to Green:</span>
                          <Badge variant={account.path_to_green ? "default" : "destructive"}>
                            {account.path_to_green ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Strategic Objectives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Secure contract renewal</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Improve health score to 700+</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">Schedule quarterly business review</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">Address identified risks</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stakeholders */}
            <AccordionItem value="stakeholders">
              <AccordionTrigger>Stakeholders</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {account.stakeholders.map((stakeholder) => (
                    <div key={stakeholder.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{getInitials(stakeholder.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{stakeholder.name}</p>
                          <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
                          {stakeholder.description && (
                            <p className="text-sm text-muted-foreground mt-1">{stakeholder.description}</p>
                          )}
                        </div>
                      </div>
                      {stakeholder.status && (
                        <div className={`w-3 h-3 rounded-full ${
                          stakeholder.status === 'green' ? 'bg-green-500' :
                          stakeholder.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Risks */}
            <AccordionItem value="risks">
              <AccordionTrigger>Risks</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {account.risks.map((risk) => (
                    <Card key={risk.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{risk.key_risk}</CardTitle>
                          <Badge variant="outline">{risk.risk_type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {risk.summary && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Summary</p>
                            <p className="text-sm">{risk.summary}</p>
                          </div>
                        )}
                        {risk.supporting_evidence && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Supporting Evidence</p>
                            <p className="text-sm">{risk.supporting_evidence}</p>
                          </div>
                        )}
                        {risk.levers_to_pull && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Levers to Pull</p>
                            <p className="text-sm">{risk.levers_to_pull}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Key Activities */}
            <AccordionItem value="activities">
              <AccordionTrigger>Key Activities</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {account.activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{getInitials(activity.owner?.full_name || 'Unknown')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{activity.activity}</p>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Owner: {activity.owner?.full_name || 'Unassigned'}</span>
                            {activity.due_date && (
                              <span>Due: {formatDate(activity.due_date)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className={getActivityStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  )
}
