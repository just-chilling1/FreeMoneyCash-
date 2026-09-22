import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { generateAuthorityArticle } from "@/lib/dfy-profit/generate-authority-article"
import { weaveAffiliateLinks } from "@/lib/dfy-profit/weave-affiliate-links"
import { sanitizeArticleHtml } from "@/lib/sanitize-html"
import { getOwnedPageKit, updatePageKit } from "@/lib/dfy-profit/page-kit-store"

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
  const productName = typeof body.productName === "string" ? body.productName.trim() : ""
  const productContext = typeof body.productContext === "string" ? body.productContext.trim() : ""
  const niche = typeof body.niche === "string" ? body.niche.trim() : ""

  if (!pageId || !UUID_RE.test(pageId)) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400, headers: NO_STORE })
  }

  const owned = await getOwnedPageKit(supabase, { pageId, userId: user.id })
  if (!owned.success) {
    return NextResponse.json({ error: owned.error }, { status: 404, headers: NO_STORE })
  }

  const resolvedProductName = productName || owned.kit?.productName || owned.title
  const resolvedNiche = niche || owned.kit?.niche || ""
  const resolvedContext =
    productContext || owned.kit?.productContext || `${resolvedProductName} for ${resolvedNiche}`

  if (!resolvedProductName || !resolvedNiche) {
    return NextResponse.json(
      { error: "productName and niche are required" },
      { status: 400, headers: NO_STORE },
    )
  }

  const content = await generateAuthorityArticle({
    productName: resolvedProductName,
    productContext: resolvedContext,
    niche: resolvedNiche,
    affiliateUrl: owned.affiliateLink,
  })
  const html = sanitizeArticleHtml(weaveAffiliateLinks(content.html, owned.affiliateLink))

  const article = {
    title: content.title,
    excerpt: content.excerpt,
    html,
  }

  const updated = await updatePageKit(supabase, {
    pageId,
    userId: user.id,
    patch: {
      article,
      productName: resolvedProductName,
      productContext: resolvedContext,
      niche: resolvedNiche,
    },
  })

  if (!updated.success) {
    return NextResponse.json({ error: updated.error }, { status: 502, headers: NO_STORE })
  }

  revalidatePath("/pages")
  return NextResponse.json(article, { headers: NO_STORE })
}
