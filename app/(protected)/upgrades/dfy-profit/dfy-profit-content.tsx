"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Package,
  Play,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkAsUsedButton, UsedBadge } from "@/components/mark-as-used-button"
import { SavedGenerationsLibrary } from "@/components/saved-generations-library"
import {
  deletePremiumGenerationSet,
  markPremiumGenerationItemUsed,
  upsertPremiumGenerationSet,
  type PremiumGenerationSet,
} from "@/app/actions/premium-generation-sets"
import { isValidAffiliateUrl } from "@/lib/affiliate-url"
import { commentUsedKey, defaultLabelFromUrl, postUsedKey } from "@/lib/generation-set-name"
import { parseDfySavedKit, summarizeDfyKit } from "@/lib/dfy-profit/saved-kit"
import type { DfyArticleResult, DfyFacebookPost, DfyVideoResult } from "@/lib/dfy-profit/types"
import { vimeoPlayerUrl } from "@/lib/training-videos"
import { cn } from "@/lib/utils"
import { DfyResultPanel } from "./dfy-result-panel"

const NICHES = [
  "Weight Loss",
  "Make Money Online",
  "Health & Fitness",
  "Beauty & Skincare",
  "Relationships",
  "Tech & Gadgets",
  "Pets",
  "Home & Garden",
]

const STEPS = [
  { num: "1", title: "Add your link", desc: "Paste an affiliate URL. Add a product name if you already know it." },
  { num: "2", title: "Pick a niche", desc: "Choose the niche so videos, article tone, and posts stay on-brand." },
  { num: "3", title: "Generate your kit", desc: "We find 5 videos, write an authority article, and draft Facebook posts." },
]

type Stage = "idle" | "videos" | "article" | "posts" | "done"

const STAGE_LABELS: Record<Exclude<Stage, "idle" | "done">, string> = {
  videos: "Finding your videos…",
  article: "Writing your authority article…",
  posts: "Generating Facebook posts…",
}

const TRAINING_VIMEO_ID = "1226577445"

