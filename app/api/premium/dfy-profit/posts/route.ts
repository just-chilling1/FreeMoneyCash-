import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { generateStructuredJson, isAiConfigured } from "@/lib/dfy-profit/ai"
import { buildFacebookPostsPrompt } from "@/lib/dfy-profit/prompts"
import { buildFallbackPosts } from "@/lib/dfy-profit/posts-fallback"
import type { DfyFacebookPost } from "@/lib/dfy-profit/types"
import { getOwnedPageKit, updatePageKit } from "@/lib/dfy-profit/page-kit-store"

export const dynamic = "force-dynamic"
export const maxDuration = 120

const POST_COUNT = 3
const NO_STORE = { "Cache-Control": "no-store" } as const
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
  const pageId = typeof body.pageId === "string" ? body.pageId.trim() : ""
  const promoLink = typeof body.promoLink === "string" ? body.promoLink.trim() : ""
  const productName = typeof body.productName === "string" ? body.productName.trim() : ""
  const niche = typeof body.niche === "string" ? body.niche.trim() : ""

  if (!pageId || !UUID_RE.test(pageId)) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400, headers: NO_STORE })
  }
  if (!promoLink) {
    return NextResponse.json({ error: "promoLink is required" }, { status: 400, headers: NO_STORE })
  }

  const owned = await getOwnedPageKit(supabase, { pageId, userId: user.id })
  if (!owned.success) {
    return NextResponse.json({ error: owned.error }, { status: 404, headers: NO_STORE })
  }

  const resolvedProductName = productName || owned.kit?.productName || owned.title
  const resolvedNiche = niche || owned.kit?.niche || ""

  if (!resolvedProductName || !resolvedNiche) {
    return NextResponse.json(
      { error: "productName and niche are required" },
      { status: 400, headers: NO_STORE },
    )
  }

  let bodies: string[]

  if (!isAiConfigured()) {
    bodies = buildFallbackPosts(resolvedNiche, promoLink, POST_COUNT)
  } else {
    try {
      bodies = await generateStructuredJson<string[]>({
        prompt: buildFacebookPostsPrompt({
          productName: resolvedProductName,
          niche: resolvedNiche,
          promoLink,
          postCount: POST_COUNT,
        }),
        validate: validatePosts,
        options: { maxRetries: 2, timeoutMs: 40_000 },
      })
    } catch (error) {
      console.error("[dfy-profit] posts AI failed, using template fallback:", error)
      bodies = buildFallbackPosts(resolvedNiche, promoLink, POST_COUNT)
    }
  }

  const posts: DfyFacebookPost[] = bodies.map((post, index) => ({
    id: `dfy-post-${index + 1}`,
    body: post.includes(promoLink) ? post : `${post}\n\n${promoLink}`,
  }))

  const updated = await updatePageKit(supabase, {
    pageId,
    userId: user.id,
    patch: {
      posts,
      productName: resolvedProductName,
      niche: resolvedNiche,
    },
  })

  if (!updated.success) {
    return NextResponse.json({ error: updated.error }, { status: 502, headers: NO_STORE })
  }

  revalidatePath("/pages")
  return NextResponse.json({ posts, promoLink }, { headers: NO_STORE })
}
