"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Copy, ExternalLink, LayoutTemplate, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DetailSection } from "@/components/detail-section"
import { cn } from "@/lib/utils"

const outlineCtaClass =
  "rounded-xl border border-border bg-card font-medium text-foreground hover:border-primary hover:bg-primary/10"

const primaryCtaClass =
  "rounded-xl bg-primary font-medium text-primary-foreground shadow-md transition hover:bg-primary/90"

function LinkRow({
  icon,
  eyebrow,
  hint,
  url,
  copied,
  onCopy,
  primary,
}: {
  icon: React.ReactNode
  eyebrow: string
  hint: string
  url: string
  copied: boolean
  onCopy: () => void
  primary?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 transition-colors md:flex-row md:items-center",
        primary
          ? "border-primary/35 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent"
          : "border-border bg-card/60 hover:border-border",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            primary ? "border-primary/30 bg-primary/15 text-primary" : "border-border bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">{eyebrow}</p>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" aria-hidden />
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{hint}</p>
          </div>
          <p className="mt-1 break-all font-mono text-[13px] leading-relaxed text-foreground sm:text-sm">{url}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 md:pl-2">
        <Button
          type="button"
          onClick={onCopy}
          variant={primary ? "default" : "outline"}
          className={cn("h-10 px-4 text-sm", primary ? primaryCtaClass : outlineCtaClass)}
        >
          {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
          {copied ? "Copied" : "Copy URL"}
        </Button>
        <Button asChild variant="outline" className={cn("h-10 px-4 text-sm", outlineCtaClass)}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-4 w-4" />
            Open
          </a>
        </Button>
      </div>
    </div>
  )
}

export function PageLinksCard({
  pagePath,
  affiliateLink,
}: {
  pagePath: string
  affiliateLink: string
}) {
  const [origin, setOrigin] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const pageUrl = origin ? `${origin}${pagePath}` : pagePath

  const copyText = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <DetailSection
      tone="primary"
      icon={<Link2 className="h-5 w-5" aria-hidden />}
      title="Your links"
      description="Share the profit page link. Visitors who click through land on your affiliate offer."
    >
      <div className="space-y-3">
        <LinkRow
          primary
          icon={<LayoutTemplate className="h-[18px] w-[18px]" aria-hidden />}
          eyebrow="Your profit page"
          hint="Share this"
          url={pageUrl}
          copied={copiedId === "page"}
          onCopy={() => void copyText("page", pageUrl)}
        />
        {affiliateLink ? (
          <LinkRow
            icon={<ExternalLink className="h-[18px] w-[18px]" aria-hidden />}
            eyebrow="Affiliate link"
            hint="Promotional offer"
            url={affiliateLink}
            copied={copiedId === "affiliate"}
            onCopy={() => void copyText("affiliate", affiliateLink)}
          />
        ) : null}
      </div>
    </DetailSection>
  )
}