export function DfyProfitContent({
  initialSets = [],
  initialLibraryError = "",
}: {
  initialSets?: PremiumGenerationSet[]
  initialLibraryError?: string
}) {
  const [affiliateUrl, setAffiliateUrl] = useState("")
  const [productNameInput, setProductNameInput] = useState("")
  const [kitName, setKitName] = useState("")
  const [nameTouched, setNameTouched] = useState(false)
  const [niche, setNiche] = useState("")
  const [stage, setStage] = useState<Stage>("idle")
  const [error, setError] = useState("")
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const [videos, setVideos] = useState<DfyVideoResult[]>([])
  const [article, setArticle] = useState<DfyArticleResult | null>(null)
  const [posts, setPosts] = useState<DfyFacebookPost[]>([])
  const [articleError, setArticleError] = useState("")
  const [postsError, setPostsError] = useState("")
  const [usedFallbackLink, setUsedFallbackLink] = useState(false)
  const [context, setContext] = useState({ productName: "", productContext: "", niche: "" })
  const [retryingArticle, setRetryingArticle] = useState(false)
  const [retryingPosts, setRetryingPosts] = useState(false)

  const [librarySets, setLibrarySets] = useState<PremiumGenerationSet[]>(initialSets)
  const [libraryOpen, setLibraryOpen] = useState(initialSets.length > 0)
  const [openLibraryId, setOpenLibraryId] = useState<string | null>(null)
  const [libraryError, setLibraryError] = useState(initialLibraryError)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [markingKey, setMarkingKey] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeSetId, setActiveSetId] = useState<string | null>(null)
  const [usedKeys, setUsedKeys] = useState<Record<string, string>>({})

  const generating = stage === "videos" || stage === "article" || stage === "posts"

  useEffect(() => {
    if (nameTouched) return
    setKitName(productNameInput.trim() || defaultLabelFromUrl(affiliateUrl))
  }, [affiliateUrl, productNameInput, nameTouched])

  const persistKit = async (
    nextVideos: DfyVideoResult[],
    nextArticle: DfyArticleResult | null,
    nextPosts: DfyFacebookPost[],
    nextContext: { productName: string; productContext: string; niche: string },
    nextUsedFallbackLink: boolean,
  ) => {
    const name = kitName.trim()
    if (!name || !isValidAffiliateUrl(affiliateUrl)) return

    const result = await upsertPremiumGenerationSet({
      feature: "dfy_profit",
      name,
      affiliateUrl,
      niche: nextContext.niche || niche,
      payload: {
        offerName: productNameInput,
        productName: nextContext.productName,
        productContext: nextContext.productContext,
        videos: nextVideos,
        article: nextArticle,
        posts: nextPosts,
        usedFallbackLink: nextUsedFallbackLink,
      },
    })

    if (!result.success) {
      setLibraryError(result.error)
      setLibraryOpen(true)
      return
    }

    setLibrarySets((prev) => {
      const without = prev.filter(
        (set) => set.id !== result.set.id && set.name.trim().toLowerCase() !== name.toLowerCase(),
      )
      return [result.set, ...without]
    })
    setActiveSetId(result.set.id)
    setUsedKeys(result.set.usedKeys)
    setLibraryOpen(true)
    setOpenLibraryId(result.set.id)
    setLibraryError("")
  }

  const restoreSet = (set: PremiumGenerationSet) => {
    const kit = parseDfySavedKit(set.payload)
    setAffiliateUrl(set.affiliateUrl)
    setProductNameInput(kit.offerName || kit.productName)
    setKitName(set.name)
    setNameTouched(true)
    setNiche(set.niche)
    setVideos(kit.videos)
    setArticle(kit.article)
    setPosts(kit.posts)
    setUsedFallbackLink(kit.usedFallbackLink)
    setContext({
      productName: kit.productName,
      productContext: kit.productContext,
      niche: set.niche,
    })
    setArticleError("")
    setPostsError("")
    setStage("done")
    setActiveSetId(set.id)
    setUsedKeys(set.usedKeys)
  }

  const handleCopy = (id: string, text: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleMarkUsed = async (itemKey: string, setId = activeSetId) => {
    if (!setId) return
    setMarkingKey(itemKey)
    setLibraryError("")
    const result = await markPremiumGenerationItemUsed(setId, itemKey)
    setMarkingKey(null)
    if (!result.success) {
      setLibraryError(result.error)
      return
    }
    setLibrarySets((prev) => prev.map((set) => (set.id === result.set.id ? result.set : set)))
    if (activeSetId === result.set.id) setUsedKeys(result.set.usedKeys)
  }

  const handleDeleteSet = async (setId: string) => {
    setDeletingId(setId)
    setLibraryError("")
    const result = await deletePremiumGenerationSet(setId)
    setDeletingId(null)
    if (!result.success) {
      setLibraryError(result.error)
      return
    }
    setLibrarySets((prev) => prev.filter((set) => set.id !== setId))
    if (openLibraryId === setId) setOpenLibraryId(null)
    if (activeSetId === setId) {
      setActiveSetId(null)
      setUsedKeys({})
    }
  }

  const runArticle = async (ctx: { productName: string; productContext: string; niche: string }) => {
    const response = await fetch("/api/premium/dfy-profit/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ affiliateUrl, ...ctx }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Article generation failed")
    return data as DfyArticleResult
  }

  const runPosts = async (ctx: { productName: string; niche: string }, articleUrl: string | null) => {
    const response = await fetch("/api/premium/dfy-profit/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ affiliateUrl, articleUrl: articleUrl ?? undefined, ...ctx }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Facebook post generation failed")
    return data as { posts: DfyFacebookPost[]; usedFallbackLink: boolean }
  }

  const handleGenerate = async () => {
    if (!isValidAffiliateUrl(affiliateUrl)) {
      setError("Enter a valid affiliate URL starting with https://")
      return
    }
    if (!niche) {
      setError("Pick a niche first.")
      return
    }
    if (!kitName.trim()) {
      setError("Add a name for this kit so we can save it in your library.")
      return
    }

    setError("")
    setArticleError("")
    setPostsError("")
    setVideos([])
    setArticle(null)
    setPosts([])
    setStage("videos")

    let ctx = { productName: "", productContext: "", niche }
    let nextVideos: DfyVideoResult[] = []

    try {
      const response = await fetch("/api/premium/dfy-profit/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateUrl,
          niche,
          offerName: productNameInput.trim() || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Video search failed")

      nextVideos = data.videos
      setVideos(data.videos)
      ctx = { productName: data.productName, productContext: data.productContext, niche: data.niche }
      setContext(ctx)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video search failed")
      setStage("idle")
      return
    }

    setStage("article")
    let nextArticle: DfyArticleResult | null = null
    let articleUrl: string | null = null
    try {
      const result = await runArticle(ctx)
      nextArticle = result
      setArticle(result)
      articleUrl = result.url
    } catch (e) {
      setArticleError(e instanceof Error ? e.message : "Article generation failed")
    }

    setStage("posts")
    let nextPosts: DfyFacebookPost[] = []
    let nextUsedFallbackLink = false
    try {
      const result = await runPosts({ productName: ctx.productName, niche: ctx.niche }, articleUrl)
      nextPosts = result.posts
      nextUsedFallbackLink = result.usedFallbackLink
      setPosts(result.posts)
      setUsedFallbackLink(result.usedFallbackLink)
    } catch (e) {
      setPostsError(e instanceof Error ? e.message : "Facebook post generation failed")
    }

    setStage("done")
    await persistKit(nextVideos, nextArticle, nextPosts, ctx, nextUsedFallbackLink)
  }

  const handleRetryArticle = async () => {
    setArticleError("")
    setRetryingArticle(true)
    try {
      const result = await runArticle(context)
      setArticle(result)
      await persistKit(videos, result, posts, context, usedFallbackLink)
    } catch (e) {
      setArticleError(e instanceof Error ? e.message : "Article generation failed")
    } finally {
      setRetryingArticle(false)
    }
  }

  const handleRetryPosts = async () => {
    setPostsError("")
    setRetryingPosts(true)
    try {
      const result = await runPosts(
        { productName: context.productName, niche: context.niche },
        article?.url ?? null,
      )
      setPosts(result.posts)
      setUsedFallbackLink(result.usedFallbackLink)
      await persistKit(videos, article, result.posts, context, result.usedFallbackLink)
    } catch (e) {
      setPostsError(e instanceof Error ? e.message : "Facebook post generation failed")
    } finally {
      setRetryingPosts(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Button asChild variant="ghost" className="mb-6 border border-primary/60 text-primary hover:border-primary hover:bg-primary/10 hover:text-accent">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-6 rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/10 to-primary/10 p-8 text-center md:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary shadow-lg shadow-secondary/50">
            <Package className="h-12 w-12 text-primary-foreground" />
          </div>
          <div>
            <h1 className="mb-4 text-4xl font-black text-foreground lg:text-6xl">Done-For-You Profit</h1>
            <p className="mb-4 text-xl font-bold text-accent md:text-2xl">One link, one niche, one promo kit</p>
            <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-muted-foreground md:text-xl">
              Paste your affiliate link, pick a niche, and get 5 videos to comment on, a hosted authority article, and
              Facebook posts in one run.
            </p>
          </div>
        </div>

        <Card highlighted className="overflow-hidden border-secondary/30 glass-strong glow-violet shadow-2xl">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-black">
              {!isVideoPlaying ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background to-muted">
                  <iframe
                    src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { background: true })}
                    title="Done-For-You Profit preview"
                    allow="autoplay; fullscreen; picture-in-picture"
                    className="pointer-events-none absolute inset-0 h-full w-full border-0"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <Button
                    size="lg"
                    onClick={() => setIsVideoPlaying(true)}
                    className="relative z-10 h-24 w-24 rounded-full border-4 border-primary/30 bg-primary text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-primary"
                  >
                    <Play className="ml-1 h-12 w-12 fill-primary-foreground" />
                  </Button>
                </div>
              ) : (
                <iframe
                  src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { autoplay: true })}
                  title="Done-For-You Profit training video"
                  allow="autoplay; fullscreen; picture-in-picture"
                  className="absolute inset-0 h-full w-full border-0"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.num} className="border-border bg-card">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">Step {step.num}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <SavedGenerationsLibrary
          title="Saved kits"
          subtitle="Each generation is saved under the kit name you enter. Same name updates that kit."
          emptyTitle="No saved kits yet"
          emptyHint="Generate a kit with a name to start your library."
          sets={librarySets}
          libraryOpen={libraryOpen}
          onLibraryOpenChange={setLibraryOpen}
          openSetId={openLibraryId}
          onOpenSetIdChange={(id) => {
            setOpenLibraryId(id)
            if (id) {
              const match = librarySets.find((set) => set.id === id)
              if (match) restoreSet(match)
            }
          }}
          deletingId={deletingId}
          error={libraryError}
          onDelete={(id) => void handleDeleteSet(id)}
          metaForSet={(set) =>
            `${set.niche || "Kit"} · ${summarizeDfyKit(set.payload)} · ${new Date(set.updatedAt).toLocaleDateString()}`
          }
          renderSet={(set) => {
            const kit = parseDfySavedKit(set.payload)
            return (
              <div className="space-y-3">
                <Button type="button" onClick={() => restoreSet(set)} className="h-10 w-full bg-primary text-sm text-primary-foreground">
                  Open this kit
                </Button>
                {kit.posts.map((post, index) => {
                  const copyKey = `${set.id}-${post.id}`
                  const itemKey = postUsedKey(post.id)
                  const isUsed = Boolean(set.usedKeys[itemKey])
                  return (
                    <div
                      key={post.id}
                      className={cn(
                        "rounded-xl border border-border bg-card p-4",
                        isUsed && "border-green-500/40 bg-green-500/10",
                      )}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Post #{index + 1}</p>
                        {isUsed ? <UsedBadge /> : null}
                      </div>
                      <p className={cn("whitespace-pre-wrap text-sm leading-relaxed text-foreground", isUsed && "text-muted-foreground")}>
                        {post.body}
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <Button type="button" onClick={() => handleCopy(copyKey, post.body)} className="h-10 flex-1 text-sm">
                          {copiedId === copyKey ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy this post
                            </>
                          )}
                        </Button>
                        <MarkAsUsedButton
                          used={isUsed}
                          marking={markingKey === itemKey}
                          onClick={() => void handleMarkUsed(itemKey, set.id)}
                        />
                      </div>
                    </div>
                  )
                })}
                {kit.videos.map((video) => (
                  <div key={video.videoId} className="rounded-xl border border-border bg-card p-4">
                    <p className="truncate text-sm font-semibold text-foreground">{video.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{video.channelTitle}</p>
                    <div className="mt-3 space-y-2">
                      {video.comments.map((comment, index) => {
                        const itemKey = commentUsedKey(video.videoId, index)
                        const isUsed = Boolean(set.usedKeys[itemKey])
                        const copyKey = `${set.id}-${itemKey}`
                        return (
                          <div
                            key={itemKey}
                            className={cn(
                              "rounded-lg border border-border p-3",
                              isUsed && "border-green-500/40 bg-green-500/10",
                            )}
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                                Comment {index + 1}
                              </span>
                              {isUsed ? <UsedBadge /> : null}
                            </div>
                            <p className={cn("text-sm leading-relaxed text-foreground", isUsed && "text-muted-foreground")}>
                              {comment}
                            </p>
                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                              <Button type="button" onClick={() => handleCopy(copyKey, comment)} className="h-10 flex-1 text-sm">
                                {copiedId === copyKey ? "Copied" : "Copy"}
                              </Button>
                              <MarkAsUsedButton
                                used={isUsed}
                                marking={markingKey === itemKey}
                                onClick={() => void handleMarkUsed(itemKey, set.id)}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )
          }}
        />

        <Card className="border-secondary/30">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Generate your kit</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                One click creates 5 comment-ready videos, a hosted authority article, and Facebook posts.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dfy-profit-affiliate-link">Affiliate link</Label>
              <Input
                id="dfy-profit-affiliate-link"
                type="url"
                value={affiliateUrl}
                onChange={(event) => {
                  setAffiliateUrl(event.target.value)
                  setError("")
                }}
                placeholder="https://..."
                disabled={generating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dfy-profit-product-name">Product name (optional)</Label>
              <Input
                id="dfy-profit-product-name"
                value={productNameInput}
                onChange={(event) => {
                  setProductNameInput(event.target.value)
                  setError("")
                }}
                placeholder="Skip the page scrape if you already know the offer"
                disabled={generating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dfy-profit-kit-name">Kit name</Label>
              <Input
                id="dfy-profit-kit-name"
                value={kitName}
                onChange={(event) => {
                  setNameTouched(true)
                  setKitName(event.target.value)
                  setError("")
                }}
                placeholder="e.g. Weight Loss offer"
                disabled={generating}
              />
              <p className="text-xs text-muted-foreground">
                Saved kits use this name. Generating again with the same name updates that kit.
              </p>
            </div>

            <fieldset>
              <legend className="mb-3 text-sm font-medium text-foreground">Niche</legend>
              <div className="flex flex-wrap gap-2">
                {NICHES.map((option) => {
                  const selected = niche === option
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={generating}
                      aria-pressed={selected}
                      onClick={() => setNiche(option)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all disabled:opacity-50",
                        selected
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "border border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground",
                      )}
                    >
                      {selected ? <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.75} aria-hidden /> : null}
                      {option}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {error ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/15 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </div>
            ) : null}

            <Button
              type="button"
              disabled={generating}
              onClick={() => void handleGenerate()}
              className="h-11 bg-primary text-primary-foreground"
            >
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {generating ? "Generating…" : videos.length > 0 ? "Generate another kit" : "Generate kit"}
            </Button>

            {generating ? (
              <p className="inline-flex items-center gap-2 text-sm font-medium text-accent">
                <Loader2 className="h-4 w-4 animate-spin" />
                {STAGE_LABELS[stage as Exclude<Stage, "idle" | "done">]}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <DfyResultPanel
          niche={context.niche || niche}
          videos={videos}
          article={article}
          posts={posts}
          articleError={articleError}
          postsError={postsError}
          usedFallbackLink={usedFallbackLink}
          isGeneratingArticle={stage === "article"}
          isGeneratingPosts={stage === "posts"}
          retryingArticle={retryingArticle}
          retryingPosts={retryingPosts}
          onRetryArticle={() => void handleRetryArticle()}
          onRetryPosts={() => void handleRetryPosts()}
          usedKeys={usedKeys}
          markingKey={markingKey}
          onMarkUsed={activeSetId ? (itemKey) => void handleMarkUsed(itemKey) : undefined}
        />

        <p className="pb-4 text-center text-sm text-muted-foreground">
          Hosted articles appear in Your Pages. Individual results vary.
        </p>
      </div>
    </div>
  )
}
