import {
  buildAuthorityArticleContent,
  type ArticleAngle,
} from "@/lib/high-ticket-payouts/article-content"

export const HIGH_TICKET_ARTICLE_TARGET_COUNT = 100

export type NicheOption = {
  value: string
  label: string
}

export const NICHE_OPTIONS = [
  { value: "health", label: "Health & Wellness" },
  { value: "finance", label: "Finance & Investing" },
  { value: "fitness", label: "Fitness & Sports" },
  { value: "marketing", label: "Digital Marketing" },
  { value: "selfhelp", label: "Self-Help & Personal Development" },
  { value: "beauty", label: "Beauty & Skincare" },
  { value: "education", label: "Education & Learning" },
  { value: "business", label: "Business & Entrepreneurship" },
  { value: "travel", label: "Travel & Lifestyle" },
] as const satisfies readonly NicheOption[]

export type HighTicketArticle = {
  id: number
  templateKey: string
  niche: string
  nicheKey: string
  title: string
  slug: string
  html: string
  excerpt: string
  metaDescription: string
  angle: ArticleAngle
  wordCount: number
}

const ARTICLE_ANGLES: ArticleAngle[] = [
  "pillar-guide",
  "best-picks",
  "mistakes",
  "budget",
  "pro-tips",
  "worth-it",
  "beginners",
]

const TOPIC_TEMPLATES = [
  (n: string) => `${n}: The Complete Buyer's Guide`,
  (n: string) => `Best Picks for ${n}`,
  (n: string) => `7 Mistakes to Avoid With ${n}`,
  (n: string) => `${n} on a Budget — What Actually Works`,
  (n: string) => `Pro Tips: Getting Results With ${n}`,
  (n: string) => `Is ${n} Worth It? Honest Breakdown`,
  (n: string) => `${n} for Beginners — Step by Step`,
  (n: string) => `What to Look For Before You Buy ${n}`,
  (n: string) => `Top ${n} Strategies for First-Timers`,
  (n: string) => `Common ${n} Problems and How to Fix Them`,
  (n: string) => `${n} on a Tight Budget — Smart Choices`,
  (n: string) => `Advanced ${n} Tactics That Move the Needle`,
]

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

/** Build 100 authority article definitions — evenly distributed across all niches. */
export function buildArticleCatalog(): HighTicketArticle[] {
  const articles: HighTicketArticle[] = []
  const nicheCount = NICHE_OPTIONS.length
  const basePerNiche = Math.floor(HIGH_TICKET_ARTICLE_TARGET_COUNT / nicheCount)
  const remainder = HIGH_TICKET_ARTICLE_TARGET_COUNT % nicheCount

  let id = 1

  for (let nIdx = 0; nIdx < nicheCount; nIdx++) {
    const niche = NICHE_OPTIONS[nIdx]
    const articlesForNiche = basePerNiche + (nIdx < remainder ? 1 : 0)

    for (let t = 0; t < articlesForNiche; t++) {
      const title = TOPIC_TEMPLATES[t % TOPIC_TEMPLATES.length](niche.label)
      const angle = ARTICLE_ANGLES[t % ARTICLE_ANGLES.length]
      const content = buildAuthorityArticleContent({
        topic: title,
        territory: niche.label,
        hobby: niche.label,
        angle,
      })

      articles.push({
        id,
        templateKey: `high-ticket-${id}`,
        niche: niche.label,
        nicheKey: niche.value,
        title: content.title,
        slug: slugify(`${niche.value}-${title}-${id}`),
        html: content.html,
        excerpt: content.excerpt,
        metaDescription: content.metaDescription,
        angle,
        wordCount: content.wordCount,
      })
      id++
    }
  }

  return articles
}

/** Catalog built once at module load so the UI never regenerates 100 articles. */
export const ARTICLE_CATALOG = buildArticleCatalog()

export const HIGH_TICKET_NICHES = NICHE_OPTIONS.map((n) => n.label)

/** Swap inline offer placeholder with member affiliate link. */
export function weaveAffiliateLink(html: string, affiliateUrl: string): string {
  const url = affiliateUrl.trim()
  if (!url) return html
  return html
    .replace(/href="#offer"/g, `href="${url}"`)
    .replace(/\[AFFILIATE_LINK\]/g, url)
    .replace(/\[LINK\]/g, url)
}
