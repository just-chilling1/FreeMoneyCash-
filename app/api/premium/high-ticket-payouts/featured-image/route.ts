import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { resolveNicheFeaturedImageUrl } from "@/lib/high-ticket-payouts/niche-images"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" } as const

/**
 * Resolve a niche-related featured image (Pixabay when PIXABAY_API_KEY is set).
 * Used by High-Ticket Payouts when personalizing/previewing an authority article.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE })
  }

  const body = await request.json().catch(() => ({}))
  const niche = typeof body.niche === "string" ? body.niche.trim() : ""
  const title = typeof body.title === "string" ? body.title.trim() : ""

  if (!niche || !title) {
    return NextResponse.json(
      { error: "niche and title are required" },
      { status: 400, headers: NO_STORE },
    )
  }

  const url = await resolveNicheFeaturedImageUrl(niche, title)
  return NextResponse.json({ url }, { headers: NO_STORE })
}
