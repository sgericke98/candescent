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
}

export function StatCard({ title, value, delta, className }: StatCardProps) {
  const getDeltaIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4" />
    if (value < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getDeltaColor = (value: number) => {
    if (value > 0) return "text-success"
    if (value < 0) return "text-danger"
    return "text-muted-fg"
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
          {typeof value === 'number' ? formatCurrency(value) : value}
        </div>
      </CardContent>
    </Card>
  )
}
