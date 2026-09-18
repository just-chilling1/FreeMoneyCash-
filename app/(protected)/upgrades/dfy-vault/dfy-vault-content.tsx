"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  FileText,
  Play,
  Search,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AFFILIATE_LINK_TOKEN,
  insertAffiliateLink,
  UNLIMITED_ARTICLES,
  UNLIMITED_NICHES,
  UNLIMITED_PAGE_COUNT,
  type UnlimitedArticle,
} from "@/lib/unlimited/catalog"
import { vimeoPlayerUrl } from "@/lib/training-videos"
import { cn } from "@/lib/utils"
import { createPageFromTemplate } from "./actions"

const PAGE_SIZE = 12

const TRAINING = {
  vimeoId: "1134298182",
  kicker: "Quick start",
  title: "How to use Unlimited",
  description: "Watch the short walkthrough, preview a page, then publish it with your affiliate link.",
} as const

const NICHE_COUNTS = new Map<string, number>()
for (const article of UNLIMITED_ARTICLES) {
  NICHE_COUNTS.set(article.niche, (NICHE_COUNTS.get(article.niche) ?? 0) + 1)
}

function TrainingCard({
  playing,
  onPlay,
}: {
  playing: boolean
  onPlay: () => void
}) {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardContent className="grid grid-cols-1 gap-0 p-0 md:grid-cols-2">
        <div className="relative aspect-video bg-background">
          {playing ? (
            <iframe
              src={vimeoPlayerUrl(TRAINING.vimeoId, { autoplay: true })}
              title={TRAINING.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-background">
              <iframe
                src={vimeoPlayerUrl(TRAINING.vimeoId, { background: true })}
                title={`${TRAINING.title} preview`}
                tabIndex={-1}
                className="pointer-events-none absolute inset-0 h-full w-full border-0 opacity-40"
              />
              <button
                type="button"
                onClick={onPlay}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                  <Play className="ml-0.5 h-6 w-6 fill-current" />
                </span>
                <span className="text-sm font-semibold text-foreground">Play</span>
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-2 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{TRAINING.kicker}</p>
          <h2 className="text-xl font-bold leading-snug text-foreground sm:text-2xl">{TRAINING.title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{TRAINING.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function NicheMenu({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const options = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    const items = [
      { id: "all", label: "All niches", count: UNLIMITED_PAGE_COUNT },
      ...UNLIMITED_NICHES.map((item) => ({
        id: item,
        label: item,
        count: NICHE_COUNTS.get(item) ?? 0,
      })),
    ]
    if (!needle) return items
    return items.filter((item) => item.label.toLowerCase().includes(needle))
  }, [filter])

  const selectedLabel = value === "all" ? "All niches" : value

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filter by niche"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-primary/40 bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-primary transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute top-full right-0 z-30 mt-2 w-full overflow-hidden rounded-xl border border-primary/30 bg-card shadow-xl sm:w-72">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="Find a niche"
                className="h-9 pl-8 text-sm"
                aria-label="Find a niche"
                autoFocus
              />
            </div>
          </div>
          <ul role="listbox" aria-label="Niches" className="max-h-64 overflow-y-auto p-1.5">
            {options.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">No niches match that search.</li>
            ) : (
              options.map((item) => {
                const selected = value === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onChange(item.id)
                        setOpen(false)
                        setFilter("")
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        selected
                          ? "bg-primary font-semibold text-primary-foreground"
                          : "text-foreground hover:bg-primary/10",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Check className={cn("h-3.5 w-3.5 shrink-0", selected ? "opacity-100" : "opacity-0")} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                          selected ? "bg-black/15 text-primary-foreground" : "bg-primary/15 text-accent",
                        )}
                      >
                        {item.count}
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function ArticlePreview({ article }: { article: UnlimitedArticle }) {
  const blocks = article.content.split(AFFILIATE_LINK_TOKEN)

  return (
    <article className="rounded-xl border border-border bg-background p-4 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{article.niche}</p>
      <h3 className="mt-2 text-xl font-bold leading-snug text-foreground sm:text-2xl">{article.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        By {article.author} · about ${article.earnings}/day
      </p>
      <div className="mt-5 space-y-4 text-sm leading-relaxed text-foreground sm:text-base">
        {blocks.map((block, index) => (
          <div key={index} className="space-y-4">
            {block
              .split(/\n{2,}/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            {index < blocks.length - 1 ? (
              <p className="rounded-lg border border-dashed border-primary/50 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                Your affiliate link will appear here
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  )
}

export function DFYVaultContent() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [niche, setNiche] = useState("all")
  const [page, setPage] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [previewArticle, setPreviewArticle] = useState<UnlimitedArticle | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<UnlimitedArticle | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [affiliateLink, setAffiliateLink] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return UNLIMITED_ARTICLES.filter((article) => {
      if (niche !== "all" && article.niche !== niche) return false
      if (!needle) return true
      return [article.title, article.niche, article.author, article.bestFor].join(" ").toLowerCase().includes(needle)
    })
  }, [niche, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const openUse = (article: UnlimitedArticle) => {
    setPreviewArticle(null)
    setSelectedArticle(article)
    setAffiliateLink("")
    setCreateError("")
    setShowLinkModal(true)
  }

  const handleCreatePage = async () => {
    if (!selectedArticle || !affiliateLink.trim()) return

    setIsCreating(true)
    setCreateError("")
    try {
      const result = await createPageFromTemplate({
        title: selectedArticle.title,
        content: insertAffiliateLink(selectedArticle.content, affiliateLink),
        affiliateLink: affiliateLink.trim(),
      })

      if (result.success) {
        setShowLinkModal(false)
        setSelectedArticle(null)
        setAffiliateLink("")
        router.push("/pages")
        return
      }

      setCreateError(result.error ?? "Could not create the page.")
    } catch {
      setCreateError("Could not create the page. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <Button asChild variant="ghost" className="border border-primary/40 text-primary hover:bg-primary/10">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <section className="rounded-2xl border border-border bg-card px-5 py-8 text-center sm:px-8 sm:py-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Crown className="h-7 w-7" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">Premium</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Unlimited</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {UNLIMITED_PAGE_COUNT} done-for-you pages across {UNLIMITED_NICHES.length} niches. View any page first, then
          publish it with your affiliate link.
        </p>
        <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Pages", value: String(UNLIMITED_PAGE_COUNT) },
            { label: "Niches", value: String(UNLIMITED_NICHES.length) },
            { label: "Showing", value: String(filtered.length) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-background px-2 py-3">
              <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">{stat.value}</p>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <TrainingCard playing={isVideoPlaying} onPlay={() => setIsVideoPlaying(true)} />

      <Card className="border-border bg-card" style={{ overflow: "visible" }}>
        <CardHeader className="relative z-20 gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <FileText className="h-6 w-6 text-primary" />
              Page library
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              View a page before you use it. Using a page creates it in Your Pages with your link inserted.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(0)
                }}
                placeholder="Search titles, niches, or offers"
                className="h-10 pl-9 text-sm"
                aria-label="Search pages"
              />
            </div>
            <NicheMenu
              value={niche}
              onChange={(next) => {
                setNiche(next)
                setPage(0)
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              No pages match that search. Try another niche or clear the filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((article) => (
                <Card key={article.id} className="border-border bg-background">
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Badge variant="secondary" className="max-w-[70%] truncate font-medium">
                        {article.niche}
                      </Badge>
                      <span className="shrink-0 text-xs font-semibold text-primary">${article.earnings}/day</span>
                    </div>
                    <h3 className="line-clamp-3 text-base font-semibold leading-snug text-foreground">{article.title}</h3>
                    <p className="text-sm text-muted-foreground">By {article.author}</p>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      Best for {article.bestFor}
                    </p>
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 text-sm font-semibold"
                        onClick={() => setPreviewArticle(article)}
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        View
                      </Button>
                      <Button type="button" className="h-10 text-sm font-semibold" onClick={() => openUse(article)}>
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-sm text-muted-foreground">
              {filtered.length === 0
                ? "0 pages"
                : `${safePage * PAGE_SIZE + 1}–${Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
            </p>
            <div className="flex items-center gap-2 pr-16 lg:pr-0">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-16 text-center text-sm text-muted-foreground">
                {safePage + 1} / {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewArticle != null} onOpenChange={(open) => !open && setPreviewArticle(null)}>
        <DialogContent className="max-h-[min(90vh,820px)] overflow-y-auto border-border bg-card sm:max-w-2xl!">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Page preview</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              This is the page before your link is added. Use it when you are ready to publish.
            </DialogDescription>
          </DialogHeader>
          {previewArticle ? (
            <div className="space-y-4">
              <ArticlePreview article={previewArticle} />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setPreviewArticle(null)}>
                  Close
                </Button>
                <Button type="button" onClick={() => openUse(previewArticle)}>
                  Use this page
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="max-h-[min(90vh,760px)] overflow-y-auto border-border bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Add your affiliate link</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              We will create this page in Your Pages and replace the link placeholder with the URL you paste.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedArticle ? (
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-sm font-semibold text-foreground">{selectedArticle.title}</p>
                <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Best for {selectedArticle.bestFor}
                </p>
              </div>
            ) : null}

            <div className="space-y-2 rounded-lg border border-border bg-background p-3">
              <p className="text-sm font-semibold text-foreground">Where to get a link</p>
              <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
                <li>
                  Create a free account at{" "}
                  <a
                    href="https://www.digistore24.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Digistore24
                  </a>
                </li>
                <li>Choose a product that matches this page</li>
                <li>Copy your affiliate link and paste it below</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliate-link">Your affiliate link</Label>
              <Input
                id="affiliate-link"
                type="url"
                placeholder="https://example.com/your-affiliate-link"
                value={affiliateLink}
                onChange={(event) => setAffiliateLink(event.target.value)}
                className="h-10"
              />
            </div>

            {createError ? <p className="text-sm text-destructive">{createError}</p> : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                onClick={() => setShowLinkModal(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className={cn("sm:flex-1", !affiliateLink.trim() && "opacity-60")}
                onClick={handleCreatePage}
                disabled={!affiliateLink.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create my page"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-border bg-card">
        <CardContent className="space-y-3 p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">Need a hand?</h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Not sure which page fits your offer, or where to get an affiliate link? Support can walk you through it.
          </p>
          <Button asChild>
            <Link href="/support">Contact support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
