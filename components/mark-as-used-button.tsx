"use client"

import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MarkAsUsedButton({
  used,
  marking,
  onClick,
  disabled,
  className,
}: {
  used: boolean
  marking?: boolean
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={used || marking || disabled}
      onClick={onClick}
      className={cn(
        "h-10 w-full text-sm",
        used
          ? "border-green-500/40 bg-green-500/15 font-medium text-green-400"
          : "rounded-xl border-border bg-card font-medium text-foreground hover:border-primary hover:bg-primary/10",
        className,
      )}
    >
      {marking ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving…
        </>
      ) : used ? (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Marked as used
        </>
      ) : (
        "Mark as used"
      )}
    </Button>
  )
}

export function UsedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-500/40 bg-green-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green-400">
      <CheckCircle2 className="h-3 w-3" aria-hidden />
      Used
    </span>
  )
}
