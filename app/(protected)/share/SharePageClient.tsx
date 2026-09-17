"use client"

import { useEffect, useRef, useState } from "react"
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Copy,
  QrCode,
  Code,
  TrendingUp,
  Sparkles,
  Share2,
  Check,
  FileText,
  Clock,
  Download,
  Zap,
  ChevronDown,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { cn } from "@/lib/utils"

type PageRow = {
  id: string
  title: string
  created_at: string
  views: number | null
  status: string
  user_id: string
}

type ReadyPost = {
  id: string
  label: string
  body: string
}

const PRO_TIPS = [
  {
    title: "Best Times to Post",
    body: "Facebook: 1–3 PM weekdays · Twitter: 12–1 PM & 5–6 PM · LinkedIn: 7–8 AM & 5–6 PM",
  },
  {
    title: "Use Hashtags Wisely",
    body: "2–3 relevant hashtags on Twitter, 3–5 on Instagram, 1–2 on LinkedIn for best engagement",
  },
  {
    title: "Add Value First",
    body: "Share helpful tips before promoting. Build trust with your audience",
  },
  {
    title: "Track Your Results",
    body: "Monitor which platforms drive the most clicks and focus your efforts there",
  },
] as const

function extractTopic(title: string) {
  const inMatch = title.match(/\bin\s+(.+)$/i)
  if (inMatch?.[1]) return inMatch[1].trim()

  const forMatch = title.match(/\bfor\s+(.+)$/i)
  if (forMatch?.[1]) return forMatch[1].trim()

  return title.trim()
}

function topicHashtag(topic: string) {
  const cleaned = topic.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "").slice(0, 24)
  return cleaned || "recommendation"
}

function pickVariant<T>(variants: T[], seed: number, salt: number) {
  return variants[Math.abs(seed + salt) % variants.length]
}

