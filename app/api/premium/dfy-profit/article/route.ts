import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isValidAffiliateUrl } from "@/lib/affiliate-url"
import { generateAuthorityArticle } from "@/lib/dfy-profit/generate-authority-article"
import { weaveAffiliateLinks } from "@/lib/dfy-profit/weave-affiliate-links"
import { buildArticleSlug } from "@/lib/dfy-profit/slug"
import { sanitizeArticleHtml } from "@/lib/sanitize-html"

export const dynamic = "force-dynamic"
export const maxDuration = 120

const NO_STORE = { "Cache-Control": "no-store" } as const
const SYSTEM_OFFER_ID = "00000000-0000-0000-0000-000000000001"

async function resolveNicheId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  nicheName: string,
): Promise<string | null> {
  const { data: named } = await supabase
    .from("niches")
    .select("id")
    .ilike("name", nicheName)
    .limit(1)
    .maybeSingle()

  if (named?.id) return named.id

  const { data: existing } = await supabase.from("niches").select("id").limit(1).maybeSingle()
  if (existing?.id) return existing.id

  const { data: created, error } = await supabase
    .from("niches")
    .insert({
      name: "General",
      description: "General niche for all content",
      icon: "📄",
    })
    .select("id")
    .single()

  if (error || !created) {
    console.error("[dfy-profit] could not resolve niche:", error)
    return null
  }

  return created.id
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
  const productName = typeof body.productName === "string" ? body.productName.trim() : ""
  const productContext = typeof body.productContext === "string" ? body.productContext.trim() : ""
  const niche = typeof body.niche === "string" ? body.niche.trim() : ""

  if (!isValidAffiliateUrl(affiliateUrl) || !productName || !niche) {
    return NextResponse.json(
      { error: "affiliateUrl, productName, and niche are required" },
      { status: 400, headers: NO_STORE },
    )
  }

  const content = await generateAuthorityArticle({
    productName,
    productContext,
    niche,
    affiliateUrl,
  })
  const html = sanitizeArticleHtml(weaveAffiliateLinks(content.html, affiliateUrl))
  const nicheId = await resolveNicheId(supabase, niche)

  let page: { id: string; slug: string | null } | null = null
  let insertError: { code?: string; message?: string } | null = null
  let useSystemOffer = false
  let includeSlug = true

  if (!nicheId) {
    insertError = { message: "Could not resolve a niche for this article" }
  } else {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const row: Record<string, unknown> = {
        user_id: user.id,
        niche_id: nicheId,
        offer_id: useSystemOffer ? SYSTEM_OFFER_ID : null,
        title: content.title,
        content: html,
        affiliate_link: affiliateUrl,
        status: "active",
        views: 0,
        clicks: 0,
      }
      if (includeSlug) row.slug = buildArticleSlug(content.title)

      const result = await supabase.from("pages").insert(row).select(includeSlug ? "id, slug" : "id").single()

      if (!result.error && result.data) {
        page = { id: result.data.id, slug: "slug" in result.data ? (result.data.slug as string | null) : null }
        insertError = null
        break
      }

      insertError = result.error
      const message = result.error?.message ?? ""
      // 23505 is Postgres unique_violation on pages.slug.
      if (result.error?.code === "23505") continue
      // Live databases that have not run scripts/005 lack pages.slug.
      if (includeSlug && result.error?.code === "PGRST204" && /slug/i.test(message)) {
        includeSlug = false
        continue
      }
      // Retry once with the system offer if offer_id is still NOT NULL.
      if (!useSystemOffer && /offer_id/i.test(message)) {
        useSystemOffer = true
        continue
      }
      break
    }
  }

  if (insertError || !page) {
    console.error("[dfy-profit] article save failed:", insertError)
    return NextResponse.json(
      {
        id: null,
        slug: null,
        url: null,
        title: content.title,
        excerpt: content.excerpt,
        html,
        saveWarning: "Article generated but not saved, so there is no shareable link. Copy the text below.",
      },
      { headers: NO_STORE },
    )
  }

  const origin = new URL(request.url).origin

  return NextResponse.json(
    {
      id: page.id,
      slug: page.slug,
      url: `${origin}/article/${page.slug ?? page.id}`,
      title: content.title,
      excerpt: content.excerpt,
      html,
    },
    { headers: NO_STORE },
  )
}
