"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FolderOpen,
  Loader2,
  Package,
  Play,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { markPageKitPostUsed } from "@/app/actions/page-kit"
import { isValidAffiliateUrl } from "@/lib/affiliate-url"
import type { DfyArticleResult, DfyFacebookPost, DfyProfitPageResult } from "@/lib/dfy-profit/types"
import { vimeoPlayerUrl } from "@/lib/training-videos"
import { cn } from "@/lib/utils"
import { DfyResultPanel } from "./dfy-result-panel"

const NICHES = [
  "Health & Wellness",
  "Finance & Investing",
  "Fitness & Sports",
  "Digital Marketing",
  "Self-Help & Personal Development",
  "Beauty & Skincare",
  "Education & Learning",
  "Business & Entrepreneurship",
  "Travel & Lifestyle",
]

const BENEFITS = [
  "Hosted profit page",
  "Authority article",
  "3 Facebook posts",
  "Saved in Your Pages",
] as const

const STEPS = [
  {
    num: "1",
    title: "Add your link",
    desc: "Paste an affiliate URL or add a product name if you already know it.",
  },
  {
    num: "2",
    title: "Pick a niche",
    desc: "Choose the niche so your profit page, article, and posts stay on-brand.",
  },
  {
    num: "3",
    title: "Generate your kit",
    desc: "We build a profit page, write an authority article, and draft Facebook posts.",
  },
] as const

const GENERATION_STEPS = [
  "Building your profit page",
  "Writing your authority article",
  "Drafting Facebook posts",
] as const

type Stage = "idle" | "page" | "article" | "posts" | "done"

const TRAINING_VIMEO_ID = "1226577445"