function buildReadyPosts(pageTitle: string, url: string, seed: number): ReadyPost[] {
  const topic = extractTopic(pageTitle)
  const tag = topicHashtag(topic)

  const curiosity = pickVariant(
    [
      `Most people researching ${topic} get stuck in the same loop: endless tips, conflicting advice, and zero clear next step.

I came across a guide that actually organizes the noise into something useful: "${pageTitle}".

What stood out:
• It explains the "why" behind common ${topic} mistakes
• It focuses on practical moves you can try right away
• It skips the hype and gets into what actually matters

If you've been curious about ${topic} but don't know where to start, this is a strong first read.

Full guide here:
${url}

#${tag} #learning #recommendation`,

      `Quick question: when was the last time a ${topic} article actually answered your questions instead of just adding more?

"${pageTitle}" does that unusually well. It walks through the core ideas clearly, calls out what beginners usually miss, and gives a realistic path forward.

I bookmarked it because it's the kind of resource you can come back to — not just another skim-and-forget post.

Worth opening if ${topic} is on your radar:
${url}

#${tag} #insights #mustread`,

      `There's a lot of surface-level content about ${topic} online. This one goes deeper without becoming overwhelming.

"${pageTitle}" covers:
1) What most people get wrong at the start
2) How to think about progress more realistically
3) Simple actions that compound over time

If you want something informative (not just motivational), read it here:
${url}

#${tag} #education #growth`,
    ],
    seed,
    1,
  )

  const problem = pickVariant(
    [
      `If ${topic} feels confusing, you're not imagining it.

The usual problem isn't lack of information — it's too much of the wrong information. Random tips. Conflicting opinions. No sequence.

"${pageTitle}" tackles that head-on. It breaks the topic into a clearer framework so you can:
• Spot the advice that actually applies to you
• Avoid the common traps that waste time
• Move forward with a plan instead of guessing

If you've tried things in ${topic} and still feel stuck, this is worth a careful read:
${url}

#${tag} #problemsolving #practicaladvice`,

      `A lot of people fail at ${topic} for one simple reason: they jump to tactics before understanding the fundamentals.

That usually leads to frustration, inconsistent results, and giving up too early.

This guide — "${pageTitle}" — rebuilds the foundation first, then shows how to apply it. It's especially useful if you've already consumed a ton of content and still don't feel confident.

Clear, practical, and actually informative:
${url}

#${tag} #howto #results`,

      `Here's the ${topic} problem in one sentence: everyone tells you what to do, almost nobody explains how to think about it.

"${pageTitle}" is different. It helps you understand the bigger picture, then turns that into concrete steps.

You'll get:
• A clearer mental model for ${topic}
• Warnings about mistakes that look productive but aren't
• A straightforward path you can start today

Read the full breakdown:
${url}

#${tag} #clarity #actionable`,
    ],
    seed,
    2,
  )

  const story = pickVariant(
    [
      `I'll be honest — I used to treat ${topic} like something I could "figure out later."

Then I realized later never comes unless you get a clear starting point. I found "${pageTitle}" while looking for something practical (not another vague motivational post), and it helped a lot.

What helped most:
• It made the topic feel approachable instead of intimidating
• It explained trade-offs instead of promising overnight results
• It gave me a next step I could actually take

If you're in that "I should learn this, but I don't know where to begin" stage with ${topic}, start here:
${url}

#${tag} #personalgrowth #honestreview`,

      `A few weeks ago I was still collecting random notes about ${topic} and not making real progress.

What changed was finding one resource that connected the dots: "${pageTitle}".

Instead of more disconnected tips, it gave me context — why certain approaches work, what to ignore, and how to measure whether you're improving.

I'm sharing it because it's the first thing on ${topic} I actually finished and used.

Full post:
${url}

#${tag} #storytime #learning`,

      `I almost skipped this because the title looked like every other ${topic} article.

Glad I didn't.

"${pageTitle}" is more informative than most content in this space. It respects your time, explains concepts clearly, and doesn't pretend there's a magic shortcut.

If you want a grounded take on ${topic} from someone who's done the reading for you, open this:
${url}

#${tag} #recommendation #realTalk`,
    ],
    seed,
    3,
  )

  const value = pickVariant(
    [
      `If you're studying ${topic}, save this.

"${pageTitle}" is one of the more useful breakdowns I've seen. Here's the value packed inside:

✅ Why beginners stall (and how to avoid it)
✅ A simpler way to prioritize what matters first
✅ Practical checkpoints so you know you're improving
✅ Clear next actions instead of vague inspiration
✅ Context that helps you filter bad advice online

You can skim the highlights or go deep — either way, it's solid.

Read the full guide:
${url}

#${tag} #value #tips`,

      `A practical ${topic} checklist based on "${pageTitle}":

1. Get clear on your real goal (not someone else's highlight reel)
2. Learn the fundamentals before chasing advanced tactics
3. Track one or two metrics that actually reflect progress
4. Cut low-value habits that feel busy but change nothing
5. Review weekly and adjust — consistency beats intensity

The article expands each of these with useful detail, so you're not left guessing.

Full write-up here:
${url}

#${tag} #checklist #productivity`,

      `Want a ${topic} resource that teaches instead of just selling?

"${pageTitle}" covers the informative middle ground most posts skip:
• Core concepts explained in plain language
• Common myths that quietly sabotage progress
• A realistic timeline for improvement
• Actionable steps you can apply this week

Bookmark it, share it, or send it to someone who's been overthinking ${topic}.

Here it is:
${url}

#${tag} #education #shareworthy`,
    ],
    seed,
    4,
  )

  return [
    { id: "curiosity", label: "Curiosity Hook", body: curiosity },
    { id: "problem", label: "Problem-Solution", body: problem },
    { id: "story", label: "Personal Story", body: story },
    { id: "value", label: "Value First", body: value },
  ]
}

function getArticleShareUrl(pageId: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  return `${origin}/article/${pageId}`
}

