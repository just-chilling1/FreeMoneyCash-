import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateStructuredJson, isAiConfigured } from "@/lib/dfy-profit/ai"
import { buildFacebookPostsPrompt } from "@/lib/dfy-profit/prompts"
import { buildFallbackPosts } from "@/lib/dfy-profit/posts-fallback"
import type { DfyFacebookPost } from "@/lib/dfy-profit/types"
import { isValidAffiliateUrl } from "@/lib/affiliate-url"

export const dynamic = "force-dynamic"
export const maxDuration = 120

const POST_COUNT = 3
const NO_STORE = { "Cache-Control": "no-store" } as const

function validatePosts(raw: unknown): string[] | null {
  const posts = (raw as { posts?: unknown })?.posts
  if (!Array.isArray(posts)) return null

  const usable = posts.filter((post): post is string => typeof post === "string" && post.trim().length >= 40)
  return usable.length >= POST_COUNT ? usable.slice(0, POST_COUNT) : null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE })
  }

  const body = await request.json().catch(() => ({}))
  const affiliateUrl = typeof body.affiliateUrl === "string" ? body.affiliateUrl.trim() : ""
  const articleUrl = typeof body.articleUrl === "string" ? body.articleUrl.trim() : ""
  const productName = typeof body.productName === "string" ? body.productName.trim() : ""
  const niche = typeof body.niche === "string" ? body.niche.trim() : ""

  if (!productName || !niche || (!articleUrl && !affiliateUrl)) {
    return NextResponse.json(
      { error: "productName, niche, and one of articleUrl or affiliateUrl are required" },
      { status: 400, headers: NO_STORE },
    )
  }

  if (affiliateUrl && !isValidAffiliateUrl(affiliateUrl)) {
    return NextResponse.json(
      { error: "Enter a valid affiliate URL starting with https://" },
      { status: 400, headers: NO_STORE },
    )
  }

  // Prefer the hosted article so clicks land on the public page; fall back to the
  // raw affiliate link only when stage 2 produced no hosted url.
  const promoLink = articleUrl || affiliateUrl
  const usedFallbackLink = !articleUrl

  let bodies: string[]

  if (!isAiConfigured()) {
    bodies = buildFallbackPosts(niche, promoLink, POST_COUNT)
  } else {
    try {
      bodies = await generateStructuredJson<string[]>({
        prompt: buildFacebookPostsPrompt({ productName, niche, promoLink, postCount: POST_COUNT }),
        validate: validatePosts,
        options: { maxRetries: 2, timeoutMs: 40_000 },
      })
    } catch (error) {
      console.error("[dfy-profit] posts AI failed, using template fallback:", error)
      bodies = buildFallbackPosts(niche, promoLink, POST_COUNT)
    }
  }

  const posts: DfyFacebookPost[] = bodies.map((post, index) => ({
    id: `dfy-post-${index + 1}`,
    body: post.includes(promoLink) ? post : `${post}\n\n${promoLink}`,
  }))

  return NextResponse.json({ posts, promoLink, usedFallbackLink }, { headers: NO_STORE })
}
