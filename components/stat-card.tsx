import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  hint?: string
  glowColor?: "purple" | "violet" | "jade"
}

export function StatCard({ title, value, icon: Icon, hint, glowColor = "purple" }: StatCardProps) {
  const glowClass = glowColor === "violet" ? "glow-violet" : "glow-purple"

  return (
    <Card className={cn("glass h-full w-full min-w-0 border-border/50", glowClass)}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground sm:text-base">{title}</p>
            <p className="truncate text-3xl font-bold tabular-nums text-foreground sm:text-4xl">{value}</p>
            {hint ? <p className="text-sm font-semibold text-accent">{hint}</p> : null}
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-14 sm:w-14">
            <Icon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
