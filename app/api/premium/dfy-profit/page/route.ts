import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { isValidAffiliateUrl } from "@/lib/affiliate-url"
import { scrapeOfferContext } from "@/lib/dfy-profit/scrape-offer-context"
import { generateProfitPage } from "@/lib/dfy-profit/generate-profit-page"
import { resolveNicheId } from "@/lib/dfy-profit/resolve-niche"
import { insertProfitPage } from "@/lib/dfy-profit/insert-page"
import { createEmptyPageKit } from "@/lib/dfy-profit/page-kit"

export const dynamic = "force-dynamic"
export const maxDuration = 120

const NO_STORE = { "Cache-Control": "no-store" } as const

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
  const niche = typeof body.niche === "string" ? body.niche.trim() : ""
  const offerName = typeof body.offerName === "string" ? body.offerName.trim() : ""

  if (!isValidAffiliateUrl(affiliateUrl)) {
    return NextResponse.json(
      { error: "Enter a valid affiliate URL starting with https://" },
      { status: 400, headers: NO_STORE },
    )
  }
  if (!niche) {
    return NextResponse.json({ error: "Pick a niche first." }, { status: 400, headers: NO_STORE })
  }

  const scraped = offerName
    ? { productName: offerName, productContext: "" }
    : await scrapeOfferContext(affiliateUrl)

  const productName = scraped.productName
  const productContext = scraped.productContext || `${productName} for ${niche}`

  const nicheId = await resolveNicheId(supabase, niche)
  if (!nicheId) {
    return NextResponse.json(
      { error: "Could not resolve a niche for this page." },
      { status: 502, headers: NO_STORE },
    )
  }

  const generated = await generateProfitPage({
    niche,
    productName,
    productContext,
    affiliateUrl,
  })

  const kit = createEmptyPageKit({ niche, productName, productContext })

  const inserted = await insertProfitPage(supabase, {
    userId: user.id,
    nicheId,
    title: generated.title,
    content: generated.content,
    affiliateLink: affiliateUrl,
    kit,
  })

  if (!inserted.success) {
    return NextResponse.json(
      { error: inserted.error },
      { status: inserted.missingKitColumn ? 503 : 502, headers: NO_STORE },
    )
  }

  revalidatePath("/pages")
  revalidatePath("/dashboard")

  const origin = new URL(request.url).origin
  const url = `${origin}/article/${inserted.page.slug ?? inserted.page.id}`

  return NextResponse.json(
    {
      pageId: inserted.page.id,
      slug: inserted.page.slug,
      url,
      title: generated.title,
      productName,
      productContext,
      niche,
    },
    { headers: NO_STORE },
  )
}
