"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  Facebook,
  FolderOpen,
  LayoutTemplate,
  Loader2,
  Megaphone,
  PenLine,
  Play,
  Plus,
  Search,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { markPageKitPostUsed } from "@/app/actions/page-kit"
import type { DfyPageKit } from "@/lib/dfy-profit/page-kit"
import type { DfyFacebookPost } from "@/lib/dfy-profit/types"
import { postUsedKey } from "@/lib/generation-set-name"
import { INSTANT_INCOME_POST_COUNT } from "@/lib/instant-income/niches"
import { pagePublicPath, type ProfitPageOption } from "@/lib/profit-pages/page-options"
import { vimeoPlayerUrl } from "@/lib/training-videos"
import { cn } from "@/lib/utils"

const TRAINING_VIMEO_ID = "1134298240"

const INSTANT_STEPS = [
  {
    num: "1",
    title: "Pick one of your pages",
    desc: "Choose a profit page you’ve already built. We use its niche and offer, so every post is about that page.",
  },
  {
    num: "2",
    title: "Generate posts",
    desc: `We write ${INSTANT_INCOME_POST_COUNT} personal-story posts that link to your page, then save them on that page.`,
  },
  {
    num: "3",
    title: "Copy and post",
    desc: "Copy a post, personalize it, and share it in groups that allow that kind of message. Reopen it anytime from Your Pages.",
  },
] as const

const GUIDE_STEPS = [
  {
    num: "1",
    icon: Search,
    title: "Find Facebook groups",
    items: [
      "Search keywords like “weight loss support”, “make money online”, or “fitness motivation”, then filter to Groups.",
      "Join 10–15 groups with 5,000+ members. Bigger rooms mean more people seeing a personal story.",
      "Wait for admin approval — usually 1–24 hours. Post only after you’re in.",
    ],
  },
  {
    num: "2",
    icon: BookOpen,
    title: "Read the group rules",
    items: [
      "Open About and check whether personal stories are allowed. Most groups ban hard selling, not honest updates.",
      "These drafts are written as personal stories so they usually fit — still read the rules first.",
      "If a group says no links, post the story and send the link in DMs to people who ask.",
    ],
  },
  {
    num: "3",
    icon: PenLine,
    title: "Post your message",
    items: [
      "Click Write something, paste your copied draft, then Post. Change the first line so it sounds like you.",
      "Best windows: 7–9 AM, 12–1 PM, and 7–9 PM. Post in 3–5 different groups per day — never blast every group at once.",
      "Reply to comments within an hour. Friendly replies keep the thread visible.",
    ],
  },
] as const

function PostActions({
  copyKey,
  copiedId,
  body,
  isUsed,
  isMarking,
  onCopy,
  onMarkUsed,
}: {
  copyKey: string
  copiedId: string | null
  body: string
  isUsed: boolean
  isMarking: boolean
  onCopy: (key: string, body: string) => void
  onMarkUsed: () => void
}) {
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <Button
        type="button"
        onClick={() => onCopy(copyKey, body)}
        className="h-12 flex-1 text-base"
        size="lg"
      >
        {copiedId === copyKey ? (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Copied — now paste in Facebook
          </>
        ) : (
          <>
            <Copy className="mr-2 h-5 w-5" />
            Copy this post
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={isUsed || isMarking}
        onClick={onMarkUsed}
        className={cn(
          "h-12 flex-1 text-base font-bold",
          isUsed
            ? "border-primary/50 bg-primary/15 text-accent"
            : "border-primary/30 text-accent hover:bg-primary/15",
        )}
      >
        {isMarking ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Saving…
          </>
        ) : isUsed ? (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Marked as used
          </>
        ) : (
          "Mark as used"
        )}
      </Button>
    </div>
  )
}

