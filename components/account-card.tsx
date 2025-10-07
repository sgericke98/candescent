import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { HealthChip } from "@/components/health-chip"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { Account } from "@/lib/types/database"
import { Calendar } from "lucide-react"

interface AccountCardProps {
  account: Account
  onClick?: () => void
  className?: string
}

export function AccountCard({ account, onClick, className }: AccountCardProps) {
  return (
    <Card 
      className={`card-hover cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {account.name}
            </CardTitle>
            <p className="text-sm text-muted-fg">
              {account.location}
            </p>
          </div>
          <StatusBadge status={account.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-fg">ARR</p>
            <p className="text-lg font-semibold">
              {formatCurrency(account.arr_usd * 1000)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-fg">Health</p>
            <HealthChip score={account.health_score} />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-fg">Path to Green</span>
            <Badge variant={account.path_to_green ? "default" : "secondary"}>
              {account.path_to_green ? "Yes" : "No"}
            </Badge>
          </div>
          
          {account.next_win_room && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-fg" />
              <span className="text-muted-fg">Next Win Room:</span>
              <span className="font-medium">
                {formatDateShort(account.next_win_room)}
              </span>
            </div>
          )}
          
        </div>
      </CardContent>
    </Card>
  )
}
