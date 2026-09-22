"use client"

import { useCallback, useState } from "react"
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  LayoutTemplate,
  Loader2,
  Megaphone,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { KitSection } from "@/components/kit-section"
import { MarkAsUsedButton, UsedBadge } from "@/components/mark-as-used-button"
import type { DfyArticleResult, DfyFacebookPost, DfyProfitPageResult } from "@/lib/dfy-profit/types"
import { postUsedKey } from "@/lib/generation-set-name"
import { cn } from "@/lib/utils"
import { sanitizeArticleHtml } from "@/lib/sanitize-html"

const primaryCtaClass =
  "rounded-xl bg-primary font-medium text-primary-foreground shadow-md transition hover:bg-primary/90"

const outlineCtaClass =
  "rounded-xl border border-border bg-card font-medium text-foreground hover:border-primary hover:bg-primary/10"

const POST_ACCENTS = [
  {
    bar: "border-l-primary",
    chip: "bg-primary/20 text-primary",
    card: "bg-card",
  },
  {
    bar: "border-l-accent",
    chip: "bg-accent/25 text-accent-foreground",
    card: "bg-muted",
  },
  {
    bar: "border-l-secondary",
    chip: "bg-secondary/30 text-secondary-foreground",
    card: "bg-card",
  },
] as const

interface DfyResultPanelProps {
  niche: string
  profitPage: DfyProfitPageResult | null
  article: DfyArticleResult | null
  posts: DfyFacebookPost[]
  articleError: string
  postsError: string
  isGeneratingPage: boolean
  isGeneratingArticle: boolean
  isGeneratingPosts: boolean
  retryingArticle: boolean
  retryingPosts: boolean
  onRetryArticle: () => void
  onRetryPosts: () => void
  usedKeys?: Record<string, string>
  markingKey?: string | null
  onMarkUsed?: (itemKey: string) => void
}

function htmlToText(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function CopyButton({
  copied,
  onClick,
  label = "Copy",
  copiedLabel = "Copied",
  size = "sm",
}: {
  copied: boolean
  onClick: () => void
  label?: string
  copiedLabel?: string
  size?: "sm" | "md"
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full",
        size === "sm" ? "h-10 px-4 text-sm" : "h-11 px-4",
        copied ? "rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary" : primaryCtaClass,
      )}
    >
      {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
      {copied ? copiedLabel : label}
    </Button>
  )
}

