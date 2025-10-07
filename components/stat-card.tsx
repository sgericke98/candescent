import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatCurrency, formatNumber } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  delta?: {
    value: number
    label: string
  }
  className?: string
  formatAs?: 'currency' | 'number' | 'none'
  invertColors?: boolean // For risk metrics where increase is bad
}

export function StatCard({ title, value, delta, className, formatAs = 'currency', invertColors = false }: StatCardProps) {
  const getDeltaIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4" />
    if (value < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getDeltaColor = (value: number) => {
    if (invertColors) {
      // For risk metrics: increase = bad (red), decrease = good (green)
      if (value > 0) return "text-red-600"
      if (value < 0) return "text-green-600"
      return "text-orange-500"
    } else {
      // Normal: increase = good (green), decrease = bad (red)
      if (value > 0) return "text-success"
      if (value < 0) return "text-danger"
      return "text-muted-fg"
    }
  }

  const formatValue = () => {
    if (typeof value === 'string') return value
    
    switch (formatAs) {
      case 'currency':
        return formatCurrency(value)
      case 'number':
        return formatNumber(value)
      case 'none':
      default:
        return value
    }
  }

  return (
    <Card className={cn("card-hover", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-fg">
          {title}
        </CardTitle>
        {delta && (
          <div className={cn("flex items-center gap-1 text-sm font-medium", getDeltaColor(delta.value))}>
            {getDeltaIcon(delta.value)}
            <span>{delta.label}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue()}
        </div>
      </CardContent>
    </Card>
  )
}
