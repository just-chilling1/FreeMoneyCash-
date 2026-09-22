import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function KitSection({
  title,
  count,
  defaultOpen = true,
  tone = "neutral",
  children,
}: {
  title: string
  count?: number
  defaultOpen?: boolean
  tone?: "neutral" | "page" | "social"
  children: ReactNode
}) {
  const toneClass = {
    neutral: "border-border",
    page: "border-primary/40",
    social: "border-primary/40",
  }[tone]
  const headerClass = {
    neutral: "bg-muted",
    page: "bg-primary/15",
    social: "bg-primary/15",
  }[tone]

  return (
    <details
      open={defaultOpen}
      className={cn("group overflow-hidden rounded-2xl border-2 bg-card shadow-lg", toneClass)}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-3 border-b-2 border-transparent px-4 py-3.5 transition-colors hover:bg-muted group-open:border-border [&::-webkit-details-marker]:hidden",
          headerClass,
        )}
      >
        <ChevronDown className="h-4 w-4 shrink-0 text-foreground transition-transform group-open:rotate-180" />
        <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">{title}</span>
        {count !== undefined && (
          <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-[13px] font-medium tabular-nums text-primary-foreground">
            {count}
          </span>
        )}
      </summary>
      <div className="space-y-3 bg-background p-3 sm:p-4">{children}</div>
    </details>
  )
}
