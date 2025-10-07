import { Badge } from "@/components/ui/badge"
import { cn, getStatusColor, getStatusDotColor } from "@/lib/utils"
import { AccountStatus } from "@/lib/types/database"

interface StatusBadgeProps {
  status: AccountStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusLabels = {
    green: 'GREEN',
    yellow: 'YELLOW', 
    red: 'RED'
  }

  return (
    <Badge 
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 font-semibold",
        getStatusColor(status),
        className
      )}
    >
      <div className={cn("w-2 h-2 rounded-full", getStatusDotColor(status))} />
      {statusLabels[status]}
    </Badge>
  )
}