export function DfyResultPanel({
  niche,
  profitPage,
  article,
  posts,
  articleError,
  postsError,
  isGeneratingPage,
  isGeneratingArticle,
  isGeneratingPosts,
  retryingArticle,
  retryingPosts,
  onRetryArticle,
  onRetryPosts,
  usedKeys = {},
  markingKey = null,
  onMarkUsed,
}: DfyResultPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyText = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      /* ignore */
    }
  }, [])

  const showAnything =
    profitPage ||
    article ||
    posts.length > 0 ||
    articleError ||
    postsError ||
    isGeneratingPage ||
    isGeneratingArticle ||
    isGeneratingPosts

  if (!showAnything) return null

  return (
    <section id="dfy-profit-results" className="scroll-mt-24 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Your Done-For-You kit</h2>

      <KitSection
        title="Your profit page"
        count={profitPage ? 1 : undefined}
        defaultOpen={isGeneratingPage || !!profitPage}
        tone="page"
      >
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-card px-3 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <LayoutTemplate className="h-[18px] w-[18px]" aria-hidden />
          </div>
          <p className="text-sm font-medium text-foreground">
            {isGeneratingPage
              ? "Building your niche profit page…"
              : profitPage
                ? "Hosted page with your affiliate link woven in."
                : "Your profit page will appear here."}
          </p>
        </div>

        {isGeneratingPage && !profitPage ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Writing and publishing your profit page…
          </p>
        ) : profitPage ? (
          <article className="overflow-hidden rounded-2xl border-2 border-primary/30 bg-card shadow-md">
            <div className="border-b border-border bg-primary/10 px-5 py-4 text-foreground md:px-6">
              <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-primary">
                {niche || profitPage.niche || "Profit page"}
              </p>
              <h3 className="mt-1 text-lg font-medium leading-snug text-foreground">{profitPage.title}</h3>
              <p className="mt-2 break-all text-sm text-muted-foreground">{profitPage.url}</p>
            </div>
            <div className="flex flex-wrap gap-2 px-5 py-4 md:px-6">
              <Button asChild className={cn("h-11 px-4", primaryCtaClass)}>
                <a href={profitPage.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open live page
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void copyText("page-url", profitPage.url)}
                className={cn("h-11 px-4", outlineCtaClass)}
              >
                {copiedId === "page-url" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copiedId === "page-url" ? "Copied" : "Copy URL"}
              </Button>
            </div>
          </article>
        ) : null}
      </KitSection>

      {isGeneratingArticle || retryingArticle || articleError || article || isGeneratingPage ? (
        <KitSection
          title="Authority article"
          count={article ? 1 : undefined}
          defaultOpen={isGeneratingArticle || retryingArticle || !!articleError || !!article}
          tone="neutral"
        >
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-accent">
              <FileText className="h-[18px] w-[18px]" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">
              {isGeneratingArticle || retryingArticle
                ? "Writing your authority article…"
                : articleError
                  ? "We couldn't finish your article."
                  : article
                    ? "Long-form guide stored with this kit (copy text or HTML)."
                    : "Your authority article will appear here."}
            </p>
          </div>

          {isGeneratingArticle || retryingArticle ? (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating a long-form guide with your offer woven in.
            </p>
          ) : articleError ? (
            <>
              <p className="text-sm font-medium text-destructive">{articleError}</p>
              <Button
                type="button"
                disabled={retryingArticle}
                onClick={onRetryArticle}
                variant="outline"
                className={cn("h-11 px-4 disabled:opacity-50", outlineCtaClass)}
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Retry article
              </Button>
            </>
          ) : article ? (
            <article className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-md">
              <div className="border-b border-border bg-secondary/20 px-5 py-4 text-foreground md:px-6">
                <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-accent">
                  {niche || "Authority article"}
                </p>
                <h3 className="mt-1 text-lg font-medium leading-snug text-foreground">{article.title}</h3>
                {article.excerpt ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
                ) : null}
              </div>
              <div
                className="article-body max-h-[min(70vh,720px)] max-w-none overflow-y-auto bg-card px-5 py-6 md:px-8 md:py-8"
                dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.html) }}
              />
              <div className="flex flex-wrap gap-2 border-t-2 border-border bg-muted px-5 py-4 md:px-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void copyText("article-text", `${article.title}\n\n${htmlToText(article.html)}`)}
                  className={cn("h-11 px-4", outlineCtaClass)}
                >
                  {copiedId === "article-text" ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copiedId === "article-text" ? "Copied" : "Copy plain text"}
                </Button>
                <Button
                  type="button"
                  onClick={() => void copyText("article-html", article.html)}
                  className={cn(
                    "h-11 px-4",
                    copiedId === "article-html"
                      ? "rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary"
                      : primaryCtaClass,
                  )}
                >
                  {copiedId === "article-html" ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copiedId === "article-html" ? "Copied" : "Copy HTML"}
                </Button>
              </div>
            </article>
          ) : null}
        </KitSection>
      ) : null}

      <KitSection
        title="Facebook posts"
        count={posts.length || undefined}
        defaultOpen={posts.length > 0 || isGeneratingPosts}
        tone="social"
      >
        <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-card px-3 py-3">
          <Megaphone className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
          <p className="text-sm font-medium text-foreground">
            {posts.length > 0
              ? `${posts.length} ready-to-copy variants`
              : postsError || "Your Facebook post variants will appear here."}
          </p>
        </div>

        {isGeneratingPosts && posts.length === 0 ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating Facebook posts…
          </p>
        ) : postsError && posts.length === 0 ? (
          <Button
            type="button"
            disabled={retryingPosts}
            onClick={onRetryPosts}
            variant="outline"
            className={cn("h-11 px-4 disabled:opacity-50", outlineCtaClass)}
          >
            {retryingPosts ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
            )}
            Retry Facebook posts
          </Button>
        ) : posts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((post, index) => {
              const copied = copiedId === post.id
              const accent = POST_ACCENTS[index % POST_ACCENTS.length]
              const itemKey = postUsedKey(post.id)
              const isUsed = Boolean(usedKeys[itemKey])
              return (
                <article
                  key={post.id}
                  className={cn(
                    "flex h-full flex-col gap-3 rounded-2xl border-2 border-border border-l-4 p-4 shadow-md",
                    accent.bar,
                    isUsed ? "border-primary/50 bg-primary/10" : accent.card,
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                        accent.chip,
                      )}
                    >
                      Variant {index + 1}
                    </p>
                    {isUsed ? <UsedBadge /> : null}
                  </div>
                  <p
                    className={cn(
                      "min-h-0 flex-1 whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground",
                      isUsed && "text-muted-foreground",
                    )}
                  >
                    {post.body}
                  </p>
                  <div className="mt-auto flex flex-col gap-2">
                    <CopyButton copied={copied} onClick={() => void copyText(post.id, post.body)} />
                    {onMarkUsed ? (
                      <MarkAsUsedButton
                        used={isUsed}
                        marking={markingKey === itemKey}
                        onClick={() => onMarkUsed(itemKey)}
                      />
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </KitSection>
    </section>
  )
}
