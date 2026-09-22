import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Calendar, ChevronRight, Eye, FileText, MousePointerClick, Sparkles, Tag } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { PageActions } from "@/components/page-actions"
import { PageKitDetails } from "@/components/page-kit-details"
import { PageLinksCard } from "@/components/page-links-card"
import { parsePageKit } from "@/lib/dfy-profit/page-kit"
import { cn } from "@/lib/utils"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  active: { pill: "border-accent/40 bg-accent/15 text-accent", dot: "bg-accent" },
  paused: { pill: "border-amber-500/40 bg-amber-500/15 text-amber-400", dot: "bg-amber-400" },
  default: { pill: "border-destructive/40 bg-destructive/15 text-destructive", dot: "bg-destructive" },
}

function Chip({
  children,
  tone = "neutral",
  icon,
}: {
  children: React.ReactNode
  tone?: "neutral" | "primary"
  icon?: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        tone === "primary"
          ? "border-primary/40 bg-primary/15 font-bold uppercase tracking-wide text-primary"
          : "border-border/70 bg-background/40 text-muted-foreground",
      )}
    >
      {icon}
      {children}
    </span>
  )
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  accent: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", accent)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-xl font-bold leading-tight text-foreground sm:text-2xl">{value}</p>
      </div>
    </div>
  )
}

export default async function PageDetailsPage({ params }: PageProps) {
  const { id } = await params
  if (!UUID_RE.test(id)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: page } = await supabase
    .from("pages")
    .select(
      `
      *,
      niches (name, icon),
      offers (title)
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!page) notFound()

  const kit = parsePageKit((page as { kit?: unknown }).kit)
  const slug = typeof (page as { slug?: string | null }).slug === "string" ? (page as { slug: string }).slug : null
  const pagePath = `/article/${slug ?? page.id}`
  const nicheName: string = page.niches?.name || kit?.niche || ""
  const status: string = page.status ?? "active"
  const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.default
  const createdAt = new Date(page.created_at)
  const createdLong = createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  const offerTitle = page.offers?.title || kit?.productName || "Your offer"

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/pages"
          className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Your Pages
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60" aria-hidden />
        <span className="truncate font-medium text-foreground">{page.title}</span>
      </nav>

      {/* Hero header */}
      <section className="glass-strong relative overflow-hidden rounded-2xl border border-border/50">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-3xl shadow-[0_0_24px_rgba(207,161,59,0.18)]">
                {page.niches?.icon || <Sparkles className="h-7 w-7 text-primary" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  {kit ? "Done-For-You profit page" : "Profit page"}
                </p>
                <h1 className="mt-1.5 text-3xl font-bold leading-tight text-foreground lg:text-4xl">{page.title}</h1>
                <p className="mt-3 flex flex-wrap items-center gap-x-2 text-base text-muted-foreground">
                  <Tag className="h-4 w-4 text-primary/80" aria-hidden />
                  <span>Promoting</span>
                  <span className="font-semibold text-foreground">{offerTitle}</span>
                </p>
              </div>
            </div>

            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-bold",
                statusStyle.pill,
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", statusStyle.dot)} aria-hidden />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {kit ? <Chip tone="primary">Done-For-You kit</Chip> : null}
            {nicheName ? <Chip>{nicheName}</Chip> : null}
            {kit && kit.articles.length > 0 ? (
              <Chip icon={<FileText className="h-3.5 w-3.5" aria-hidden />}>
                {kit.articles.length} article{kit.articles.length === 1 ? "" : "s"}
              </Chip>
            ) : null}
            {kit && kit.posts.length > 0 ? (
              <Chip>
                {kit.posts.length} Facebook post{kit.posts.length === 1 ? "" : "s"}
              </Chip>
            ) : null}
          </div>

          {/* Stats strip */}
          <div className="mt-6 grid grid-cols-1 divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/50 bg-background/30 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Stat
              icon={<Eye className="h-5 w-5" aria-hidden />}
              label="Views"
              value={page.views || 0}
              accent="border-primary/30 bg-primary/10 text-primary"
            />
            <Stat
              icon={<MousePointerClick className="h-5 w-5" aria-hidden />}
              label="Clicks"
              value={page.clicks || 0}
              accent="border-secondary/40 bg-secondary/20 text-secondary-foreground"
            />
            <Stat
              icon={<Calendar className="h-5 w-5" aria-hidden />}
              label="Created"
              value={<span className="text-lg sm:text-xl">{createdLong}</span>}
              accent="border-accent/30 bg-accent/10 text-accent"
            />
          </div>

          <div className="mt-6 border-t border-border/50 pt-6">
            <PageActions
              pageId={page.id}
              pageTitle={page.title}
              status={status}
              affiliateLink={page.affiliate_link}
              afterDeleteHref="/pages"
            />
          </div>
        </div>
      </section>

      <PageLinksCard pagePath={pagePath} affiliateLink={page.affiliate_link ?? ""} />

      {kit ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4 px-1">
            <div>
              <h2 className="text-xl font-bold text-foreground">Your Done-For-You kit</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything generated for this page: the authority article and Facebook post variants.
              </p>
            </div>
          </div>
          <PageKitDetails pageId={page.id} kit={kit} />
        </section>
      ) : (
        <section className="glass flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border/70 p-6 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
            <FileText className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">No saved content for this page</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              This page was built with the page builder. Pages created through Done-For-You Profit also store an
              authority article and Facebook posts here.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
