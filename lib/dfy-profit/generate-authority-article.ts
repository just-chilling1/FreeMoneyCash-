import { generateStructuredJson, isAiConfigured } from "./ai"
import { buildFallbackArticle } from "./article-fallback"
import {
  buildAuthorityArticlePrompt,
  buildDfyArticleTopic,
  normalizeArticleContent,
  type ArticlePromptInput,
} from "./prompts"
import { ARTICLE_BODY_CLASS } from "@/lib/high-ticket-payouts/article-content"
import {
  resolveNicheFeaturedImageUrl,
  replaceFeaturedImageUrl,
} from "@/lib/high-ticket-payouts/niche-images"
import type { GeneratedArticleContent } from "./types"

function wrapArticleBody(html: string): string {
  if (html.includes(`class="${ARTICLE_BODY_CLASS}"`)) return html
  return `<article class="${ARTICLE_BODY_CLASS}">\n${html}\n</article>`
}

/**
 * Generate a single authority-tier article for Done-For-You Profit.
 * Clones Blackbox `generateAuthorityArticleForSite`: pillar buyer-guide topic,
 * contentTier "authority" prompt, Recurring Stream template as the no-AI fallback.
 */
export async function generateAuthorityArticle(
  input: ArticlePromptInput & { affiliateUrl?: string },
): Promise<GeneratedArticleContent> {
  const topic = buildDfyArticleTopic(input.productName, input.niche)

  if (!isAiConfigured()) {
    return buildFallbackArticle(input)
  }

  try {
    const content = await generateStructuredJson<GeneratedArticleContent>({
      prompt: buildAuthorityArticlePrompt({
        ...topic,
        productContext: input.productContext,
        affiliateContext: input.affiliateUrl
          ? `${input.productName}: ${input.affiliateUrl}`
          : `${input.productName}: ${input.niche}`,
      }),
      validate: (raw) =>
        normalizeArticleContent(raw, topic.topic, { minWords: 1000, requireFaq: true }),
      options: { maxRetries: 4, timeoutMs: 45_000 },
    })
    let html = wrapArticleBody(content.html)
    const imageUrl = await resolveNicheFeaturedImageUrl(topic.hobby, content.title)
    if (/<img\b/i.test(html)) {
      html = replaceFeaturedImageUrl(html, imageUrl)
    } else {
      const alt = `${content.title} — featured guide for ${topic.hobby.toLowerCase()}`
      const figure = `<figure>\n<img src="${imageUrl}" alt="${alt}" width="1200" height="630" loading="lazy" />\n</figure>`
      html = html.replace(
        `<article class="${ARTICLE_BODY_CLASS}">`,
        `<article class="${ARTICLE_BODY_CLASS}">\n${figure}`,
      )
    }
    return { ...content, html }
  } catch (error) {
    console.warn("[rh] dfy-profit article AI failed — using authority template", error)
    return buildFallbackArticle(input)
  }
}

