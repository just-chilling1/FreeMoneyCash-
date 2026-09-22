"use server"

import { hashAffiliateUrl } from "@/lib/high-ticket-payouts/url-hash"
import { createClient } from "@/lib/supabase/server"

type ActionOk<T> = { success: true } & T
type ActionFail = { success: false; error: string }
type ActionResult<T extends object = object> = ActionOk<T> | ActionFail

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function missingTableError(message: string) {
  return /high_ticket_article_usage|schema cache|does not exist|42P01/i.test(message)
}

const MISSING_TABLE_MESSAGE =
  "Mark as Used isn’t set up on this database yet. Run scripts/011_create_high_ticket_article_usage.sql in the Supabase SQL editor."

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { supabase, user: null as null, error: "Not authenticated" }
  }

  return { supabase, user, error: null as null }
}

function highTicketUsageKey(pageId: string) {
  return hashAffiliateUrl(`page:${pageId.trim()}`)
}

async function resolveOwnedPageHash(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  pageId?: string | null,
): Promise<{ ok: true; urlHash: string; pageId: string } | { ok: false; error: string }> {
  const id = pageId?.trim() || ""
  if (!id || !UUID_RE.test(id)) {
    return { ok: false, error: "Pick one of your pages first." }
  }

  const { data, error } = await supabase
    .from("pages")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("[high-ticket-usage] page lookup failed:", error.message)
    return { ok: false, error: "Couldn’t verify that page. Please try again." }
  }
  if (!data) {
    return { ok: false, error: "That page wasn’t found in your account." }
  }

  return { ok: true, urlHash: highTicketUsageKey(id), pageId: id }
}

export async function listHighTicketArticleUsage(input: {
  pageId?: string | null
}): Promise<ActionResult<{ articleIds: number[] }>> {
  try {
    const { supabase, user, error } = await requireUser()
    if (!user) return { success: false, error }

    const resolved = await resolveOwnedPageHash(supabase, user.id, input.pageId)
    if (!resolved.ok) return { success: false, error: resolved.error }

    const { data, error: queryError } = await supabase
      .from("high_ticket_article_usage")
      .select("article_id")
      .eq("user_id", user.id)
      .eq("url_hash", resolved.urlHash)

    if (queryError) {
      if (missingTableError(queryError.message ?? "")) {
        return { success: false, error: MISSING_TABLE_MESSAGE }
      }
      console.error("[high-ticket-usage] list failed:", queryError.message)
      return { success: false, error: "Couldn’t load used articles. Please try again." }
    }

    const articleIds = (data ?? [])
      .map((row) => row.article_id)
      .filter((id): id is number => typeof id === "number" && Number.isFinite(id))

    return { success: true, articleIds }
  } catch (error) {
    console.error("[high-ticket-usage] list error:", error)
    return { success: false, error: "Couldn’t load used articles. Please try again." }
  }
}

export async function toggleHighTicketArticleUsage(input: {
  articleId: number
  pageId?: string | null
}): Promise<ActionResult<{ used: boolean }>> {
  try {
    const { supabase, user, error } = await requireUser()
    if (!user) return { success: false, error }

    if (!Number.isInteger(input.articleId) || input.articleId < 1) {
      return { success: false, error: "Invalid article." }
    }

    const resolved = await resolveOwnedPageHash(supabase, user.id, input.pageId)
    if (!resolved.ok) return { success: false, error: resolved.error }

    const { data: existing, error: existingError } = await supabase
      .from("high_ticket_article_usage")
      .select("id")
      .eq("user_id", user.id)
      .eq("article_id", input.articleId)
      .eq("url_hash", resolved.urlHash)
      .maybeSingle()

    if (existingError) {
      if (missingTableError(existingError.message ?? "")) {
        return { success: false, error: MISSING_TABLE_MESSAGE }
      }
      console.error("[high-ticket-usage] lookup failed:", existingError.message)
      return { success: false, error: "Couldn’t update used state. Please try again." }
    }

    if (existing?.id) {
      const { error: deleteError } = await supabase
        .from("high_ticket_article_usage")
        .delete()
        .eq("id", existing.id)
        .eq("user_id", user.id)

      if (deleteError) {
        console.error("[high-ticket-usage] delete failed:", deleteError.message)
        return { success: false, error: "Couldn’t unmark article. Please try again." }
      }

      return { success: true, used: false }
    }

    const { error: insertError } = await supabase.from("high_ticket_article_usage").insert({
      user_id: user.id,
      url_hash: resolved.urlHash,
      article_id: input.articleId,
    })

    if (insertError) {
      if (missingTableError(insertError.message ?? "")) {
        return { success: false, error: MISSING_TABLE_MESSAGE }
      }
      console.error("[high-ticket-usage] insert failed:", insertError.message)
      return { success: false, error: "Couldn’t mark article as used. Please try again." }
    }

    return { success: true, used: true }
  } catch (error) {
    console.error("[high-ticket-usage] toggle error:", error)
    return { success: false, error: "Couldn’t update used state. Please try again." }
  }
}
