import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface HealthChipProps {
  score: number
  className?: string
}

export function HealthChip({ score, className }: HealthChipProps) {
  const getHealthStatus = (score: number) => {
    if (score >= 700) return { 
      label: 'Healthy', 
      bg: 'bg-[var(--chip-green-bg)]', 
      fg: 'text-[var(--chip-green-fg)]' 
    }
    if (score >= 500) return { 
      label: 'At Risk', 
      bg: 'bg-[var(--chip-yellow-bg)]', 
      fg: 'text-[var(--chip-yellow-fg)]' 
    }
    return { 
      label: 'Critical', 
      bg: 'bg-[var(--chip-red-bg)]', 
      fg: 'text-[var(--chip-red-fg)]' 
    }
  }

  const { label, bg, fg } = getHealthStatus(score)

  return (
    <Badge 
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium border border-border",
        bg,
        fg,
        className
      )}
    >
      {score}
    </Badge>
  )
}
