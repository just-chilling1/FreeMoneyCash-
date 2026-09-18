import type { ArticleAngle } from "@/lib/high-ticket-payouts/article-content"
import type { GeneratedArticleContent } from "./types"

export interface ArticlePromptInput {
  productName: string
  productContext: string
  niche: string
}

export interface AuthorityArticlePromptInput {
  topic: string
  territory: string
  hobby: string
  angle: ArticleAngle
  productContext?: string
  affiliateContext?: string
}

const MIN_AUTHORITY_WORDS = 1000

const ARTICLE_JSON_EXAMPLE = `{
  "title": "Best Online Dog Training Courses for Reactive Dogs (2026 Guide)",
  "excerpt": "Two sentences that preview the buyer benefit and mention the TERRITORY product or niche keyword.",
  "metaDescription": "Under 155 chars. Primary keyword near the start. Clear benefit.",
  "html": "<p>Opening hook...</p><h2>How we'd evaluate these</h2><p>...<a href=\\"#offer\\">the program we recommend starting with</a>...</p><h2>...</h2><ul><li>...</li></ul>"
}`

const ARTICLE_SYSTEM_PROMPT = `You are a senior SEO affiliate editor publishing buyer-intent content for a niche money site in 2026.

Goals:
- Match the search intent of the article angle (guide, comparison, mistakes, budget, review, how-to).
- Demonstrate E-E-A-T, with EXPERIENCE leading: write as someone who has actually used/tested products in this niche. Use concrete, first-hand-sounding observations ("in our testing", "what we noticed after a few weeks", "the thing reviews rarely mention"), specific criteria, numbers/ranges, trade-offs, and an honest balance of pros and cons.
- Write for humans first; optimize naturally for Google (primary keyword in title, intro, one H2, and meta — never stuffed or repeated).
- Sound like a knowledgeable enthusiast helping a friend buy — not a spammy sales page.

Affiliate linking (IMPORTANT):
- Include EXACTLY ONE inline recommendation link inside a body paragraph (ideally just after the first H2), written as natural prose where you'd genuinely point a reader to the product.
- That link MUST use href="#offer" as a placeholder (the app swaps in the real tracked URL).
- The anchor text must be descriptive and natural (3-7 words, e.g. "the starter kit we recommend"). NEVER use "click here", "buy now", or a raw URL as anchor text.
- Do NOT add any other links, banners, buttons, affiliate disclosures, or a closing CTA — the app appends the final CTA automatically.

Hard rules:
- Stay strictly inside the TERRITORY niche. Do not drift into generic hobby content.
- The title MUST name the TERRITORY product or niche. NEVER reuse unrelated example titles (chess sets, pool chemicals, crypto nodes, etc.) unless that is literally the territory.
- Read the product context carefully: "AlgePrime" is an algebra video course, NOT a pool algaecide. "EchoXen" is a hearing supplement, NOT a tech node or crypto project.
- Do NOT invent specific brand names, exact prices, or URLs unless they appear in the product context. Use realistic ranges and use-cases instead.
- Do NOT use <h1> (the page template supplies the title).
- Do NOT use markdown, code fences, or commentary outside JSON.
- Return ONLY valid JSON with keys: title, excerpt, metaDescription, html.`

const ANGLE_INSTRUCTIONS: Record<ArticleAngle, string> = {
  "pillar-guide": `Article type: PILLAR comprehensive buyer's guide.
Search intent: informational + commercial investigation.
Structure: intro (problem + who this is for) → how to evaluate → top criteria checklist → buying tips → short FAQ (2-3 questions in prose).
Include a comparison-style bullet list of 3-5 evaluation criteria.`,
  "best-picks": `Article type: "Best picks" comparison / listicle.
Search intent: commercial — reader wants options ranked by use case.
Structure: intro → 3-5 picks described by USE CASE (not fake brands unless in product context) → quick comparison table in HTML using <table> → who each pick is best for.
End with "how to choose" summary.`,
  mistakes: `Article type: mistakes to avoid.
Search intent: problem-aware — reader wants to not waste money.
Structure: intro → 5-7 specific mistakes (each as <h2> or strong subhead in a list) → how to fix each → prevention checklist.
Tone: helpful warning, not fear-mongering.`,
  budget: `Article type: budget buyer guide.
Search intent: price-sensitive commercial.
Structure: intro → what to prioritize at low budget vs what to skip → realistic price tiers (ranges, not fake exact prices) → DIY/maintenance tips that save money.
Mention value-for-money criteria explicitly.`,
  "pro-tips": `Article type: pro tips / advanced tactics.
Search intent: informational — reader already interested, wants edge-case advice.
Structure: intro → 6-8 actionable tips (specific, niche-relevant) → common advanced pitfalls → quick recap.
Avoid repeating basic beginner content.`,
  "worth-it": `Article type: "Is it worth it?" honest review.
Search intent: decision stage — pros/cons before buying.
Structure: intro → who it IS for / who should skip → pros (bulleted) → cons (bulleted) → verdict section with clear recommendation framework (not hype).
Be balanced and credible.`,
  beginners: `Article type: step-by-step beginner guide.
Search intent: how-to + getting started.
Structure: intro → what you need before starting → numbered steps (clear order) → first-week checklist → next steps.
Keep jargon defined in plain language.`,
}