function CopyButton({
  value,
  label = "Copy",
  className,
  iconOnly = false,
}: {
  value: string
  label?: string
  className?: string
  iconOnly?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={cn(
        "bg-transparent transition-colors",
        copied && "border-primary/40 bg-primary/10 text-primary",
        className,
      )}
      onClick={handleCopy}
      aria-label={copied ? "Copied" : label || "Copy"}
    >
      {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
      {!iconOnly && (copied ? "Copied" : label)}
    </Button>
  )
}

function PagePicker({
  pages,
  selectedId,
  onSelect,
}: {
  pages: PageRow[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = pages.find((page) => page.id === selectedId) || pages[0]

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  if (pages.length <= 1 || !selected) return null

  return (
    <div ref={rootRef} className="relative space-y-2">
      <label id="share-page-picker-label" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Select page
      </label>

      <button
        type="button"
        id="share-page-picker"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="share-page-picker-label share-page-picker"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-12 w-full items-center gap-3 rounded-xl border bg-background/50 px-3.5 text-left transition-all duration-200",
          open
            ? "border-primary/45 bg-primary/5 shadow-[0_0_24px_-10px_rgba(207,161,59,0.45)]"
            : "border-border/50 hover:border-primary/35 hover:bg-background/70",
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{selected.title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-primary/70 transition-transform duration-200",
            open && "rotate-180 text-primary",
          )}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-labelledby="share-page-picker-label"
          className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-[#1a1b14] p-1.5 shadow-2xl shadow-black/60"
        >
          {pages.map((page) => {
            const isSelected = page.id === selected.id
            return (
              <li key={page.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(page.id)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-primary/20 text-white"
                      : "text-zinc-200 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                      isSelected
                        ? "border-primary/40 bg-primary/20 text-primary"
                        : "border-white/10 bg-white/5 text-zinc-300",
                    )}
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{page.title}</span>
                  {isSelected ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function EmptyPagesState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/50 bg-background/20 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
        <Zap className="h-6 w-6" />
      </div>
      <p className="max-w-sm text-base text-muted-foreground">{message}</p>
      <Button asChild size="lg" className="h-12 px-8">
        <Link href="/create">Create Your First Page</Link>
      </Button>
    </div>
  )
}

function ReadyPostsPanel({ page }: { page: PageRow }) {
  const [seed, setSeed] = useState(0)
  const [postSeeds, setPostSeeds] = useState<Record<string, number>>({})
  const url = getArticleShareUrl(page.id)

  useEffect(() => {
    setSeed(0)
    setPostSeeds({})
  }, [page.id])

  const posts = buildReadyPosts(page.title, url, seed).map((post) => {
    const localSeed = postSeeds[post.id]
    if (localSeed === undefined) return post
    return buildReadyPosts(page.title, url, localSeed).find((p) => p.id === post.id) || post
  })

  const regenerateOne = (postId: string) => {
    setPostSeeds((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? seed) + 1,
    }))
  }

  const regenerateAll = () => {
    setSeed((value) => value + 1)
    setPostSeeds({})
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Ready-to-post copy for <span className="font-semibold text-foreground">{page.title}</span>
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={regenerateAll}
          className="h-10 shrink-0 gap-2 bg-transparent"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate all
        </Button>
      </div>

      {posts.map((post) => (
        <div
          key={post.id}
          className="space-y-3 rounded-2xl border border-border/50 bg-gradient-to-br from-background/50 to-background/20 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
              {post.label}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => regenerateOne(post.id)}
                className="h-8 gap-1.5 bg-transparent"
                aria-label={`Regenerate ${post.label}`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
              <CopyButton value={post.body} />
            </div>
          </div>
          <Textarea value={post.body} readOnly className="min-h-52 text-sm leading-relaxed" />
        </div>
      ))}
    </div>
  )
}

function SharePlatformButtons({ page, url }: { page: PageRow; url: string }) {
  const platforms = [
    {
      label: "Facebook",
      icon: Facebook,
      className: "hover:border-[#1877f2]/50 hover:bg-[#1877f2]/10 hover:text-[#5b9df8]",
      onClick: () =>
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank"),
    },
    {
      label: "Twitter",
      icon: Twitter,
      className: "hover:border-[#1da1f2]/50 hover:bg-[#1da1f2]/10 hover:text-[#6ec1f7]",
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(page.title)}`,
          "_blank",
        ),
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      className: "hover:border-[#0077b5]/50 hover:bg-[#0077b5]/10 hover:text-[#5eb3de]",
      onClick: () =>
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank"),
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      className: "hover:border-[#25d366]/50 hover:bg-[#25d366]/10 hover:text-[#5ee492]",
      onClick: () =>
        window.open(`https://wa.me/?text=${encodeURIComponent(`${page.title} - ${url}`)}`, "_blank"),
    },
    {
      label: "Email",
      icon: Mail,
      className: "hover:border-primary/50 hover:bg-primary/10 hover:text-primary",
      onClick: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(page.title)}&body=${encodeURIComponent(`Check this out: ${url}`)}`
      },
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-5">
      {platforms.map(({ label, icon: Icon, className, onClick }) => (
        <Button
          key={label}
          variant="outline"
          className={cn(
            "h-12 bg-transparent font-semibold uppercase tracking-wide transition-all duration-200",
            className,
          )}
          onClick={onClick}
        >
          <Icon className="h-4 w-4" />
          <span className="truncate text-xs sm:text-sm">{label}</span>
        </Button>
      ))}
    </div>
  )
}

function SelectedPageCard({ page }: { page: PageRow }) {
  const url = getArticleShareUrl(page.id)

  return (
    <div className="space-y-5 rounded-2xl border border-border/50 bg-gradient-to-br from-background/50 to-background/20 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">{page.title}</h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Created {new Date(page.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
          <TrendingUp className="h-3.5 w-3.5" />
          {page.views || 0} views
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 p-2 shadow-inner">
        <Input
          value={url}
          readOnly
          className="h-10 flex-1 border-0 bg-transparent font-mono text-sm text-foreground shadow-none focus-visible:ring-0"
        />
        <CopyButton value={url} iconOnly className="h-10 w-10 shrink-0 px-0" />
      </div>

      <SharePlatformButtons page={page} url={url} />
    </div>
  )
}

const tabTriggerClass =
  "h-11 flex-1 rounded-xl px-3 text-sm text-muted-foreground transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_6px_20px_rgba(207,161,59,0.28)] data-[state=inactive]:hover:bg-white/5 data-[state=inactive]:hover:text-foreground"

export default function SharePageClient() {
  const [pages, setPages] = useState<PageRow[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPages() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase
        .from("pages")
        .select("id, title, created_at, views, status, user_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      const rows = data || []
      setPages(rows)
      if (rows[0]) setSelectedPageId(rows[0].id)
      setIsLoading(false)
    }

    fetchPages()
  }, [])

  const selectedPage = pages.find((page) => page.id === selectedPageId) || pages[0]

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg text-muted-foreground">Loading your pages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="space-y-1.5">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Share</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Share Tools
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Amplify your reach. Share your affiliate pages across platforms and maximize your earnings.
        </p>
      </section>

      <Tabs defaultValue="social" className="space-y-5">
        <TabsList className="flex h-auto w-full flex-wrap gap-1.5 rounded-2xl border border-border/50 bg-card/50 p-1.5">
          <TabsTrigger value="social" className={tabTriggerClass}>
            <Share2 className="mr-2 h-4 w-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="embed" className={tabTriggerClass}>
            <Code className="mr-2 h-4 w-4" />
            Embed Codes
          </TabsTrigger>
          <TabsTrigger value="qr" className={tabTriggerClass}>
            <QrCode className="mr-2 h-4 w-4" />
            QR Codes
          </TabsTrigger>
          <TabsTrigger value="templates" className={tabTriggerClass}>
            <Sparkles className="mr-2 h-4 w-4" />
            Post Captions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-5">
          <Card className="gap-0 overflow-hidden border-primary/25 py-0 shadow-[0_0_40px_rgba(207,161,59,0.06)]">
            <CardHeader className="space-y-1 border-b border-border/40 bg-primary/5 px-5 pt-5 pb-4 sm:px-7 sm:pt-6">
              <CardTitle className="text-2xl text-foreground">Quick Share</CardTitle>
              <CardDescription className="text-base">
                Share your pages instantly across major platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
              {pages.length > 0 && selectedPage ? (
                <>
                  <PagePicker pages={pages} selectedId={selectedPage.id} onSelect={setSelectedPageId} />
                  <SelectedPageCard page={selectedPage} />
                </>
              ) : (
                <EmptyPagesState message="No active pages yet. Create your first page to start sharing!" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-5">
          <Card className="gap-0 overflow-hidden border-primary/25 py-0 shadow-[0_0_40px_rgba(207,161,59,0.06)]">
            <CardHeader className="space-y-1 border-b border-border/40 bg-primary/5 px-5 pt-5 pb-4 sm:px-7 sm:pt-6">
              <CardTitle className="text-2xl text-foreground">Embed Your Pages</CardTitle>
              <CardDescription className="text-base">
                Add your affiliate pages to any website with these embed codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
              {pages.length > 0 && selectedPage ? (
                <>
                  <PagePicker pages={pages} selectedId={selectedPage.id} onSelect={setSelectedPageId} />
                  {(() => {
                    const url = getArticleShareUrl(selectedPage.id)
                    const iframe = `<iframe src="${url}" width="100%" height="600" frameborder="0"></iframe>`
                    return (
                      <div className="space-y-4 rounded-2xl border border-border/50 bg-gradient-to-br from-background/50 to-background/20 p-4 sm:p-6">
                        <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                          {selectedPage.title}
                        </h3>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            iFrame Embed Code
                          </label>
                          <div className="relative">
                            <Textarea
                              value={iframe}
                              readOnly
                              className="min-h-[88px] pr-24 font-mono text-sm"
                              rows={3}
                            />
                            <CopyButton value={iframe} className="absolute top-2 right-2" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Direct Link
                          </label>
                          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/60 p-2">
                            <Input
                              value={url}
                              readOnly
                              className="h-10 border-0 bg-transparent font-mono text-sm shadow-none focus-visible:ring-0"
                            />
                            <CopyButton value={url} iconOnly className="h-10 w-10 shrink-0 px-0" />
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </>
              ) : (
                <EmptyPagesState message="No pages available for embedding yet." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-5">
          <Card className="gap-0 overflow-hidden border-primary/25 py-0 shadow-[0_0_40px_rgba(207,161,59,0.06)]">
            <CardHeader className="space-y-1 border-b border-border/40 bg-primary/5 px-5 pt-5 pb-4 sm:px-7 sm:pt-6">
              <CardTitle className="text-2xl text-foreground">QR Codes</CardTitle>
              <CardDescription className="text-base">
                Generate QR codes for offline marketing and easy mobile access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
              {pages.length > 0 && selectedPage ? (
                <>
                  <PagePicker pages={pages} selectedId={selectedPage.id} onSelect={setSelectedPageId} />
                  {(() => {
                    const url = getArticleShareUrl(selectedPage.id)
                    return (
                      <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-border/50 bg-gradient-to-br from-background/50 to-background/20 p-5 text-center sm:p-6">
                        <h3 className="text-lg font-bold tracking-tight text-foreground">
                          {selectedPage.title}
                        </h3>
                        <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl border border-border/40 bg-card p-3 shadow-[0_0_30px_rgba(207,161,59,0.08)]">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`}
                            alt={`QR Code for ${selectedPage.title}`}
                            className="h-56 w-56 rounded-lg bg-white p-2"
                          />
                        </div>
                        <Button
                          className="h-12 w-full gap-2"
                          onClick={() => {
                            const link = document.createElement("a")
                            link.href = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(url)}`
                            link.download = `qr-${selectedPage.id}.png`
                            link.click()
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download QR Code
                        </Button>
                      </div>
                    )
                  })()}
                </>
              ) : (
                <EmptyPagesState message="No pages available for QR codes yet." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-5">
          <Card className="gap-0 overflow-hidden border-primary/25 py-0 shadow-[0_0_40px_rgba(207,161,59,0.06)]">
            <CardHeader className="space-y-1 border-b border-border/40 bg-primary/5 px-5 pt-5 pb-4 sm:px-7 sm:pt-6">
              <CardTitle className="text-2xl text-foreground">Ready-to-Post Captions</CardTitle>
              <CardDescription className="text-base">
                Copy these finished posts — your page link is already included
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
              {pages.length > 0 && selectedPage ? (
                <>
                  <PagePicker pages={pages} selectedId={selectedPage.id} onSelect={setSelectedPageId} />
                  <ReadyPostsPanel page={selectedPage} />
                </>
              ) : (
                <EmptyPagesState message="Create a page first to generate ready-to-post captions." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Pro Sharing Tips</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRO_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="rounded-xl border border-primary/15 bg-card/40 px-4 py-3.5 transition-colors hover:border-primary/30 hover:bg-card/60"
            >
              <h4 className="text-sm font-bold text-primary">{tip.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
