import type { createClient } from "@/lib/supabase/server"
import { buildArticleSlug } from "@/lib/dfy-profit/slug"
import { serializePageKit, type DfyPageKit } from "@/lib/dfy-profit/page-kit"

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

const SYSTEM_OFFER_ID = "00000000-0000-0000-0000-000000000001"

const MISSING_KIT_COLUMN_MESSAGE =
  "Your Pages kit column isn’t set up yet. Run scripts/013_add_page_kit.sql in the Supabase SQL editor."

export function isMissingKitColumnError(message: string) {
  return /kit|PGRST204|schema cache|does not exist|42703/i.test(message)
}

export type InsertPageResult =
  | { success: true; page: { id: string; slug: string | null } }
  | { success: false; error: string; missingKitColumn?: boolean }

/**
 * Insert a pages row with retry for slug uniqueness, missing slug column,
 * and NOT NULL offer_id. Seeds the DFY kit JSON on the same row.
 */
export async function insertProfitPage(
  supabase: SupabaseClient,
  input: {
    userId: string
    nicheId: string
    title: string
    content: string
    affiliateLink: string
    kit: DfyPageKit
  },
): Promise<InsertPageResult> {
  let insertError: { code?: string; message?: string } | null = null
  let useSystemOffer = false
  let includeSlug = true
  let includeKit = true

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const row: Record<string, unknown> = {
      user_id: input.userId,
      niche_id: input.nicheId,
      offer_id: useSystemOffer ? SYSTEM_OFFER_ID : null,
      title: input.title,
      content: input.content,
      affiliate_link: input.affiliateLink,
      status: "active",
      views: 0,
      clicks: 0,
    }
    if (includeSlug) row.slug = buildArticleSlug(input.title)
    if (includeKit) row.kit = serializePageKit(input.kit)

    const result = includeSlug
      ? await supabase.from("pages").insert(row).select("id, slug").single()
      : await supabase.from("pages").insert(row).select("id").single()

    if (!result.error && result.data) {
      return {
        success: true,
        page: {
          id: result.data.id,
          slug: "slug" in result.data ? (result.data.slug as string | null) : null,
        },
      }
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

    // Live databases that have not run scripts/013 lack pages.kit.
    if (includeKit && isMissingKitColumnError(message)) {
      return { success: false, error: MISSING_KIT_COLUMN_MESSAGE, missingKitColumn: true }
    }

    // Retry once with the system offer if offer_id is still NOT NULL.
    if (!useSystemOffer && /offer_id/i.test(message)) {
      useSystemOffer = true
      continue
    }

    break
  }

  console.error("[dfy-profit] page insert failed:", insertError)
  return {
    success: false,
    error: insertError?.message || "Could not save your profit page. Please try again.",
  }
}

export { MISSING_KIT_COLUMN_MESSAGE }