/** Cluster topic used by Blackbox DFY Profit: first pillar from buildClusterTopics. */
export function buildDfyArticleTopic(productName: string, niche: string): AuthorityArticlePromptInput {
  const territory = productName.trim() || niche.trim()
  const hobby = niche.trim() || territory
  return {
    topic: `${territory}: The Complete Buyer's Guide`,
    territory,
    hobby,
    angle: "pillar-guide",
  }
}

export function buildAuthorityArticlePrompt(input: AuthorityArticlePromptInput): string {
  const parts = [
    ARTICLE_SYSTEM_PROMPT,
    "",
    `TERRITORY (exact niche — every paragraph must relate to this): ${input.territory}`,
    `Article headline angle: ${input.topic}`,
    `Broad category: ${input.hobby}`,
    "",
    ANGLE_INSTRUCTIONS[input.angle],
    "",
    "Output requirements:",
    `- html: 1,500-2,500 words of evergreen authority content.`,
    "- Structure (required): introduction (100-200 words) → optional table of contents → 4-6 major <h2> sections with <h3> subsections → <h2>Frequently Asked Questions</h2> with 5-8 <h3> Q&A pairs → <h2>Conclusion</h2> → final CTA paragraph.",
    "- Primary keyword in title, first 100 words, one H2, and conclusion. Use secondary keywords naturally.",
    "- Short paragraphs (2-4 lines), bullet/numbered lists, tables when comparing, blockquotes for tips.",
    "- Professional, helpful, authoritative tone. No clickbait or unsubstantiated claims.",
    '- Do NOT use <h1> (title is stored separately). Never skip heading levels.',
    "- Lead with experience: include at least two concrete, first-hand-sounding details and one honest trade-off or downside.",
    '- Exactly ONE inline link with href="#offer" and natural descriptive anchor text, placed in a body paragraph (no other links/CTAs).',
    "- title: compelling, names the TERRITORY product/niche (never chess, pool chemicals, or unrelated categories), max ~70 chars",
    "- excerpt: 2 sentences, buyer-focused, max 200 chars",
    "- metaDescription: max 155 chars, primary keyword in first half",
  ]

  if (input.productContext?.trim()) {
    parts.push(
      "",
      "Affiliate offer page context (real product details scraped from the offer — use for accuracy, weave in naturally, do not copy verbatim or fabricate beyond it):",
      input.productContext.trim(),
    )
  }

  if (input.affiliateContext?.trim()) {
    parts.push(
      "",
      "Armed offers (for topical alignment + the inline #offer link's intent — do NOT paste raw URLs in html):",
      input.affiliateContext.trim(),
    )
  }

  parts.push("", `Respond with JSON matching this shape:\n${ARTICLE_JSON_EXAMPLE}`)
  return parts.join("\n")
}

export function buildArticlePrompt(input: ArticlePromptInput): string {
  const topic = buildDfyArticleTopic(input.productName, input.niche)
  return buildAuthorityArticlePrompt({
    ...topic,
    productContext: input.productContext,
    affiliateContext: `${input.productName}: ${input.niche}`,
  })
}

export function buildFacebookPostsPrompt(input: {
  productName: string
  niche: string
  promoLink: string
  postCount: number
}): string {
  return `Write ${input.postCount} different Facebook posts promoting a helpful article.

NICHE: ${input.niche}
PRODUCT: ${input.productName}
LINK TO SHARE: ${input.promoLink}

REQUIREMENTS:
- Each post 50 to 90 words
- Written like a real person sharing something that helped them, not an ad
- Each post uses a different angle: a personal result, a warning about a common mistake, a curiosity hook
- Each post ends with the link exactly as given: ${input.promoLink}
- No hashtags, no emoji, no income guarantees

Reply with JSON only, no markdown fences, in exactly this shape:
{"posts": ["first post text", "second post text"]}`
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

/**
 * Validate an AI article payload. Returns null when it fails the authority bar,
 * which signals `generateStructuredJson` to retry. Mirrors Blackbox
 * `normalizeArticleContent` for contentTier "authority".
 */
export function normalizeArticleContent(
  raw: unknown,
  fallbackTitle: string,
  options?: { minWords?: number; requireFaq?: boolean },
): GeneratedArticleContent | null {
  if (!raw || typeof raw !== "object") return null

  const candidate = raw as Partial<GeneratedArticleContent> & { metaDescription?: string }
  if (!candidate.html?.trim() || !candidate.title?.trim()) return null

  let html = candidate.html.trim()
  html = html.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/i, "")
  html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, "")
  html = html.replace(/<p[^>]*class="affiliate-disclosure"[\s\S]*?<\/p>/gi, "")
  html = html.replace(/<p[^>]*>\s*<em>\s*Disclosure:[\s\S]*?<\/p>/gi, "")

  if (!/<h2/i.test(html)) {
    html = `<h2>Overview</h2>${html}`
  }

  const minWords = options?.minWords ?? MIN_AUTHORITY_WORDS
  const requireFaq = options?.requireFaq ?? true
  const plain = stripHtml(html)
  if (countWords(plain) < minWords) return null
  if (requireFaq && !/frequently asked questions|faq/i.test(html)) return null

  const title = candidate.title.trim().slice(0, 120) || fallbackTitle
  const excerpt =
    typeof candidate.excerpt === "string" && candidate.excerpt.trim()
      ? candidate.excerpt.trim().slice(0, 220)
      : `${plain.slice(0, 180).trim()}...`

  return { title, excerpt, html }
}
