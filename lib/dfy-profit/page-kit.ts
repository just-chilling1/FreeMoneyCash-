import type { DfyArticleResult, DfyFacebookPost } from "@/lib/dfy-profit/types"

export const DFY_ARTICLE_ID = "dfy-article"

export type DfyPageKitArticleSource = "dfy_profit" | "high_ticket"

export type DfyPageKitArticle = DfyArticleResult & {
  id: string
  source: DfyPageKitArticleSource
  catalogId?: number
  savedAt: string
}

export type DfyPageKit = {
  source: "dfy_profit"
  version: 1
  niche: string
  productName: string
  productContext: string
  /** All saved articles (DFY + High-Ticket). */
  articles: DfyPageKitArticle[]
  /**
   * Derived DFY Profit article (the `dfy-article` entry), kept for callers that
   * still read `kit.article`.
   */
  article: DfyArticleResult | null
  posts: DfyFacebookPost[]
  usedKeys: Record<string, string>
  generatedAt: string
}

function asString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function parsePosts(raw: unknown): DfyFacebookPost[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const row = item as Record<string, unknown>
      const id = asString(row.id)
      const body = asString(row.body).trim()
      if (!id || !body) return null
      return { id, body }
    })
    .filter((p): p is DfyFacebookPost => p != null)
}

function parseArticleBody(raw: unknown): DfyArticleResult | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  const title = asString(row.title)
  const html = asString(row.html)
  if (!title || !html) return null
  return {
    title,
    excerpt: asString(row.excerpt),
    html,
  }
}

function parseArticleSource(raw: unknown): DfyPageKitArticleSource {
  return raw === "high_ticket" ? "high_ticket" : "dfy_profit"
}

function parseKitArticle(raw: unknown): DfyPageKitArticle | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  const body = parseArticleBody(raw)
  if (!body) return null
  const id = asString(row.id).trim() || (parseArticleSource(row.source) === "dfy_profit" ? DFY_ARTICLE_ID : "")
  if (!id) return null
  const catalogId =
    typeof row.catalogId === "number" && Number.isFinite(row.catalogId) ? row.catalogId : undefined
  return {
    id,
    source: parseArticleSource(row.source),
    catalogId,
    savedAt: asString(row.savedAt) || new Date().toISOString(),
    title: body.title,
    excerpt: body.excerpt,
    html: body.html,
  }
}

function parseArticles(raw: unknown, legacyArticle: unknown): DfyPageKitArticle[] {
  const fromArray = Array.isArray(raw)
    ? raw.map(parseKitArticle).filter((a): a is DfyPageKitArticle => a != null)
    : []

  const hasDfy = fromArray.some((a) => a.id === DFY_ARTICLE_ID || a.source === "dfy_profit")
  if (!hasDfy) {
    const legacy = parseArticleBody(legacyArticle)
    if (legacy) {
      fromArray.unshift({
        id: DFY_ARTICLE_ID,
        source: "dfy_profit",
        savedAt: new Date().toISOString(),
        ...legacy,
      })
    }
  }

  return fromArray
}

function deriveDfyArticle(articles: DfyPageKitArticle[]): DfyArticleResult | null {
  const dfy =
    articles.find((a) => a.id === DFY_ARTICLE_ID) ??
    articles.find((a) => a.source === "dfy_profit")
  if (!dfy) return null
  return { title: dfy.title, excerpt: dfy.excerpt, html: dfy.html }
}

function parseUsedKeys(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!key.trim() || typeof value !== "string" || !value.trim()) continue
    out[key] = value.trim()
  }
  return out
}

/** Upsert articles by id (later entries win). */
export function mergeKitArticles(
  existing: DfyPageKitArticle[],
  incoming: DfyPageKitArticle[],
): DfyPageKitArticle[] {
  const map = new Map<string, DfyPageKitArticle>()
  for (const article of existing) map.set(article.id, article)
  for (const article of incoming) map.set(article.id, article)
  return Array.from(map.values())
}

export function toDfyArticleEntry(article: DfyArticleResult, savedAt = new Date().toISOString()): DfyPageKitArticle {
  return {
    id: DFY_ARTICLE_ID,
    source: "dfy_profit",
    savedAt,
    title: article.title,
    excerpt: article.excerpt,
    html: article.html,
  }
}

export function highTicketArticleId(catalogId: number) {
  return `ht-${catalogId}`
}

/** Strip derived fields so only the persisted shape is written to JSONB. */
export function serializePageKit(kit: DfyPageKit): Omit<DfyPageKit, "article"> & { article?: undefined } {
  const { article: _derived, ...rest } = kit
  return rest
}

/** Returns a typed kit when `raw` is a DFY Profit kit object; otherwise null. */
export function parsePageKit(raw: unknown): DfyPageKit | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const row = raw as Record<string, unknown>
  if (row.source !== "dfy_profit") return null

  const articles = parseArticles(row.articles, row.article)

  return {
    source: "dfy_profit",
    version: 1,
    niche: asString(row.niche),
    productName: asString(row.productName),
    productContext: asString(row.productContext),
    articles,
    article: deriveDfyArticle(articles),
    posts: parsePosts(row.posts),
    usedKeys: parseUsedKeys(row.usedKeys),
    generatedAt: asString(row.generatedAt) || new Date().toISOString(),
  }
}

export function createEmptyPageKit(input: {
  niche: string
  productName: string
  productContext: string
}): DfyPageKit {
  return {
    source: "dfy_profit",
    version: 1,
    niche: input.niche,
    productName: input.productName,
    productContext: input.productContext,
    articles: [],
    article: null,
    posts: [],
    usedKeys: {},
    generatedAt: new Date().toISOString(),
  }
}

export function summarizePageKit(kit: DfyPageKit | null) {
  if (!kit) return "Profit page"
  const articleCount = kit.articles.length
  const parts = [
    articleCount === 0
      ? "no article"
      : `${articleCount} article${articleCount === 1 ? "" : "s"}`,
    `${kit.posts.length} post${kit.posts.length === 1 ? "" : "s"}`,
  ]
  return parts.join(" · ")
}
