"use client"

import { useCallback, useState } from "react"
import { Check, Copy, FileText, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DetailSection } from "@/components/detail-section"
import { MarkAsUsedButton, UsedBadge } from "@/components/mark-as-used-button"
import { markPageKitPostUsed } from "@/app/actions/page-kit"
import type { DfyPageKit, DfyPageKitArticle } from "@/lib/dfy-profit/page-kit"
import { postUsedKey } from "@/lib/generation-set-name"
import { sanitizeArticleHtml } from "@/lib/sanitize-html"
import { cn } from "@/lib/utils"

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

function htmlToText(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function sourceLabel(article: DfyPageKitArticle) {
  return article.source === "high_ticket" ? "High-Ticket" : "Done-For-You"
}

function ArticleCard({
  article,
  niche,
  defaultOpen,
  copiedId,
  onCopy,
}: {
  article: DfyPageKitArticle
  niche: string
  defaultOpen: boolean
  copiedId: string | null
  onCopy: (id: string, text: string) => void
}) {
  const textKey = `${article.id}-text`
  const htmlKey = `${article.id}-html`

  return (
    <DetailSection
      tone="accent"
      collapsible
      defaultOpen={defaultOpen}
      icon={<FileText className="h-5 w-5" aria-hidden />}
      title={article.title}
      description={
        article.excerpt
          ? article.excerpt
          : "Long-form guide with your offer woven in. Publish it on a blog or Medium."
      }
      bodyClassName="p-0"
      action={
        <span className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">
          {sourceLabel(article)}
        </span>
      }
    >
      <article className="overflow-hidden">
        <div className="border-b border-border/50 bg-accent/10 px-5 py-5 md:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
            {niche || sourceLabel(article)}
          </p>
          <h3 className="mt-1.5 text-xl font-bold leading-snug text-foreground md:text-2xl">{article.title}</h3>
          {article.excerpt ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
          ) : null}
        </div>
        <div
          className="article-body max-h-[min(70vh,720px)] max-w-none overflow-y-auto bg-card/40 px-5 py-6 md:px-8 md:py-8"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.html) }}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 bg-background/30 px-5 py-4 md:px-8">
          <p className="text-xs text-muted-foreground">Copy the plain text for social, or the HTML for your blog.</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void onCopy(textKey, `${article.title}\n\n${htmlToText(article.html)}`)}
              className={cn("h-10 px-4 text-sm", outlineCtaClass)}
            >
              {copiedId === textKey ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copiedId === textKey ? "Copied" : "Copy plain text"}
            </Button>
            <Button
              type="button"
              onClick={() => void onCopy(htmlKey, article.html)}
              className={cn("h-10 px-4 text-sm", primaryCtaClass)}
            >
              {copiedId === htmlKey ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copiedId === htmlKey ? "Copied" : "Copy HTML"}
            </Button>
          </div>
        </div>
      </article>
    </DetailSection>
  )
}

export function PageKitDetails({
  pageId,
  kit: initialKit,
}: {
  pageId: string
  kit: DfyPageKit
}) {
  const [kit, setKit] = useState(initialKit)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [markingKey, setMarkingKey] = useState<string | null>(null)
  const [error, setError] = useState("")

  const copyText = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      /* ignore */
    }
  }, [])

  const handleMarkUsed = async (postId: string) => {
    const itemKey = postUsedKey(postId)
    setMarkingKey(itemKey)
    setError("")
    const result = await markPageKitPostUsed(pageId, postId)
    setMarkingKey(null)
    if (!result.success) {
      setError(result.error)
      return
    }
    setKit(result.kit)
  }

  const articlesNewestFirst = [...kit.articles].sort((a, b) => {
    const aTime = Date.parse(a.savedAt) || 0
    const bTime = Date.parse(b.savedAt) || 0
    return bTime - aTime
  })

  return (
    <div className="space-y-4">
      {error ? (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {articlesNewestFirst.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-sm font-semibold text-foreground">
              Authority article{articlesNewestFirst.length === 1 ? "" : "s"}
            </p>
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold tabular-nums text-primary-foreground">
              {articlesNewestFirst.length}
            </span>
          </div>
          {articlesNewestFirst.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              niche={kit.niche}
              defaultOpen={index === 0}
              copiedId={copiedId}
              onCopy={(id, text) => void copyText(id, text)}
            />
          ))}
        </div>
      ) : null}

      {kit.posts.length > 0 ? (
        <DetailSection
          tone="primary"
          collapsible
          defaultOpen
          icon={<Megaphone className="h-5 w-5" aria-hidden />}
          title="Facebook posts"
          count={kit.posts.length}
          description={`${kit.posts.length} ready-to-copy variant${kit.posts.length === 1 ? "" : "s"}. Mark each one as used after posting.`}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {kit.posts.map((post, index) => {
              const itemKey = postUsedKey(post.id)
              const isUsed = Boolean(kit.usedKeys[itemKey])
              const accent = POST_ACCENTS[index % POST_ACCENTS.length]
              const copied = copiedId === post.id
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
                    <Button
                      type="button"
                      onClick={() => void copyText(post.id, post.body)}
                      className={cn("h-10 w-full px-3 text-sm", primaryCtaClass)}
                    >
                      {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <MarkAsUsedButton
                      used={isUsed}
                      marking={markingKey === itemKey}
                      onClick={() => void handleMarkUsed(post.id)}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </DetailSection>
      ) : null}
    </div>
  )
}
