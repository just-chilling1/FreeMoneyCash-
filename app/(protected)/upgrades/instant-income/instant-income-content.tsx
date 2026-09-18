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
  Link2,
  Loader2,
  PenLine,
  Play,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  deleteInstantIncomePostSet,
  markInstantIncomePostUsed,
  upsertInstantIncomePostSet,
  type InstantIncomePostSet,
  type InstantIncomeSavedPost,
} from "@/app/actions/instant-income-post-sets"
import { isValidAffiliateUrl } from "@/lib/affiliate-url"
import { defaultLabelFromUrl } from "@/lib/generation-set-name"
import { INSTANT_INCOME_NICHES, INSTANT_INCOME_POST_COUNT } from "@/lib/instant-income/niches"
import { vimeoPlayerUrl } from "@/lib/training-videos"
import { cn } from "@/lib/utils"

const TRAINING_VIMEO_ID = "1134298240"

const INSTANT_STEPS = [
  {
    num: "1",
    title: "Pick your niche",
    desc: "Choose the niche that matches your affiliate offer — weight loss, make money online, health, beauty, and more.",
  },
  {
    num: "2",
    title: "Name your link",
    desc: "Paste your affiliate link and give it a name. We write posts about that offer, then save the set in your library.",
  },
  {
    num: "3",
    title: "Copy and post",
    desc: "Copy a post, personalize it, and share it in groups that allow that kind of message. Reopen saved sets anytime.",
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

export function InstantIncomeContent({
  userId: _userId,
  initialSets = [],
  initialLibraryError = "",
}: {
  userId: string
  initialSets?: InstantIncomePostSet[]
  initialLibraryError?: string
}) {
  const [selectedNiche, setSelectedNiche] = useState<string>("Weight Loss")
  const [affiliateLink, setAffiliateLink] = useState("")
  const [setName, setSetName] = useState("")
  const [nameTouched, setNameTouched] = useState(false)
  const [showPosts, setShowPosts] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(initialSets.length > 0)
  const [librarySets, setLibrarySets] = useState<InstantIncomePostSet[]>(initialSets)
  const [openLibraryId, setOpenLibraryId] = useState<string | null>(null)
  const [formError, setFormError] = useState("")
  const [libraryError, setLibraryError] = useState(initialLibraryError)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [markingPostKey, setMarkingPostKey] = useState<string | null>(null)
  const [resultPosts, setResultPosts] = useState<InstantIncomeSavedPost[]>([])
  const [resultNiche, setResultNiche] = useState("Weight Loss")
  const postsResultsRef = useRef<HTMLDivElement>(null)

  const savedSetForResults = librarySets.find(
    (set) => set.name.trim().toLowerCase() === setName.trim().toLowerCase(),
  )

  useEffect(() => {
    if (nameTouched) return
    setSetName(defaultLabelFromUrl(affiliateLink))
  }, [affiliateLink, nameTouched])

  useEffect(() => {
    if (!showPosts || resultPosts.length === 0) return
    postsResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [showPosts, resultPosts])

  const handleCopy = (postId: string, body: string) => {
    navigator.clipboard.writeText(body)
    setCopiedId(postId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleGeneratePosts = async () => {
    const link = affiliateLink.trim()
    const name = setName.trim()

    if (!isValidAffiliateUrl(link)) {
      setFormError("Use a full link that starts with https://")
      return
    }
    if (!name) {
      setFormError("Add a name for this link so we can save the set in your library.")
      return
    }

    setFormError("")
    setLibraryError("")
    setShowPosts(false)
    setResultPosts([])
    setGenerating(true)

    try {
      const response = await fetch("/api/premium/instant-income/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateUrl: link,
          niche: selectedNiche,
          offerName: name,
        }),
      })
      const data = (await response.json()) as {
        error?: string
        posts?: InstantIncomeSavedPost[]
      }
      if (!response.ok || !data.posts?.length) {
        setGenerating(false)
        setFormError(data.error || "Could not generate posts for that offer. Try again.")
        return
      }

      const result = await upsertInstantIncomePostSet({
        name,
        affiliateUrl: link,
        niche: selectedNiche,
        posts: data.posts.map((post) => ({ id: post.id, body: post.body })),
      })

      setGenerating(false)

      if (!result.success) {
        setFormError(result.error)
        return
      }

      setLibrarySets((prev) => {
        const without = prev.filter(
          (s) => s.id !== result.set.id && s.name.trim().toLowerCase() !== name.toLowerCase(),
        )
        return [result.set, ...without]
      })
      setLibraryOpen(true)
      setOpenLibraryId(result.set.id)
      setResultPosts(result.set.posts)
      setResultNiche(selectedNiche)
      setShowPosts(true)
    } catch {
      setGenerating(false)
      setFormError("Could not generate posts for that offer. Try again.")
    }
  }

  const handleMarkPostUsed = async (setId: string, postId: string) => {
    const key = `${setId}-${postId}`
    setMarkingPostKey(key)
    setLibraryError("")
    const result = await markInstantIncomePostUsed(setId, postId)
    setMarkingPostKey(null)
    if (!result.success) {
      setLibraryError(result.error)
      return
    }
    setLibrarySets((prev) => prev.map((set) => (set.id === result.set.id ? result.set : set)))
    setResultPosts((prev) => (prev.some((post) => post.id === postId) ? result.set.posts : prev))
  }

  const handleDeleteSet = async (setId: string) => {
    setDeletingId(setId)
    setLibraryError("")
    const result = await deleteInstantIncomePostSet(setId)
    setDeletingId(null)
    if (!result.success) {
      setLibraryError(result.error)
      return
    }
    setLibrarySets((prev) => prev.filter((s) => s.id !== setId))
    if (openLibraryId === setId) setOpenLibraryId(null)
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
              Facebook posts written for your niche and your offer. Paste a link, copy a draft, and share it where the
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

        <Card className="overflow-hidden border-primary/30 glass-strong p-0 shadow-xl">
          <button
            type="button"
            onClick={() => setLibraryOpen((open) => !open)}
            aria-expanded={libraryOpen}
            className="flex w-full flex-wrap items-center gap-3 p-6 text-left"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <FolderOpen className="h-6 w-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black uppercase tracking-[0.2em] text-primary">Library</span>
              <span className="block text-2xl font-black text-white">Saved post sets</span>
              <span className="mt-1 block text-sm font-semibold text-gray-300">
                Each generation is saved under the link name you enter. Same name updates that set.
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground">
                {librarySets.length} set{librarySets.length === 1 ? "" : "s"}
              </span>
              <ChevronDown
                className={cn("h-5 w-5 shrink-0 text-primary transition-transform duration-200", libraryOpen && "rotate-180")}
                aria-hidden
              />
            </span>
          </button>
          {libraryOpen ? (
            <CardContent className="space-y-4 border-t border-primary/20 pt-6">
              {libraryError ? (
                <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-300">
                  {libraryError}
                </p>
              ) : null}
              {librarySets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-10 text-center">
                  <FolderOpen className="mx-auto h-8 w-8 text-primary" aria-hidden />
                  <p className="mt-3 text-sm font-bold text-white">No saved sets yet</p>
                  <p className="mt-1 text-sm font-semibold text-gray-400">
                    Generate posts with a link name to start your library.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {librarySets.map((set) => {
                    const open = openLibraryId === set.id
                    return (
                      <article key={set.id} className="overflow-hidden rounded-2xl border border-primary/20 bg-background/40">
                        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                          <button
                            type="button"
                            onClick={() => setOpenLibraryId(open ? null : set.id)}
                            aria-expanded={open}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                              <FolderOpen className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold text-white">{set.name}</span>
                              <span className="mt-0.5 block truncate text-xs font-semibold text-gray-400">
                                {set.niche} · {set.posts.length} posts · {new Date(set.updatedAt).toLocaleDateString()}
                              </span>
                            </span>
                            <ChevronDown
                              className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
                              aria-hidden
                            />
                          </button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={deletingId === set.id}
                            onClick={() => void handleDeleteSet(set.id)}
                            className="h-9 shrink-0 border-primary/30 text-accent hover:bg-primary/15"
                            aria-label={`Delete ${set.name}`}
                          >
                            {deletingId === set.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                        {open ? (
                          <div className="space-y-3 border-t border-primary/20 px-4 py-4 sm:px-5">
                            <p className="truncate text-xs font-semibold text-gray-400">{set.affiliateUrl}</p>
                            {set.posts.map((post, index) => {
                              const copyKey = `${set.id}-${post.id}`
                              const isUsed = Boolean(post.usedAt)
                              return (
                                <div
                                  key={post.id}
                                  className={cn(
                                    "rounded-xl border border-primary/20 bg-background/50 p-4",
                                    isUsed && "border-primary/40 bg-primary/10",
                                  )}
                                >
                                  <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <p className="text-xs font-black uppercase tracking-wide text-primary">Post #{index + 1}</p>
                                    {isUsed ? (
                                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">
                                        <CheckCircle2 className="h-3 w-3" aria-hidden />
                                        Used
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className={cn("whitespace-pre-wrap text-sm font-semibold leading-relaxed text-gray-200", isUsed && "text-gray-400")}>
                                    {post.body}
                                  </p>
                                  <PostActions
                                    copyKey={copyKey}
                                    copiedId={copiedId}
                                    body={post.body}
                                    isUsed={isUsed}
                                    isMarking={markingPostKey === copyKey}
                                    onCopy={handleCopy}
                                    onMarkUsed={() => void handleMarkPostUsed(set.id, post.id)}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              )}
            </CardContent>
          ) : null}
        </Card>

        <Card className="border-primary/30 glass-strong shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-black text-white">
              <FolderOpen className="h-8 w-8 text-primary" />
              Write posts for this offer
            </CardTitle>
            <p className="text-base font-semibold text-gray-300">
              Pick the niche that matches your product. We read the offer page and write Facebook stories about that
              specific link — not a generic template.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-black uppercase tracking-wide text-gray-300">Step 1 · Choose your niche</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {INSTANT_INCOME_NICHES.map((niche) => {
                  const selected = selectedNiche === niche
                  return (
                    <Button
                      key={niche}
                      type="button"
                      onClick={() => {
                        setSelectedNiche(niche)
                        setShowPosts(false)
                      }}
                      variant={selected ? "default" : "outline"}
                      className={
                        selected
                          ? "h-auto min-h-11 px-2 py-2 text-xs font-bold sm:px-3 sm:text-sm"
                          : "h-auto min-h-11 border-primary/30 px-2 py-2 text-xs font-bold text-accent hover:bg-primary/15 sm:px-3 sm:text-sm"
                      }
                    >
                      {niche}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/10 p-5">
              <h3 className="flex items-center gap-2 text-lg font-bold text-accent">
                <Link2 className="h-5 w-5" />
                Where to get your affiliate link
              </h3>
              <p className="text-sm font-semibold leading-relaxed text-gray-200">
                We recommend{" "}
                <a
                  href="http://digistore24.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary underline hover:text-accent"
                >
                  DigiStore24
                </a>{" "}
                — a free marketplace with products you can promote for commission.
              </p>
              <ol className="space-y-2 text-sm font-semibold text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="font-black text-primary">1.</span>
                  Create a free account at digistore24.com (about two minutes).
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-primary">2.</span>
                  Browse your niche and click Promote on a product.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-primary">3.</span>
                  Copy your unique link and paste it below.
                </li>
              </ol>
              <Button
                asChild
                variant="outline"
                className="w-full border-primary/40 bg-transparent font-bold text-accent hover:bg-primary/15"
              >
                <a href="http://digistore24.com" target="_blank" rel="noopener noreferrer">
                  Create free DigiStore24 account
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                </a>
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliate-link" className="text-sm font-black uppercase tracking-wide text-gray-300">
                Step 2 · Affiliate link
              </Label>
              <Input
                id="affiliate-link"
                type="url"
                placeholder="https://digistore24.com/..."
                value={affiliateLink}
                onChange={(e) => {
                  setAffiliateLink(e.target.value)
                  setShowPosts(false)
                }}
                className="h-12 border-primary/30 bg-background text-base font-semibold text-foreground"
              />
              <p className="text-xs font-semibold leading-relaxed text-gray-400">
                We write this URL into every draft and use the offer page to keep the story about your product. Must
                start with https://
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="set-name" className="text-sm font-black uppercase tracking-wide text-gray-300">
                Step 3 · Name for this link
              </Label>
              <Input
                id="set-name"
                type="text"
                placeholder="e.g. Melatonin Digistore"
                value={setName}
                onChange={(e) => {
                  setNameTouched(true)
                  setSetName(e.target.value)
                }}
                className="h-12 border-primary/30 bg-background text-base font-semibold text-foreground"
              />
              <p className="text-xs font-semibold leading-relaxed text-gray-400">
                Saved sets use this name. Generating again with the same name updates that set.
              </p>
            </div>

            {formError ? (
              <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-300">
                {formError}
              </p>
            ) : null}

            <Button
              onClick={() => void handleGeneratePosts()}
              disabled={!affiliateLink.trim() || !setName.trim() || generating}
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
                  Generate {INSTANT_INCOME_POST_COUNT} {selectedNiche} posts
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {showPosts && resultPosts.length > 0 ? (
          <div ref={postsResultsRef} className="space-y-6">
            <div className="rounded-2xl border border-primary/25 bg-primary/10 p-8 text-center">
              <h2 className="mb-3 text-3xl font-black text-white md:text-4xl">
                Your {resultPosts.length} {resultNiche} posts are ready
              </h2>
              <p className="text-lg font-bold text-accent">
                Copy a draft, rewrite the opening line in your voice, then paste where the group rules allow.
              </p>
            </div>

            {libraryError ? (
              <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-300">
                {libraryError}
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-6">
              {resultPosts.map((post, index) => {
                const savedPost = savedSetForResults?.posts.find((item) => item.id === post.id)
                const isUsed = Boolean(savedPost?.usedAt || post.usedAt)
                const setId = savedSetForResults?.id
                const markKey = setId ? `${setId}-${post.id}` : null
                const isMarking = markKey != null && markingPostKey === markKey

                return (
                  <Card
                    key={post.id}
                    className={cn(
                      "border-primary/20 glass-strong",
                      isUsed && "border-primary/50",
                    )}
                  >
                    <CardContent className="p-6 md:p-8">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/20 px-4 py-2 text-sm font-bold text-accent">
                          Post #{index + 1}
                        </span>
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                          {resultNiche}
                        </span>
                        {isUsed ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-bold text-accent">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            Used
                          </span>
                        ) : null}
                      </div>
                      <div className={cn("rounded-xl border border-primary/20 bg-background/50 p-5", isUsed && "opacity-90")}>
                        <p className={cn("whitespace-pre-wrap text-base font-semibold leading-relaxed text-gray-200", isUsed && "text-gray-400")}>
                          {post.body}
                        </p>
                      </div>
                      <PostActions
                        copyKey={post.id}
                        copiedId={copiedId}
                        body={post.body}
                        isUsed={isUsed}
                        isMarking={isMarking}
                        onCopy={handleCopy}
                        onMarkUsed={() => {
                          if (setId) void handleMarkPostUsed(setId, post.id)
                        }}
                      />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
