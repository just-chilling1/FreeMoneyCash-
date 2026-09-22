import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { isValidAffiliateUrl } from "@/lib/affiliate-url"
import { generateInstantIncomePosts } from "@/lib/instant-income/generate-posts"
import { INSTANT_INCOME_POST_COUNT } from "@/lib/instant-income/niches"
import {
  PROFIT_PAGE_SELECT,
  mapProfitPageRow,
  pagePublicPath,
} from "@/lib/profit-pages/page-options"
import { isMissingKitColumnError, MISSING_KIT_COLUMN_MESSAGE } from "@/lib/dfy-profit/insert-page"
import { updatePageKit } from "@/lib/dfy-profit/page-kit-store"
import type { DfyFacebookPost } from "@/lib/dfy-profit/types"

export const dynamic = "force-dynamic"
export const maxDuration = 120

const NO_STORE = { "Cache-Control": "no-store" } as const
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

  if (!pageId || !UUID_RE.test(pageId)) {
    return NextResponse.json({ error: "Pick one of your pages first." }, { status: 400, headers: NO_STORE })
  }

  const { data: row, error: fetchError } = await supabase
    .from("pages")
    .select(PROFIT_PAGE_SELECT)
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (fetchError) {
    if (isMissingKitColumnError(fetchError.message ?? "")) {
      return NextResponse.json({ error: MISSING_KIT_COLUMN_MESSAGE }, { status: 500, headers: NO_STORE })
    }
    console.error("[instant-income] page lookup failed:", fetchError.message)
    return NextResponse.json({ error: "Couldn’t load that page." }, { status: 500, headers: NO_STORE })
  }
  if (!row) {
    return NextResponse.json({ error: "That page wasn’t found in your account." }, { status: 404, headers: NO_STORE })
  }

  const page = mapProfitPageRow(row)
  const niche = page.nicheName || "General"
  const origin = new URL(request.url).origin
  const promoLink = `${origin}${pagePublicPath(page)}`
  const affiliateUrl = isValidAffiliateUrl(page.affiliateLink) ? page.affiliateLink : ""

  const generated = await generateInstantIncomePosts({
    affiliateUrl,
    promoLink,
    niche,
    offerName: page.offerTitle || page.kit?.productName || undefined,
    productContext: page.kit?.productContext,
    pageTitle: page.title,
    postCount: INSTANT_INCOME_POST_COUNT,
    idPrefix: `ii-${Date.now().toString(36)}`,
  })

  const newPosts: DfyFacebookPost[] = generated.posts.map((post) => ({ id: post.id, body: post.body }))
  const existingPosts = page.kit?.posts ?? []

  const updated = await updatePageKit(supabase, {
    pageId: page.id,
    userId: user.id,
    patch: {
      posts: [...existingPosts, ...newPosts],
      niche: page.kit?.niche || niche,
      productName: page.kit?.productName || generated.productName,
      productContext: page.kit?.productContext || generated.productContext,
    },
  })

  if (!updated.success) {
    return NextResponse.json({ error: updated.error }, { status: 502, headers: NO_STORE })
  }

  revalidatePath("/pages")
  revalidatePath(`/pages/${page.id}`)
  revalidatePath("/upgrades/instant-income")

  return NextResponse.json(
    {
      pageId: page.id,
      posts: newPosts,
      kit: updated.kit,
      promoLink,
      niche,
      usedFallback: generated.usedFallback,
    },
    { headers: NO_STORE },
  )
}
