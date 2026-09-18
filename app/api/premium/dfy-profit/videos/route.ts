import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isValidAffiliateUrl } from "@/lib/affiliate-url"
import { searchVideoOpportunities } from "@/lib/youtube-shorts-search"
import { scrapeOfferContext } from "@/lib/dfy-profit/scrape-offer-context"
import { generateVideoComments } from "@/lib/dfy-profit/generate-video-comments"
import type { DfyVideoResult } from "@/lib/dfy-profit/types"

export const dynamic = "force-dynamic"
export const maxDuration = 120

const VIDEO_COUNT = 5
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

  // An optional product name skips the scrape when the user already knows the offer.
  const scraped = offerName
    ? { productName: offerName, productContext: "" }
    : await scrapeOfferContext(affiliateUrl)

  const productName = scraped.productName
  const productContext = scraped.productContext || `${productName} for ${niche}`

  let opportunities
  try {
    opportunities = await searchVideoOpportunities({
      productName,
      productDescription: productContext,
      keyword: niche,
      mode: "niche",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Video search failed"
    return NextResponse.json({ error: message }, { status: 502, headers: NO_STORE })
  }

  const selected = opportunities.slice(0, VIDEO_COUNT)
  if (selected.length === 0) {
    return NextResponse.json(
      { error: "No videos found for that niche. Try a different niche." },
      { status: 502, headers: NO_STORE },
    )
  }

  // Parallel, not sequential: five sequential AI calls would approach maxDuration.
  const settled = await Promise.allSettled(
    selected.map((video) =>
      generateVideoComments({
        videoTitle: video.title,
        productName,
        productDescription: productContext,
        affiliateLink: affiliateUrl,
      }),
    ),
  )

  const videos: DfyVideoResult[] = selected.map((video, index) => {
    const result = settled[index]
    const generated =
      result.status === "fulfilled" ? result.value : { comments: [] as string[], usedFallback: true }

    return {
      videoId: video.videoId,
      title: video.title,
      channelTitle: video.channelTitle,
      thumbnailUrl: video.thumbnailUrl,
      viewCount: video.viewCount,
      videoUrl: `https://youtube.com/watch?v=${video.videoId}`,
      comments: generated.comments,
      usedFallbackComments: generated.usedFallback,
    }
  })

  return NextResponse.json({ productName, productContext, niche, videos }, { headers: NO_STORE })
}
