"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  BookmarkCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Filter,
  FolderOpen,
  LayoutTemplate,
  Link2,
  Loader2,
  Play,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import { saveHighTicketArticleToPage } from "@/app/actions/high-ticket-article"
import {
  listHighTicketArticleUsage,
  toggleHighTicketArticleUsage,
} from "@/app/actions/high-ticket-article-usage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isValidAffiliateUrl } from "@/lib/affiliate-url"
import { type DfyPageKit } from "@/lib/dfy-profit/page-kit"
import { wrapArticleWithTitle } from "@/lib/high-ticket-payouts/article-content"
import {
  ARTICLE_CATALOG,
  HIGH_TICKET_ARTICLE_TARGET_COUNT,
  HIGH_TICKET_NICHES,
  weaveAffiliateLink,
  type HighTicketArticle,
} from "@/lib/high-ticket-payouts/catalog"
import { replaceFeaturedImageUrl } from "@/lib/high-ticket-payouts/niche-images"
import { type ProfitPageOption } from "@/lib/profit-pages/page-options"
import { sanitizeArticleHtml } from "@/lib/sanitize-html"
import { vimeoPlayerUrl } from "@/lib/training-videos"
import { cn } from "@/lib/utils"

const CrossPlatformGuide = dynamic(() =>
  import("@/components/cross-platform-guide").then((mod) => mod.CrossPlatformGuide),
)

const PAGE_SIZE = 24
const PAGE_STORAGE_KEY = "fmc_high_ticket_page_id"
const TRAINING_VIMEO_ID = "1226546591"

const BENEFITS = [
  "100 long-form articles",
  "9 high-ticket niches",
  "Page link woven into every CTA",
  "Copy text or HTML",
] as const

const STEPS = [
  {
    num: "1",
    title: "Pick a page",
    desc: "Choose one of your profit pages. We weave its public URL into every article CTA.",
  },
  {
    num: "2",
    title: "Preview an article",
    desc: "Filter by niche, search the library, and open any of the long-form templates.",
  },
  {
    num: "3",
    title: "Publish anywhere",
    desc: "Copy plain text for Medium or LinkedIn, or HTML for your blog. Saved articles land on that page.",
  },
] as const

type UsageFilter = "all" | "unused" | "used"

const NICHE_COUNTS = new Map<string, number>()
for (const article of ARTICLE_CATALOG) {
  NICHE_COUNTS.set(article.niche, (NICHE_COUNTS.get(article.niche) ?? 0) + 1)
}

function formatAngle(angle: string): string {
  return angle
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function readingMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 220))
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim()
}

