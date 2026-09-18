import { buildAuthorityArticleContent } from "@/lib/high-ticket-payouts/article-content"
import { resolveNicheFeaturedImageUrl } from "@/lib/high-ticket-payouts/niche-images"
import { buildDfyArticleTopic, type ArticlePromptInput } from "./prompts"
import type { GeneratedArticleContent } from "./types"

/**
 * Template authority article used when AI is unavailable or fails.
 * Same generator Blackbox uses for DFY Profit (`buildRecurringStreamArticleContent`).
 * Featured image is niche-related via Pixabay when PIXABAY_API_KEY is set.
 */
export async function buildFallbackArticle(
  input: ArticlePromptInput,
): Promise<GeneratedArticleContent> {
  const topic = buildDfyArticleTopic(input.productName, input.niche)
  const featuredImageUrl = await resolveNicheFeaturedImageUrl(topic.hobby, topic.topic)
  const content = buildAuthorityArticleContent({
    topic: topic.topic,
    territory: topic.territory,
    hobby: topic.hobby,
    angle: topic.angle,
    featuredImageUrl,
  })
  return {
    title: content.title,
    excerpt: content.excerpt,
    html: content.html,
  }
}
