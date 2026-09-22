import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type Tone = "primary" | "accent" | "neutral"

const ICON_TONE: Record<Tone, string> = {
  primary: "border-primary/30 bg-primary/15 text-primary",
  accent: "border-accent/30 bg-accent/15 text-accent",
  neutral: "border-border bg-muted text-muted-foreground",
}

/**
 * Consistent card shell for the page-details view. Renders a header with an
 * icon tile, title, description and optional count / action, then the body.
 * When `collapsible` is set it uses a native <details> so it works without JS.
 */
export function DetailSection({
  icon,
  title,
  description,
  count,
  action,
  tone = "neutral",
  collapsible = false,
  defaultOpen = true,
  className,
  bodyClassName,
  children,
}: {
  icon: ReactNode
  title: string
  description?: string
  count?: number
  action?: ReactNode
  tone?: Tone
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
  bodyClassName?: string
  children: ReactNode
}) {
  const header = (
    <>
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm",
          ICON_TONE[tone],
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold leading-tight text-foreground sm:text-lg">{title}</h2>
          {count !== undefined ? (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold tabular-nums text-primary-foreground">
              {count}
            </span>
          ) : null}
        </div>
        {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </>
  )

  const shell = cn("glass overflow-hidden rounded-2xl border border-border/50 shadow-lg", className)
  const body = cn("space-y-4 p-4 sm:p-6", bodyClassName)

  if (!collapsible) {
    return (
      <section className={shell}>
        <div className="flex items-start gap-4 border-b border-border/50 bg-background/30 px-4 py-4 sm:px-6">
          {header}
        </div>
        <div className={body}>{children}</div>
      </section>
    )
  }

  return (
    <details open={defaultOpen} className={cn("group", shell)}>
      <summary className="flex cursor-pointer list-none items-start gap-4 bg-background/30 px-4 py-4 transition-colors hover:bg-background/50 group-open:border-b group-open:border-border/50 sm:px-6 [&::-webkit-details-marker]:hidden">
        {header}
        <ChevronDown className="mt-3 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className={body}>{children}</div>
    </details>
  )
}