export function HighTicketPayoutsContent({
  initialPages = [],
  initialError = "",
}: {
  initialPages?: ProfitPageOption[]
  initialError?: string
}) {
  const [pages, setPages] = useState<ProfitPageOption[]>(initialPages)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(initialPages[0]?.id ?? null)
  const [niche, setNiche] = useState("all")
  const [query, setQuery] = useState("")
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("all")
  const [previewId, setPreviewId] = useState<number | null>(null)
  const [articleHtml, setArticleHtml] = useState<Record<number, string>>({})
  const [featuredImageByArticle, setFeaturedImageByArticle] = useState<Record<number, string>>({})
  const [loadingAction, setLoadingAction] = useState<{
    articleId: number
    action: "view" | "copy"
  } | null>(null)
  const [copiedMode, setCopiedMode] = useState<"text" | "html" | null>(null)
  const [copiedArticleId, setCopiedArticleId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [error, setError] = useState(initialError)
  const [usedArticleIds, setUsedArticleIds] = useState<Set<number>>(new Set())
  const [usageLoading, setUsageLoading] = useState(false)
  const [togglingUsageId, setTogglingUsageId] = useState<number | null>(null)
  const [usageError, setUsageError] = useState("")
  const [saveNotice, setSaveNotice] = useState("")
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const selectedPage = pages.find((item) => item.id === selectedPageId) ?? null
  const hasPage = Boolean(selectedPage)
  const affiliateLink = selectedPage?.affiliateLink?.trim() ?? ""
  const hasAffiliateLink = isValidAffiliateUrl(affiliateLink)
  const canPersonalize = hasPage && hasAffiliateLink
  const savedCatalogIds = useMemo(() => {
    const ids = new Set<number>()
    for (const article of selectedPage?.kit?.articles ?? []) {
      if (article.source === "high_ticket" && typeof article.catalogId === "number") {
        ids.add(article.catalogId)
      } else if (article.id.startsWith("ht-")) {
        const n = Number(article.id.slice(3))
        if (Number.isFinite(n)) ids.add(n)
      }
    }
    return ids
  }, [selectedPage])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PAGE_STORAGE_KEY)
      if (saved && pages.some((item) => item.id === saved)) {
        setSelectedPageId(saved)
      }
    } catch {
      /* ignore */
    }
    // Only restore once on mount against the initial pages list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      if (selectedPageId) localStorage.setItem(PAGE_STORAGE_KEY, selectedPageId)
      else localStorage.removeItem(PAGE_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [selectedPageId])

  useEffect(() => {
    let cancelled = false

    async function loadUsage() {
      if (!selectedPageId) {
        setUsedArticleIds(new Set())
        setUsageError("")
        return
      }

      setUsageLoading(true)
      setUsageError("")
      const result = await listHighTicketArticleUsage({ pageId: selectedPageId })
      if (cancelled) return

      if (!result.success) {
        setUsedArticleIds(new Set())
        setUsageError(result.error)
        setUsageLoading(false)
        return
      }

      setUsedArticleIds(new Set(result.articleIds))
      setUsageLoading(false)
    }

    void loadUsage()
    return () => {
      cancelled = true
    }
  }, [selectedPageId])

  const applyKit = (pageId: string, kit: DfyPageKit) => {
    setPages((prev) => prev.map((item) => (item.id === pageId ? { ...item, kit } : item)))
  }

  const persistArticleToPage = async (articleId: number, featuredImageUrl?: string | null) => {
    if (!selectedPageId) return
    const result = await saveHighTicketArticleToPage({
      pageId: selectedPageId,
      articleId,
      featuredImageUrl: featuredImageUrl ?? featuredImageByArticle[articleId] ?? null,
    })
    if (!result.success) {
      setUsageError(result.error)
      return
    }
    applyKit(selectedPageId, result.kit)
    const title = selectedPage?.title ?? "your page"
    setSaveNotice(`Saved to “${title}”`)
    setTimeout(() => setSaveNotice(""), 4000)
  }

  const filteredArticles = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return ARTICLE_CATALOG.filter((article) => {
      if (niche !== "all" && article.niche !== niche) return false
      if (usageFilter === "used" && !usedArticleIds.has(article.id)) return false
      if (usageFilter === "unused" && usedArticleIds.has(article.id)) return false
      if (!needle) return true
      return `${article.title} ${article.excerpt} ${article.niche} ${formatAngle(article.angle)}`
        .toLowerCase()
        .includes(needle)
    })
  }, [niche, query, usageFilter, usedArticleIds])

  useEffect(() => {
    setPage(0)
    setPreviewId(null)
  }, [niche])

  useEffect(() => {
    setPage(0)
  }, [query, usageFilter])

  const pageCount = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE))
  const safePage = Math.min(page, Math.max(0, pageCount - 1))
  const paged = useMemo(
    () => filteredArticles.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [filteredArticles, safePage],
  )

  const previewArticle =
    previewId != null ? (ARTICLE_CATALOG.find((article) => article.id === previewId) ?? null) : null

  useEffect(() => {
    if (!previewArticle || !articleHtml[previewArticle.id]) return
    const timer = setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
    return () => clearTimeout(timer)
  }, [articleHtml, previewArticle])

  const personalizeArticle = async (
    article: HighTicketArticle,
    action: "view" | "copy",
  ): Promise<{ html: string; featuredImageUrl: string | null } | null> => {
    if (!selectedPage) {
      setError("Pick one of your pages first.")
      return null
    }
    if (!hasAffiliateLink) {
      setError("This page has no affiliate link. Edit the page or rebuild it with a valid https:// offer URL.")
      return null
    }

    if (articleHtml[article.id]) {
      setError("")
      return {
        html: articleHtml[article.id],
        featuredImageUrl: featuredImageByArticle[article.id] ?? null,
      }
    }

    setLoadingAction({ articleId: article.id, action })
    setError("")

    await new Promise((resolve) => setTimeout(resolve, 1800))

    let woven = weaveAffiliateLink(article.html, affiliateLink)
    let featuredImageUrl: string | null = null

    try {
      const res = await fetch("/api/premium/high-ticket-payouts/featured-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: article.niche, title: article.title }),
      })
      if (res.ok) {
        const data = (await res.json()) as { url?: string }
        if (typeof data.url === "string" && data.url.trim()) {
          featuredImageUrl = data.url.trim()
          woven = replaceFeaturedImageUrl(woven, featuredImageUrl)
          setFeaturedImageByArticle((prev) => ({ ...prev, [article.id]: featuredImageUrl! }))
        }
      }
    } catch {
      // Keep the niche-keyworded fallback already embedded in the catalog HTML.
    }

    setArticleHtml((prev) => ({ ...prev, [article.id]: woven }))
    setLoadingAction(null)
    return { html: woven, featuredImageUrl }
  }

  const openPreview = async (articleId: number) => {
    if (previewId === articleId) {
      setPreviewId(null)
      return
    }
    const article = ARTICLE_CATALOG.find((item) => item.id === articleId)
    if (!article) return
    const result = await personalizeArticle(article, "view")
    if (result) setPreviewId(articleId)
  }

  const copyArticleFromCard = async (articleId: number) => {
    const article = ARTICLE_CATALOG.find((item) => item.id === articleId)
    if (!article) return
    const result = await personalizeArticle(article, "copy")
    if (!result) return

    const exportHtml = sanitizeArticleHtml(wrapArticleWithTitle(article.title, result.html))
    const payload = `${article.title}\n\n${htmlToPlainText(exportHtml)}`
    await navigator.clipboard.writeText(payload)
    setCopiedArticleId(articleId)
    setTimeout(() => setCopiedArticleId(null), 2000)
    void persistArticleToPage(articleId, result.featuredImageUrl)
  }

  const copyArticle = async (mode: "text" | "html") => {
    if (previewId == null) return
    const html = articleHtml[previewId]
    const article = ARTICLE_CATALOG.find((item) => item.id === previewId)
    if (!html || !article) return

    const exportHtml = sanitizeArticleHtml(wrapArticleWithTitle(article.title, html))
    const payload = mode === "html" ? exportHtml : `${article.title}\n\n${htmlToPlainText(exportHtml)}`

    await navigator.clipboard.writeText(payload)
    setCopiedMode(mode)
    setTimeout(() => setCopiedMode(null), 2000)
    void persistArticleToPage(previewId, featuredImageByArticle[previewId] ?? null)
  }

  const toggleUsed = async (articleId: number) => {
    if (!selectedPageId) {
      setUsageError("Pick one of your pages first.")
      return
    }

    const wasUsed = usedArticleIds.has(articleId)
    setUsageError("")
    setTogglingUsageId(articleId)
    setUsedArticleIds((prev) => {
      const next = new Set(prev)
      if (wasUsed) next.delete(articleId)
      else next.add(articleId)
      return next
    })

    const result = await toggleHighTicketArticleUsage({
      articleId,
      pageId: selectedPageId,
    })

    setTogglingUsageId(null)

    if (!result.success) {
      setUsedArticleIds((prev) => {
        const next = new Set(prev)
        if (wasUsed) next.add(articleId)
        else next.delete(articleId)
        return next
      })
      setUsageError(result.error)
      return
    }

    setUsedArticleIds((prev) => {
      const next = new Set(prev)
      if (result.used) next.add(articleId)
      else next.delete(articleId)
      return next
    })

    if (result.used) {
      void persistArticleToPage(articleId)
    }
  }

  useEffect(() => {
    setArticleHtml({})
    setFeaturedImageByArticle({})
    setPreviewId(null)
    setSaveNotice("")
  }, [selectedPageId])

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Button asChild variant="ghost" className="border border-primary/60 text-primary hover:border-primary hover:bg-primary/10 hover:text-accent">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="space-y-8">
        <div className="space-y-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-secondary/10 p-8 text-center md:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/40">
            <BookOpen className="h-12 w-12 text-primary-foreground" />
          </div>
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-primary">Premium</p>
            <h1 className="mb-4 text-4xl font-black tracking-tight text-foreground lg:text-6xl">
              Guaranteed High-Ticket Payouts
            </h1>
            <p className="mb-4 text-xl font-bold text-accent md:text-2xl">
              {HIGH_TICKET_ARTICLE_TARGET_COUNT} authority articles ready to publish
            </p>
            <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-muted-foreground md:text-xl">
              Pick one of your profit pages, preview a long-form article with that page&apos;s link in the CTA, then copy
              it for Medium, LinkedIn, Quora, or your blog.
            </p>
          </div>
          <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
            {BENEFITS.map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-foreground"
              >
                <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
                {benefit}
              </span>
            ))}
          </div>
          <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3 pt-2">
            {[
              { label: "Articles", value: String(HIGH_TICKET_ARTICLE_TARGET_COUNT) },
              { label: "Niches", value: String(HIGH_TICKET_NICHES.length) },
              {
                label: "Used",
                value: hasPage ? String(usedArticleIds.size) : "—",
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-primary/20 bg-background/60 px-3 py-3">
                <p className="text-2xl font-black tabular-nums text-foreground">{stat.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <Card highlighted className="overflow-hidden border-primary/20 glass-strong">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
              <div className="relative aspect-video bg-black">
                {!isVideoPlaying ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                    <iframe
                      src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { background: true })}
                      title="Guaranteed High-Ticket Payouts preview"
                      allow="autoplay; fullscreen; picture-in-picture"
                      className="pointer-events-none absolute inset-0 h-full w-full border-0"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <Button
                      size="lg"
                      onClick={() => setIsVideoPlaying(true)}
                      className="relative z-10 h-24 w-24 rounded-full border-4 border-primary/40 text-primary-foreground shadow-[0_0_24px_rgba(207,161,59,0.45)] transition-all duration-300 hover:scale-110"
                    >
                      <Play className="ml-1 h-12 w-12 fill-white" />
                    </Button>
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <p className="text-xl font-black text-white drop-shadow-lg">Watch High-Ticket Tutorial</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { autoplay: true })}
                    title="Guaranteed High-Ticket Payouts Training"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center space-y-4 bg-primary/5 p-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <span className="text-sm font-black uppercase tracking-wider text-primary">Watch First</span>
                </div>
                <h2 className="text-3xl font-black text-foreground">How to Use High-Ticket Payouts</h2>
                <p className="text-lg font-semibold leading-relaxed text-muted-foreground">
                  Pick a template, preview it with your page link inside, then copy plain text or HTML and publish.
                </p>
                <ul className="space-y-2">
                  {["One article a week is enough", "Same link works on every platform", "Mark used so you do not repeat"].map(
                    (item) => (
                      <li key={item} className="flex items-start gap-2 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 glass-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-black text-foreground">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              Three steps to publish
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.num} className="rounded-xl border border-primary/25 bg-primary/10 p-6">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-black text-primary-foreground">
                    {step.num}
                  </div>
                  <h3 className="mb-3 text-2xl font-black text-foreground">{step.title}</h3>
                  <p className="text-lg font-semibold leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card highlighted className="border-primary/30 glass-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
              <Link2 className="h-7 w-7 text-primary" />
              Choose a profit page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="high-ticket-page" className="text-base font-bold text-foreground">
                  Your page
                </Label>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-9 border-primary/30 bg-transparent text-accent hover:bg-primary/15"
                >
                  <Link href="/create">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Build a new page
                  </Link>
                </Button>
              </div>

              {pages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-10 text-center">
                  <LayoutTemplate className="mx-auto h-8 w-8 text-primary" aria-hidden />
                  <p className="mt-3 text-base font-bold text-foreground">You don’t have any pages yet</p>
                  <p className="mx-auto mt-1 max-w-md text-sm font-semibold text-muted-foreground">
                    High-Ticket Payouts weaves a link to a page you already own. Build one first, then come back here.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Button asChild className="h-11">
                      <Link href="/create">Build your first page</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 border-primary/30 bg-transparent text-accent hover:bg-primary/15"
                    >
                      <Link href="/upgrades/dfy-profit">Use Done-For-You Profit</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Select
                    value={selectedPageId ?? undefined}
                    onValueChange={(value) => {
                      setSelectedPageId(value)
                      setError("")
                      setUsageError("")
                    }}
                  >
                    <SelectTrigger
                      id="high-ticket-page"
                      aria-label="Choose a page"
                      className="h-14 border-primary/30 bg-background text-base font-semibold"
                    >
                      <SelectValue placeholder="Select one of your pages…" />
                    </SelectTrigger>
                    <SelectContent>
                      {pages.map((item) => {
                        const articleCount = item.kit?.articles.length ?? 0
                        return (
                          <SelectItem key={item.id} value={item.id} textValue={item.title}>
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-lg">
                                {item.nicheIcon || <LayoutTemplate className="h-4 w-4 text-primary" aria-hidden />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold text-foreground">{item.title}</span>
                                <span className="block truncate text-xs font-semibold text-muted-foreground">
                                  {item.nicheName || "General"}
                                  {item.offerTitle ? ` · ${item.offerTitle}` : ""}
                                  {` · ${articleCount} saved article${articleCount === 1 ? "" : "s"}`}
                                  {item.status !== "active" ? ` · ${item.status}` : ""}
                                </span>
                              </span>
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  {selectedPage ? (
                    <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
                      {hasAffiliateLink ? (
                        <p
                          role="status"
                          className="flex items-start gap-2 text-sm font-semibold text-accent"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                          Page ready — article CTAs will open this page&apos;s affiliate link.
                        </p>
                      ) : (
                        <p
                          role="alert"
                          className="flex items-start gap-2 text-sm font-semibold text-red-300"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                          This page has no affiliate link, so CTAs can&apos;t be woven yet.
                        </p>
                      )}
                      <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-background/40 px-3 py-2.5 sm:flex-row sm:items-center">
                        <span className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                          Affiliate link in every article
                        </span>
                        <span className="min-w-0 flex-1 break-all font-mono text-xs font-semibold text-foreground">
                          {hasAffiliateLink ? affiliateLink : "No affiliate link on this page"}
                        </span>
                        {hasAffiliateLink ? (
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 shrink-0 px-2 text-accent hover:bg-primary/15"
                          >
                            <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                              Open
                            </a>
                          </Button>
                        ) : (
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 shrink-0 px-2 text-accent hover:bg-primary/15"
                          >
                            <Link href={`/pages/${selectedPage.id}`}>Open page</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Pick a page to unlock View, Copy, and Use this template.</p>
                  )}
                </>
              )}
            </div>

            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <Filter className="h-3.5 w-3.5" aria-hidden />
                Filter by niche
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by niche">
                {(
                  [
                    { id: "all", label: "All niches", count: ARTICLE_CATALOG.length },
                    ...HIGH_TICKET_NICHES.map((item) => ({
                      id: item,
                      label: item,
                      count: NICHE_COUNTS.get(item) ?? 0,
                    })),
                  ] as const
                ).map((item) => {
                  const selected = niche === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNiche(item.id)}
                      aria-pressed={selected}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        selected
                          ? "border-primary bg-primary text-primary-foreground shadow-[0_6px_18px_rgba(207,161,59,0.28)]"
                          : "border-border bg-white/[0.03] text-foreground hover:border-primary/40 hover:bg-primary/10",
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums leading-none",
                          selected ? "bg-black/15 text-primary-foreground" : "bg-primary/15 text-accent",
                        )}
                      >
                        {item.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
                {error}
              </p>
            ) : null}

            {saveNotice && selectedPage ? (
              <p
                role="status"
                className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-accent"
              >
                <FolderOpen className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1">{saveNotice}</span>
                <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-accent hover:bg-primary/15">
                  <Link href={`/pages/${selectedPage.id}`}>Open page details</Link>
                </Button>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <CrossPlatformGuide />

        {loadingAction ? (
          <Card className="border-primary/30">
            <CardContent className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">Personalizing article with your page link...</p>
                <p className="text-sm text-muted-foreground">This usually takes a few seconds.</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <AnimatePresence>
          {previewArticle && articleHtml[previewArticle.id] ? (
            <motion.section
              ref={previewRef}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="scroll-mt-24 overflow-hidden rounded-2xl border border-primary/30 glass-strong"
            >
              <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-primary to-accent px-5 py-4 text-primary-foreground md:px-6">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold uppercase tracking-[0.12em]">{previewArticle.niche}</p>
                  <h2 className="mt-1 text-lg font-black leading-snug">{previewArticle.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-full bg-black/15 px-2.5 py-0.5 text-xs font-bold">
                      {formatAngle(previewArticle.angle)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/15 px-2.5 py-0.5 text-xs font-bold">
                      <Clock size={12} aria-hidden />
                      {readingMinutes(previewArticle.wordCount)} min read
                    </span>
                    {savedCatalogIds.has(previewArticle.id) ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/15 px-2.5 py-0.5 text-xs font-bold">
                        <FolderOpen size={12} aria-hidden />
                        Saved
                      </span>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewId(null)}
                  className="rounded-lg p-2 transition-colors hover:bg-black/10"
                  aria-label="Close preview"
                >
                  <X size={16} />
                </button>
              </div>
              <div
                className="ht-preview article-body max-h-[min(70vh,720px)] max-w-none overflow-y-auto px-5 py-6 md:px-8 md:py-8"
                onClick={(event) => {
                  const target = event.target as HTMLElement | null
                  const anchor = target?.closest?.("a[href^='#']") as HTMLAnchorElement | null
                  if (!anchor) return
                  const id = decodeURIComponent(anchor.getAttribute("href")?.slice(1) ?? "")
                  if (!id) return
                  const heading = event.currentTarget.querySelector(`#${CSS.escape(id)}`)
                  if (!heading) return
                  event.preventDefault()
                  heading.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
                dangerouslySetInnerHTML={{
                  __html: sanitizeArticleHtml(
                    wrapArticleWithTitle(previewArticle.title, articleHtml[previewArticle.id]),
                  ),
                }}
              />
              <div className="flex flex-wrap gap-2 border-t border-border px-5 py-4 md:px-6">
                <Button type="button" variant="outline" onClick={() => void copyArticle("text")}>
                  {copiedMode === "text" ? <Check size={16} /> : <Copy size={16} />}
                  {copiedMode === "text" ? "Copied" : "Copy plain text"}
                </Button>
                <Button type="button" onClick={() => void copyArticle("html")}>
                  {copiedMode === "html" ? <Check size={16} /> : <Copy size={16} />}
                  {copiedMode === "html" ? "Copied" : "Copy HTML"}
                </Button>
                <Button
                  type="button"
                  variant={usedArticleIds.has(previewArticle.id) ? "default" : "outline"}
                  disabled={!canPersonalize || togglingUsageId === previewArticle.id || usageLoading}
                  onClick={() => void toggleUsed(previewArticle.id)}
                >
                  {togglingUsageId === previewArticle.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <BookmarkCheck size={16} />
                  )}
                  {usedArticleIds.has(previewArticle.id) ? "Template used" : "Use this template"}
                </Button>
              </div>
              {usageError ? (
                <p role="alert" className="border-t border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-300 md:px-6">
                  {usageError}
                </p>
              ) : null}
            </motion.section>
          ) : null}
        </AnimatePresence>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Library</p>
              <h2 className="mt-1 text-2xl font-black text-foreground">Authority articles</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Search, filter unused articles, then view or copy with your page link inside.
              </p>
            </div>
            <p className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground">
              {`${filteredArticles.length} article${filteredArticles.length === 1 ? "" : "s"}${niche !== "all" ? ` in ${niche}` : ""}`}
            </p>
          </div>

          {hasPage ? (
            <div className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
                <span>Published for this link</span>
                <span className="tabular-nums">
                  {usedArticleIds.size} of {HIGH_TICKET_ARTICLE_TARGET_COUNT}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/70" aria-hidden>
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{
                    width: `${Math.min(100, (usedArticleIds.size / HIGH_TICKET_ARTICLE_TARGET_COUNT) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, niches, or angles"
                aria-label="Search articles"
                className="h-12 pl-10 text-base"
              />
            </div>
            <div className="flex shrink-0 rounded-xl border border-border bg-card p-1" role="group" aria-label="Filter by usage">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "unused", label: "Unused" },
                  { id: "used", label: "Used" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={usageFilter === item.id}
                  onClick={() => setUsageFilter(item.id)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    usageFilter === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {paged.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-primary" aria-hidden />
              <p className="mt-3 text-base font-bold text-foreground">No articles match</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {usageFilter !== "all" && !hasPage
                  ? "Pick a page first so used articles can be tracked."
                  : "Try another niche, clear the search, or switch back to All."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setQuery("")
                  setUsageFilter("all")
                  setNiche("all")
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((article) => {
              const isUsed = usedArticleIds.has(article.id)
              const isSaved = savedCatalogIds.has(article.id)
              return (
              <article
                key={article.id}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-5 transition-colors",
                  previewId === article.id
                    ? "border-primary bg-primary/10"
                    : isUsed
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:border-primary/40",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                      {article.niche}
                    </span>
                    <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                      {formatAngle(article.angle)}
                    </span>
                    {isUsed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                        <BookmarkCheck className="h-3 w-3" aria-hidden />
                        Used
                      </span>
                    ) : null}
                    {isSaved ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        <FolderOpen className="h-3 w-3" aria-hidden />
                        Saved
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-foreground">{article.title}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {readingMinutes(article.wordCount)} min read
                  </p>
                  {article.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
                  ) : null}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loadingAction?.articleId === article.id || !canPersonalize}
                    onClick={() => void openPreview(article.id)}
                    className="flex-1"
                  >
                    {loadingAction?.articleId === article.id && loadingAction.action === "view" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Eye size={14} />
                    )}
                    {previewId === article.id ? "Close" : "View"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={loadingAction?.articleId === article.id || !canPersonalize}
                    onClick={() => void copyArticleFromCard(article.id)}
                    className="flex-1"
                  >
                    {loadingAction?.articleId === article.id && loadingAction.action === "copy" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : copiedArticleId === article.id ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copiedArticleId === article.id ? "Copied" : "Copy"}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant={isUsed ? "default" : "outline"}
                  size="sm"
                  disabled={!canPersonalize || togglingUsageId === article.id || usageLoading}
                  onClick={() => void toggleUsed(article.id)}
                  className="mt-2 w-full"
                >
                  {togglingUsageId === article.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <BookmarkCheck size={14} />
                  )}
                  {isUsed ? "Template used" : "Use this template"}
                </Button>
              </article>
              )
            })}
          </div>
          )}

          {pageCount > 1 && paged.length > 0 ? (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button type="button" variant="outline" disabled={safePage === 0} onClick={() => setPage(Math.max(0, safePage - 1))}>
                <ChevronLeft size={14} />
                Prev
              </Button>
              <span className="text-sm font-semibold text-foreground">
                Page {safePage + 1} of {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