export function DfyProfitContent() {
  const [affiliateUrl, setAffiliateUrl] = useState("")
  const [productNameInput, setProductNameInput] = useState("")
  const [niche, setNiche] = useState("")
  const [stage, setStage] = useState<Stage>("idle")
  const [error, setError] = useState("")
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const [profitPage, setProfitPage] = useState<DfyProfitPageResult | null>(null)
  const [article, setArticle] = useState<DfyArticleResult | null>(null)
  const [posts, setPosts] = useState<DfyFacebookPost[]>([])
  const [articleError, setArticleError] = useState("")
  const [postsError, setPostsError] = useState("")
  const [context, setContext] = useState({ productName: "", productContext: "", niche: "" })
  const [retryingArticle, setRetryingArticle] = useState(false)
  const [retryingPosts, setRetryingPosts] = useState(false)
  const [markingKey, setMarkingKey] = useState<string | null>(null)
  const [usedKeys, setUsedKeys] = useState<Record<string, string>>({})

  const generating = stage === "page" || stage === "article" || stage === "posts"

  const activeStepIndex =
    stage === "page" ? 0 : stage === "article" ? 1 : stage === "posts" ? 2 : stage === "done" ? 3 : -1

  const runArticle = async (
    pageId: string,
    ctx: { productName: string; productContext: string; niche: string },
  ) => {
    const response = await fetch("/api/premium/dfy-profit/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, ...ctx }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Article generation failed")
    return data as DfyArticleResult
  }

  const runPosts = async (
    pageId: string,
    promoLink: string,
    ctx: { productName: string; niche: string },
  ) => {
    const response = await fetch("/api/premium/dfy-profit/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, promoLink, ...ctx }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Facebook post generation failed")
    return data as { posts: DfyFacebookPost[] }
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

    setError("")
    setArticleError("")
    setPostsError("")
    setProfitPage(null)
    setArticle(null)
    setPosts([])
    setUsedKeys({})
    setStage("page")

    let nextPage: DfyProfitPageResult | null = null
    let ctx = { productName: "", productContext: "", niche }

    try {
      const response = await fetch("/api/premium/dfy-profit/page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateUrl,
          niche,
          offerName: productNameInput.trim() || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Profit page generation failed")

      nextPage = data as DfyProfitPageResult
      setProfitPage(nextPage)
      ctx = {
        productName: nextPage.productName,
        productContext: nextPage.productContext,
        niche: nextPage.niche,
      }
      setContext(ctx)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Profit page generation failed")
      setStage("idle")
      return
    }

    setStage("article")
    try {
      const result = await runArticle(nextPage.pageId, ctx)
      setArticle(result)
    } catch (e) {
      setArticleError(e instanceof Error ? e.message : "Article generation failed")
    }

    setStage("posts")
    try {
      const result = await runPosts(nextPage.pageId, nextPage.url, {
        productName: ctx.productName,
        niche: ctx.niche,
      })
      setPosts(result.posts)
    } catch (e) {
      setPostsError(e instanceof Error ? e.message : "Facebook post generation failed")
    }

    setStage("done")
  }

  const handleRetryArticle = async () => {
    if (!profitPage) return
    setArticleError("")
    setRetryingArticle(true)
    try {
      const result = await runArticle(profitPage.pageId, context)
      setArticle(result)
    } catch (e) {
      setArticleError(e instanceof Error ? e.message : "Article generation failed")
    } finally {
      setRetryingArticle(false)
    }
  }

  const handleRetryPosts = async () => {
    if (!profitPage) return
    setPostsError("")
    setRetryingPosts(true)
    try {
      const result = await runPosts(profitPage.pageId, profitPage.url, {
        productName: context.productName,
        niche: context.niche,
      })
      setPosts(result.posts)
    } catch (e) {
      setPostsError(e instanceof Error ? e.message : "Facebook post generation failed")
    } finally {
      setRetryingPosts(false)
    }
  }

  const handleMarkUsed = async (itemKey: string) => {
    if (!profitPage) return
    const postId = itemKey.startsWith("post:") ? itemKey.slice(5) : itemKey
    setMarkingKey(itemKey)
    const result = await markPageKitPostUsed(profitPage.pageId, postId)
    setMarkingKey(null)
    if (!result.success) {
      setError(result.error)
      return
    }
    setUsedKeys(result.kit.usedKeys)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Button
        asChild
        variant="ghost"
        className="border border-primary/60 text-primary hover:border-primary hover:bg-primary/10 hover:text-accent"
      >
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="space-y-8">
        <div className="space-y-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-secondary/10 p-8 text-center md:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/40">
            <Package className="h-12 w-12 text-primary-foreground" />
          </div>
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-primary">Premium</p>
            <h1 className="mb-4 text-4xl font-black tracking-tight text-foreground lg:text-6xl">
              Done-For-You Profit
            </h1>
            <p className="mb-4 text-xl font-bold text-accent md:text-2xl">One link, one niche, one promo kit</p>
            <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-muted-foreground md:text-xl">
              Paste your affiliate link, pick a niche, and get a hosted profit page, an authority article, and Facebook
              posts — all saved in Your Pages.
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
        </div>

        <Card highlighted className="overflow-hidden border-primary/20 glass-strong">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
              <div className="relative aspect-video bg-black">
                {!isVideoPlaying ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
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
                      className="relative z-10 h-24 w-24 rounded-full border-4 border-primary/40 text-primary-foreground shadow-[0_0_24px_rgba(207,161,59,0.45)] transition-all duration-300 hover:scale-110"
                    >
                      <Play className="ml-1 h-12 w-12 fill-white" />
                    </Button>
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <p className="text-xl font-black text-white drop-shadow-lg">Watch DFY Profit Tutorial</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { autoplay: true })}
                    title="Done-For-You Profit training video"
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
                <h2 className="text-3xl font-black text-foreground">How to Use Done-For-You Profit</h2>
                <p className="text-lg font-semibold leading-relaxed text-muted-foreground">
                  Paste your link, pick a niche, then generate a full kit — profit page, article, and posts — saved to
                  Your Pages.
                </p>
                <ul className="space-y-2">
                  {[
                    "One click builds the whole kit",
                    "Profit page gets a live shareable URL",
                    "Open Your Pages anytime for the full details",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm font-semibold text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 glass-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-black text-foreground">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              Three steps to your kit
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
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Generate your kit</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                One click creates a hosted profit page, an authority article, and Facebook posts.
              </p>
            </div>

            {!generating ? (
              <>
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
                  />
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
                          aria-pressed={selected}
                          onClick={() => setNiche(option)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                            selected
                              ? "border-primary bg-primary text-primary-foreground shadow-[0_6px_18px_rgba(207,161,59,0.28)]"
                              : "border-border bg-white/[0.03] text-foreground hover:border-primary/40 hover:bg-primary/10",
                          )}
                        >
                          {selected ? <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.75} aria-hidden /> : null}
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              </>
            ) : null}

            {generating ? (
              <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="font-bold text-foreground">Building your kit</p>
                    <p className="text-sm text-muted-foreground">
                      This usually takes a little while — we&apos;ll move you forward as each piece is ready.
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5">
                  {GENERATION_STEPS.map((step, index) => {
                    const isDone = activeStepIndex > index
                    const isCurrent = activeStepIndex === index

                    return (
                      <li
                        key={step}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                          isDone && "border-primary/25 bg-primary/10",
                          isCurrent && "border-primary/40 bg-primary/5",
                          !isDone && !isCurrent && "border-border/30 bg-background/20",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                            isDone && "bg-primary text-primary-foreground",
                            isCurrent && "bg-primary/20 text-primary",
                            !isDone && !isCurrent && "bg-muted text-muted-foreground",
                          )}
                        >
                          {isDone ? (
                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                          ) : isCurrent ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <span className="text-[10px] font-bold">{index + 1}</span>
                          )}
                        </span>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isDone || isCurrent ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {step}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-1/3 animate-[progress-slide_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary to-accent" />
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/15 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </div>
            ) : null}

            {!generating ? (
              <Button
                type="button"
                disabled={generating}
                onClick={() => void handleGenerate()}
                className="h-11 bg-primary text-primary-foreground"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {profitPage ? "Generate another kit" : "Generate kit"}
              </Button>
            ) : null}

            {stage === "done" && profitPage ? (
              <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <FolderOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Saved to Your Pages</p>
                    <p className="text-sm text-muted-foreground">
                      Open the page details anytime to view the live URL, article, and Facebook posts.
                    </p>
                  </div>
                </div>
                <Button asChild className="h-10 shrink-0">
                  <Link href={`/pages/${profitPage.pageId}`}>View page details</Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <DfyResultPanel
          niche={context.niche || niche}
          profitPage={profitPage}
          article={article}
          posts={posts}
          articleError={articleError}
          postsError={postsError}
          isGeneratingPage={stage === "page"}
          isGeneratingArticle={stage === "article"}
          isGeneratingPosts={stage === "posts"}
          retryingArticle={retryingArticle}
          retryingPosts={retryingPosts}
          onRetryArticle={() => void handleRetryArticle()}
          onRetryPosts={() => void handleRetryPosts()}
          usedKeys={usedKeys}
          markingKey={markingKey}
          onMarkUsed={profitPage ? (itemKey) => void handleMarkUsed(itemKey) : undefined}
        />

        <p className="pb-4 text-center text-sm text-muted-foreground">Kits are saved in Your Pages.</p>
      </div>
    </div>
  )
}
