"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/status-badge"
import { HealthChip } from "@/components/health-chip"
import { formatCurrency, formatDate, formatDateShort } from "@/lib/utils"
import { WinRoom } from "@/lib/types/database"
import { 
  Calendar, 
  MapPin, 
  Building, 
  DollarSign, 
  User, 
  Users, 
  FileText,
  Hash,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History
} from "lucide-react"

interface HistoricalAccountViewProps {
  winRoom: WinRoom | null
  isOpen: boolean
  onClose: () => void
}

export function HistoricalAccountView({ winRoom, isOpen, onClose }: HistoricalAccountViewProps) {
  if (!winRoom || !winRoom.account_snapshot) return null

  const account = winRoom.account_snapshot
  const stakeholders = winRoom.stakeholders_snapshot || []
  const risks = winRoom.risks_snapshot || []
  const activities = winRoom.activities_snapshot || []

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <History className="h-6 w-6 text-blue-600" />
                {account.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Historical Snapshot from {formatDate(winRoom.date)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Read-Only View
              </Badge>
              <StatusBadge status={account.status} />
              <HealthChip score={account.health_score} />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Historical Banner */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              📸 This is a historical snapshot of the account as it was on {formatDate(winRoom.date)}. 
              All data is read-only and represents the state at that point in time.
            </p>
          </div>

          {/* Win Room Outcome */}
          {winRoom.outcome_notes && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-base">Win Room Outcome & Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{winRoom.outcome_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Account Details Section - All Fields as they were */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Account Details (as of {formatDateShort(winRoom.date)})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 border border-gray-300">
                  <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">LOCATION</p>
                    <p className="font-semibold text-gray-900">{account.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 border border-gray-300">
                  <Building className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">TYPE</p>
                    <p className="font-semibold text-gray-900">{account.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 border border-gray-300">
                  <Hash className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">RSSID</p>
                    <p className="font-semibold text-gray-900">{account.rssid || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 border border-gray-300">
                  <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">DI #</p>
                    <p className="font-semibold text-gray-900">{account.di_number || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 border border-gray-300">
                  <DollarSign className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">AUM</p>
                    <p className="font-semibold text-gray-900">
                      {account.aum ? `$${account.aum.toFixed(2)}M` : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 border border-gray-300">
                  <DollarSign className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">ARR</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(account.arr_usd * 1000)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 border border-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">PATH TO GREEN</p>
                    <p className="font-semibold text-gray-900">{account.path_to_green ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 border border-gray-300">
                  <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">SUBSCRIPTION END</p>
                    <p className="font-semibold text-gray-900">
                      {account.subscription_end ? formatDateShort(account.subscription_end) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="col-span-full flex items-start gap-3 p-3 rounded-lg bg-gray-100 border border-gray-300">
                  <FileText className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-medium">CURRENT SOLUTIONS</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {account.current_solutions || 'No solutions listed'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stakeholders Snapshot */}
          {stakeholders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Stakeholders (at time of Win Room)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stakeholders.map((stakeholder, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-gray-200 text-gray-700">
                            {getInitials(stakeholder.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{stakeholder.name}</p>
                          <p className="text-sm text-blue-600 font-medium">{stakeholder.role}</p>
                          {stakeholder.description && (
                            <p className="text-sm text-muted-foreground mt-1">{stakeholder.description}</p>
                          )}
                        </div>
                      </div>
                      {stakeholder.status && (
                        <div 
                          className={`w-4 h-4 rounded-full ${
                            stakeholder.status === 'green' ? 'bg-green-500' :
                            stakeholder.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          title={`Status: ${stakeholder.status}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risks Snapshot */}
          {risks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risks (at time of Win Room)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {risks.map((risk, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{risk.key_risk}</h4>
                        <Badge className={getRiskTypeColor(risk.risk_type)}>
                          {risk.risk_type}
                        </Badge>
                      </div>
                      
                      {risk.summary && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Summary</p>
                          <p className="text-sm mt-1">{risk.summary}</p>
                        </div>
                      )}
                      
                      {risk.supporting_evidence && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Supporting Evidence</p>
                          <p className="text-sm mt-1">{risk.supporting_evidence}</p>
                        </div>
                      )}
                      
                      {risk.levers_to_pull && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Levers to Pull</p>
                          <p className="text-sm mt-1">{risk.levers_to_pull}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activities Snapshot */}
          {activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Activities (at time of Win Room)
                </CardTitle>
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
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((activity, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-4 font-medium">{activity.activity}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-gray-200">
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
                            <Badge className={getActivityStatusColor(activity.status)}>
                              {activity.status}
                            </Badge>
                          </td>
                          <td className="py-4 text-sm">
                            {activity.due_date ? formatDateShort(activity.due_date) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