function SavedPostCard({
  post,
  index,
  label,
  isUsed,
  copiedId,
  isMarking,
  onCopy,
  onMarkUsed,
  compact = false,
}: {
  post: DfyFacebookPost
  index: number
  label: string
  isUsed: boolean
  copiedId: string | null
  isMarking: boolean
  onCopy: (key: string, body: string) => void
  onMarkUsed: () => void
  compact?: boolean
}) {
  return (
    <Card className={cn("border-primary/20 glass-strong", isUsed && "border-primary/50")}>
      <CardContent className={compact ? "p-5" : "p-6 md:p-8"}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/20 px-4 py-2 text-sm font-bold text-accent">Post #{index + 1}</span>
          {label ? (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              {label}
            </span>
          ) : null}
          {isUsed ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-bold text-accent">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Used
            </span>
          ) : null}
        </div>
        <div className={cn("rounded-xl border border-primary/20 bg-background/50 p-5", isUsed && "opacity-90")}>
          <p
            className={cn(
              "whitespace-pre-wrap font-semibold leading-relaxed text-gray-200",
              compact ? "text-sm" : "text-base",
              isUsed && "text-gray-400",
            )}
          >
            {post.body}
          </p>
        </div>
        <PostActions
          copyKey={post.id}
          copiedId={copiedId}
          body={post.body}
          isUsed={isUsed}
          isMarking={isMarking}
          onCopy={onCopy}
          onMarkUsed={onMarkUsed}
        />
      </CardContent>
    </Card>
  )
}

type GenerateResponse = {
  error?: string
  pageId?: string
  posts?: { id: string; body: string }[]
  kit?: DfyPageKit
  niche?: string
  usedFallback?: boolean
}

