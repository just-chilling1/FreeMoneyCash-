import { generateStructuredJson, isAiConfigured } from "@/lib/ai/rapidapi"
import { scrapeOfferContext } from "./scrape-offer-context"
import { INSTANT_INCOME_POST_COUNT } from "./niches"
import { pickProductName, resolveOfferLabel } from "./offer-label"
import { buildInstantIncomeFallbackPosts } from "./posts-fallback"
import { buildInstantIncomePostsPrompt } from "./prompts"

export type GeneratedInstantIncomePost = {
  id: string
  body: string
}

function validatePosts(raw: unknown, postCount: number, promoLink: string): string[] | null {
  const posts = (raw as { posts?: unknown })?.posts
  if (!Array.isArray(posts)) return null

  const usable = posts.filter((post): post is string => typeof post === "string" && post.trim().length >= 80)
  if (usable.length < postCount) return null

  return usable.slice(0, postCount).map((post) => (post.includes(promoLink) ? post.trim() : `${post.trim()}\n\n${promoLink}`))
}

export async function generateInstantIncomePosts(input: {
  /** Affiliate destination — read for product name / blurb. */
  affiliateUrl: string
  /** Link written into each post. Defaults to `affiliateUrl`; DFY flows pass the hosted profit page URL. */
  promoLink?: string
  niche: string
  offerName?: string
  /** Already-known product blurb (e.g. from a saved page kit). Used when scraping yields nothing. */
  productContext?: string
  /** Title of the hosted page the link opens, so posts can reference it naturally. */
  pageTitle?: string
  postCount?: number
  /** Prefix for generated post ids. Defaults to `ii-post`. */
  idPrefix?: string
}): Promise<{
  posts: GeneratedInstantIncomePost[]
  productName: string
  productContext: string
  usedFallback: boolean
}> {
  const postCount = input.postCount ?? INSTANT_INCOME_POST_COUNT
  const promoLink = input.promoLink?.trim() || input.affiliateUrl
  const idPrefix = input.idPrefix?.trim() || "ii-post"

  const scraped = input.affiliateUrl
    ? await scrapeOfferContext(input.affiliateUrl)
    : { productName: "", productContext: "" }
  const productName = pickProductName(input.offerName, scraped.productName)
  const offerLabel = resolveOfferLabel(productName, input.niche)
  const productContextParts = [
    scraped.productContext.trim() ||
      input.productContext?.trim() ||
      `${offerLabel} — a ${input.niche} offer the reader can start from the link`,
  ]
  if (input.offerName?.trim() && input.offerName.trim() !== productName) {
    productContextParts.push(`The member saved this offer as “${input.offerName.trim()}”.`)
  }
  if (input.pageTitle?.trim()) {
    productContextParts.push(
      `The link opens the member's own guide page titled “${input.pageTitle.trim()}”, which recommends this offer.`,
    )
  }
  const productContext = productContextParts.join(" ")

  let bodies: string[]
  let usedFallback = false

  if (!isAiConfigured()) {
    bodies = buildInstantIncomeFallbackPosts({
      niche: input.niche,
      productName,
      promoLink,
      count: postCount,
    })
    usedFallback = true
  } else {
    try {
      bodies = await generateStructuredJson<string[]>({
        prompt: buildInstantIncomePostsPrompt({
          productName: offerLabel,
          productContext,
          niche: input.niche,
          promoLink,
          postCount,
        }),
        validate: (raw) => validatePosts(raw, postCount, promoLink),
        options: { maxRetries: 2, timeoutMs: 50_000 },
      })
    } catch (error) {
      console.error("[instant-income] posts AI failed, using niche fallback:", error)
      bodies = buildInstantIncomeFallbackPosts({
        niche: input.niche,
        productName,
        promoLink,
        count: postCount,
      })
      usedFallback = true
    }
  }

  return {
    productName,
    productContext,
    usedFallback,
    posts: bodies.map((body, index) => ({
      id: `${idPrefix}-${index + 1}`,
      body,
    })),
  }
}
