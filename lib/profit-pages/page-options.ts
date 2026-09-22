import { parsePageKit, type DfyPageKit } from "@/lib/dfy-profit/page-kit"

/** A member's profit page as shown in Instant Income / High-Ticket pickers. */
export type ProfitPageOption = {
  id: string
  title: string
  slug: string | null
  affiliateLink: string
  status: string
  createdAt: string
  nicheName: string
  nicheIcon: string
  offerTitle: string
  kit: DfyPageKit | null
}

/** @deprecated Use ProfitPageOption */
export type InstantIncomePageOption = ProfitPageOption

/**
 * Uses `*` so optional columns (`slug` from scripts/005, `kit` from scripts/013)
 * don't break the query on databases where they haven't been added yet.
 */
export const PROFIT_PAGE_SELECT = `
  *,
  niches (name, icon),
  offers (title)
`

/** @deprecated Use PROFIT_PAGE_SELECT */
export const INSTANT_INCOME_PAGE_SELECT = PROFIT_PAGE_SELECT

type Rel<T> = T | T[] | null | undefined

function one<T>(value: Rel<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export function mapProfitPageRow(row: {
  id: string
  title: string | null
  slug?: string | null
  affiliate_link?: string | null
  status?: string | null
  created_at: string
  kit?: unknown
  niches?: Rel<{ name?: string | null; icon?: string | null }>
  offers?: Rel<{ title?: string | null }>
}): ProfitPageOption {
  const niche = one(row.niches)
  const offer = one(row.offers)
  const kit = parsePageKit(row.kit)
  return {
    id: row.id,
    title: row.title?.trim() || "Untitled page",
    slug: typeof row.slug === "string" && row.slug.trim() ? row.slug : null,
    affiliateLink: row.affiliate_link?.trim() ?? "",
    status: row.status ?? "active",
    createdAt: row.created_at,
    nicheName: niche?.name?.trim() || kit?.niche || "",
    nicheIcon: niche?.icon ?? "",
    offerTitle: offer?.title?.trim() || kit?.productName || "",
    kit,
  }
}

/** @deprecated Use mapProfitPageRow */
export const mapInstantIncomePageRow = mapProfitPageRow

export function pagePublicPath(page: { id: string; slug: string | null }) {
  return `/article/${page.slug ?? page.id}`
}