export function InstantIncomeContent({
  initialPages = [],
  initialError = "",
}: {
  initialPages?: ProfitPageOption[]
  initialError?: string
}) {
  const [pages, setPages] = useState<ProfitPageOption[]>(initialPages)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(initialPages[0]?.id ?? null)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)
  const [formError, setFormError] = useState(initialError)
  const [postsError, setPostsError] = useState("")
  const [markingPostKey, setMarkingPostKey] = useState<string | null>(null)
  const [result, setResult] = useState<{ pageId: string; postIds: string[]; niche: string } | null>(null)
  const [origin, setOrigin] = useState("")
  const postsResultsRef = useRef<HTMLDivElement>(null)

  const selectedPage = pages.find((page) => page.id === selectedPageId) ?? null
  const selectedPath = selectedPage ? pagePublicPath(selectedPage) : ""
  const selectedUrl = selectedPage ? `${origin}${selectedPath}` : ""
  const selectedPosts = selectedPage?.kit?.posts ?? []
  const selectedUsedKeys = selectedPage?.kit?.usedKeys ?? {}

  const resultPage = result ? (pages.find((page) => page.id === result.pageId) ?? null) : null
  const resultPosts = resultPage
    ? (resultPage.kit?.posts ?? []).filter((post) => result!.postIds.includes(post.id))
    : []
  const resultUsedKeys = resultPage?.kit?.usedKeys ?? {}

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (!result) return
    postsResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [result])

  const handleCopy = (postId: string, body: string) => {
    navigator.clipboard.writeText(body)
    setCopiedId(postId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const applyKit = (pageId: string, kit: DfyPageKit) => {
    setPages((prev) => prev.map((page) => (page.id === pageId ? { ...page, kit } : page)))
  }

  const handleGeneratePosts = async () => {
    if (!selectedPage) {
      setFormError("Pick one of your pages first.")
      return
    }

    setFormError("")
    setPostsError("")
    setResult(null)
    setGenerating(true)

    try {
      const response = await fetch("/api/premium/instant-income/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: selectedPage.id }),
      })
      const data = (await response.json()) as GenerateResponse

      if (!response.ok || !data.posts?.length || !data.kit || !data.pageId) {
        setFormError(data.error || "Could not generate posts for that page. Try again.")
        return
      }

      applyKit(data.pageId, data.kit)
      setResult({
        pageId: data.pageId,
        postIds: data.posts.map((post) => post.id),
        niche: data.niche || selectedPage.nicheName || "",
      })
    } catch {
      setFormError("Could not generate posts for that page. Try again.")
    } finally {
      setGenerating(false)
    }
  }

  const handleMarkPostUsed = async (pageId: string, postId: string) => {
    const key = `${pageId}-${postId}`
    setMarkingPostKey(key)
    setPostsError("")
    const response = await markPageKitPostUsed(pageId, postId)
    setMarkingPostKey(null)
    if (!response.success) {
      setPostsError(response.error)
      return
    }
    applyKit(pageId, response.kit)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Button asChild variant="ghost" className="mb-6 border border-primary/60 text-primary hover:border-primary hover:bg-primary/10 hover:text-accent">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-6 rounded-2xl border border-primary/25 bg-primary/5 p-8 text-center md:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40">
            <Facebook className="h-12 w-12 text-primary-foreground" />
          </div>
          <div>
            <h1 className="mb-4 text-4xl font-black text-white lg:text-6xl">Instant Income: Facebook Posts</h1>
            <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-gray-300 md:text-xl">
              Facebook posts written for one of your profit pages. Pick a page, copy a draft, and share it where the
              group rules allow.
            </p>
          </div>
        </div>

        <Card highlighted className="overflow-hidden border-primary/30 glass-strong glow-purple shadow-2xl">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
              <div className="relative aspect-video bg-black">
                {!isVideoPlaying ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                    <iframe
                      src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { background: true })}
                      title="Instant Income preview"
                      allow="autoplay; fullscreen; picture-in-picture"
                      className="pointer-events-none absolute inset-0 h-full w-full border-0"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <Button
                      size="lg"
                      onClick={() => setIsVideoPlaying(true)}
                      className="relative z-10 h-24 w-24 rounded-full border-4 border-primary-foreground/20 shadow-2xl transition-all duration-300 hover:scale-110"
                    >
                      <Play className="ml-1 h-12 w-12 fill-primary-foreground text-primary-foreground" />
                    </Button>
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <p className="text-xl font-black text-white drop-shadow-lg">Watch Instant Income Tutorial</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { autoplay: true })}
                    title="Instant Income Tutorial"
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
                <h2 className="text-3xl font-black text-white">How to Use Instant Income</h2>
                <p className="text-xl font-bold leading-relaxed text-gray-300">
                  Watch this quick tutorial to learn how to copy these Facebook posts and start making money instantly.
                  Simple and easy!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 glass-strong shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-black text-white">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              Three steps to post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {INSTANT_STEPS.map((step) => (
                <div key={step.num} className="rounded-xl border border-primary/25 bg-primary/10 p-6">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-black text-primary-foreground">
                    {step.num}
                  </div>
                  <h3 className="mb-3 text-2xl font-black text-white">{step.title}</h3>
                  <p className="text-lg font-semibold leading-relaxed text-gray-300">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-primary/30 glass-strong p-0 shadow-xl">
          <button
            type="button"
            onClick={() => setGuideOpen((open) => !open)}
            aria-expanded={guideOpen}
            className="flex w-full items-center gap-3 p-6 text-left"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Facebook className="h-6 w-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xl font-black text-white">How to find and post in Facebook groups</span>
              <span className="mt-1 block text-sm font-semibold text-gray-300">
                Groups reward members who sound human. Read this once, then generate drafts and edit the first line
                before you paste.
              </span>
            </span>
            <ChevronDown
              className={cn("h-5 w-5 shrink-0 text-primary transition-transform duration-200", guideOpen && "rotate-180")}
              aria-hidden
            />
          </button>
          {guideOpen ? (
            <CardContent className="space-y-4 border-t border-primary/20 pt-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {GUIDE_STEPS.map((step) => {
                  const Icon = step.icon
                  return (
                    <div key={step.num} className="rounded-xl border border-primary/25 bg-primary/10 p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">
                          {step.num}
                        </span>
                        <Icon className="h-4 w-4 text-primary" aria-hidden />
                        <h3 className="text-base font-black text-white">{step.title}</h3>
                      </div>
                      <ul className="space-y-2.5">
                        {step.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-gray-300">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
                <h3 className="text-base font-black text-white">What to expect</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-300">
                  Outcomes depend on your niche, offer, group rules, and consistency. Treat these as starting drafts —
                  edit them so they sound like you and match each community&apos;s guidelines.
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    "Post in a handful of relevant groups per day, spaced out — never dump the same text everywhere at once.",
                    "Reply quickly and helpfully so the thread stays visible without sounding salesy.",
                    "Track hook, group, and time of day so you improve the message — not just the volume.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-gray-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          ) : null}
        </Card>

        <Card className="border-primary/30 glass-strong shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-black text-white">
              <Megaphone className="h-8 w-8 text-primary" />
              Write posts for one of your pages
            </CardTitle>
            <p className="text-base font-semibold text-gray-300">
              Pick a profit page. We use its niche and offer to write personal Facebook stories that link to that
              page, then save the posts on it.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="instant-income-page" className="text-sm font-black uppercase tracking-wide text-gray-300">
                  Step 1 · Choose a page
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
                  <p className="mt-3 text-base font-bold text-white">You don’t have any pages yet</p>
                  <p className="mx-auto mt-1 max-w-md text-sm font-semibold text-gray-400">
                    Instant Income writes posts about a page you already own. Build one first, then come back here.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Button asChild className="h-11">
                      <Link href="/create">Build your first page</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-11 border-primary/30 bg-transparent text-accent hover:bg-primary/15">
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
                      setFormError("")
                      setResult(null)
                    }}
                  >
                    <SelectTrigger
                      id="instant-income-page"
                      aria-label="Choose a page"
                      className="h-14 border-primary/30 bg-background text-base font-semibold"
                    >
                      <SelectValue placeholder="Select one of your pages…" />
                    </SelectTrigger>
                    <SelectContent>
                      {pages.map((page) => {
                        const postCount = page.kit?.posts.length ?? 0
                        return (
                          <SelectItem key={page.id} value={page.id} textValue={page.title}>
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-lg">
                                {page.nicheIcon || <LayoutTemplate className="h-4 w-4 text-primary" aria-hidden />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold text-foreground">{page.title}</span>
                                <span className="block truncate text-xs font-semibold text-muted-foreground">
                                  {page.nicheName || "General"}
                                  {page.offerTitle ? ` · ${page.offerTitle}` : ""}
                                  {` · ${postCount} saved post${postCount === 1 ? "" : "s"}`}
                                  {page.status !== "active" ? ` · ${page.status}` : ""}
                                </span>
                              </span>
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs font-semibold leading-relaxed text-gray-400">
                    {pages.length} page{pages.length === 1 ? "" : "s"} available. Posts are saved on the page you pick.
                  </p>
                </>
              )}
            </div>

            {selectedPage ? (
              <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-5">
                <h3 className="flex items-center gap-2 text-lg font-bold text-accent">
                  <Sparkles className="h-5 w-5" />
                  What we’ll write about
                </h3>
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-[11px] font-black uppercase tracking-wide text-gray-400">Niche</dt>
                    <dd className="mt-0.5 font-bold text-white">{selectedPage.nicheName || "General"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-black uppercase tracking-wide text-gray-400">Offer</dt>
                    <dd className="mt-0.5 truncate font-bold text-white">{selectedPage.offerTitle || "From your page"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-black uppercase tracking-wide text-gray-400">Posts</dt>
                    <dd className="mt-0.5 font-bold text-white">{INSTANT_INCOME_POST_COUNT} new drafts</dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-background/40 px-3 py-2.5 sm:flex-row sm:items-center">
                  <span className="text-[11px] font-black uppercase tracking-wide text-gray-400">Link in every post</span>
                  <span className="min-w-0 flex-1 break-all font-mono text-xs font-semibold text-gray-200">{selectedUrl || selectedPath}</span>
                  <Button asChild variant="ghost" size="sm" className="h-8 shrink-0 px-2 text-accent hover:bg-primary/15">
                    <a href={selectedPath} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Preview
                    </a>
                  </Button>
                </div>
              </div>
            ) : null}

            {formError ? (
              <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-300">
                {formError}
              </p>
            ) : null}

            <Button
              onClick={() => void handleGeneratePosts()}
              disabled={!selectedPage || generating}
              className="h-14 w-full text-lg"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Writing your posts…
                </>
              ) : (
                <>
                  Generate {INSTANT_INCOME_POST_COUNT} posts for this page
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && resultPage && resultPosts.length > 0 ? (
          <div ref={postsResultsRef} className="scroll-mt-24 space-y-6">
            <div className="rounded-2xl border border-primary/25 bg-primary/10 p-8 text-center">
              <h2 className="mb-3 text-3xl font-black text-white md:text-4xl">
                Your {resultPosts.length} {result.niche ? `${result.niche} ` : ""}posts are ready
              </h2>
              <p className="text-lg font-bold text-accent">
                Saved on “{resultPage.title}”. Copy a draft, rewrite the opening line in your voice, then paste where
                the group rules allow.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button asChild variant="outline" className="h-11 border-primary/30 bg-transparent text-accent hover:bg-primary/15">
                  <Link href={`/pages/${resultPage.id}`}>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Open page details
                  </Link>
                </Button>
              </div>
            </div>

            {postsError ? (
              <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-300">
                {postsError}
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-6">
              {resultPosts.map((post, index) => {
                const isUsed = Boolean(resultUsedKeys[postUsedKey(post.id)])
                const markKey = `${resultPage.id}-${post.id}`
                return (
                  <SavedPostCard
                    key={post.id}
                    post={post}
                    index={index}
                    label={result.niche}
                    isUsed={isUsed}
                    copiedId={copiedId}
                    isMarking={markingPostKey === markKey}
                    onCopy={handleCopy}
                    onMarkUsed={() => void handleMarkPostUsed(resultPage.id, post.id)}
                  />
                )
              })}
            </div>
          </div>
        ) : null}

        {selectedPage && selectedPosts.length > 0 ? (
          <Card className="overflow-hidden border-primary/30 glass-strong p-0 shadow-xl">
            <button
              type="button"
              onClick={() => setSavedOpen((open) => !open)}
              aria-expanded={savedOpen}
              className="flex w-full flex-wrap items-center gap-3 p-6 text-left"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <FolderOpen className="h-6 w-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-black uppercase tracking-[0.2em] text-primary">Saved on this page</span>
                <span className="block truncate text-2xl font-black text-white">{selectedPage.title}</span>
                <span className="mt-1 block text-sm font-semibold text-gray-300">
                  Every post generated for this page, newest first. Also available under Your Pages.
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground">
                  {selectedPosts.length} post{selectedPosts.length === 1 ? "" : "s"}
                </span>
                <ChevronDown
                  className={cn("h-5 w-5 shrink-0 text-primary transition-transform duration-200", savedOpen && "rotate-180")}
                  aria-hidden
                />
              </span>
            </button>
            {savedOpen ? (
              <CardContent className="space-y-4 border-t border-primary/20 pt-6">
                {postsError ? (
                  <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-300">
                    {postsError}
                  </p>
                ) : null}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {[...selectedPosts].reverse().map((post, index) => {
                    const isUsed = Boolean(selectedUsedKeys[postUsedKey(post.id)])
                    const markKey = `${selectedPage.id}-${post.id}`
                    return (
                      <SavedPostCard
                        key={post.id}
                        compact
                        post={post}
                        index={selectedPosts.length - 1 - index}
                        label={selectedPage.nicheName}
                        isUsed={isUsed}
                        copiedId={copiedId}
                        isMarking={markingPostKey === markKey}
                        onCopy={handleCopy}
                        onMarkUsed={() => void handleMarkPostUsed(selectedPage.id, post.id)}
                      />
                    )
                  })}
                </div>
              </CardContent>
            ) : null}
          </Card>
        ) : null}
      </div>
    </div>
  )
}
