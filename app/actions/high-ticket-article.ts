"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { isValidAffiliateUrl } from "@/lib/affiliate-url"
import {
  highTicketArticleId,
  type DfyPageKit,
} from "@/lib/dfy-profit/page-kit"
import { updatePageKit } from "@/lib/dfy-profit/page-kit-store"
import { ARTICLE_CATALOG, weaveAffiliateLink } from "@/lib/high-ticket-payouts/catalog"
import { replaceFeaturedImageUrl } from "@/lib/high-ticket-payouts/niche-images"
import { sanitizeArticleHtml } from "@/lib/sanitize-html"

type ActionOk<T> = { success: true } & T
type ActionFail = { success: false; error: string }
type ActionResult<T extends object = object> = ActionOk<T> | ActionFail

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isSafeHttpsUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "https:"
  } catch {
    return false
  }
}

export async function saveHighTicketArticleToPage(input: {
  pageId: string
  articleId: number
  featuredImageUrl?: string | null
}): Promise<ActionResult<{ kit: DfyPageKit }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const pageId = input.pageId.trim()
    if (!pageId || !UUID_RE.test(pageId)) {
      return { success: false, error: "Pick one of your pages first." }
    }
    if (!Number.isInteger(input.articleId) || input.articleId < 1) {
      return { success: false, error: "Invalid article." }
    }

    const article = ARTICLE_CATALOG.find((item) => item.id === input.articleId)
    if (!article) {
      return { success: false, error: "Article not found." }
    }

    // Use `*` so optional columns (`slug`, `kit`) don't break on DBs that haven't run every migration.
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (pageError) {
      console.error("[high-ticket-save] page lookup failed:", pageError.message)
      return { success: false, error: "Couldn’t load that page. Please try again." }
    }
    if (!page) {
      return { success: false, error: "That page wasn’t found in your account." }
    }

    const affiliateLink =
      typeof page.affiliate_link === "string" ? page.affiliate_link.trim() : ""
    if (!isValidAffiliateUrl(affiliateLink)) {
      return {
        success: false,
        error: "This page has no valid affiliate link. Add one on the page before saving articles.",
      }
    }

    let woven = weaveAffiliateLink(article.html, affiliateLink)
    const featured = input.featuredImageUrl?.trim() || ""
    if (featured && isSafeHttpsUrl(featured)) {
      woven = replaceFeaturedImageUrl(woven, featured)
    }

    const html = sanitizeArticleHtml(woven)
    const savedAt = new Date().toISOString()
    const kitArticle = {
      id: highTicketArticleId(article.id),
      source: "high_ticket" as const,
      catalogId: article.id,
      savedAt,
      title: article.title,
      excerpt: article.excerpt ?? "",
      html,
    }

    const updated = await updatePageKit(supabase, {
      pageId,
      userId: user.id,
      patch: {
        upsertArticles: [kitArticle],
        niche: article.niche,
      },
    })

    if (!updated.success) {
      return { success: false, error: updated.error }
    }

    revalidatePath("/pages")
    revalidatePath(`/pages/${pageId}`)
    revalidatePath("/upgrades/high-ticket-payouts")

    return { success: true, kit: updated.kit }
  } catch (err) {
    console.error("[high-ticket-save] error:", err)
    return { success: false, error: "Couldn’t save this article to your page. Please try again." }
  }
}
