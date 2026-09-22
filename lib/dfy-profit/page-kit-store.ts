import type { createClient } from "@/lib/supabase/server"
import {
  createEmptyPageKit,
  mergeKitArticles,
  parsePageKit,
  serializePageKit,
  toDfyArticleEntry,
  type DfyPageKit,
  type DfyPageKitArticle,
} from "@/lib/dfy-profit/page-kit"
import type { DfyArticleResult, DfyFacebookPost } from "@/lib/dfy-profit/types"
import {
  isMissingKitColumnError,
  MISSING_KIT_COLUMN_MESSAGE,
} from "@/lib/dfy-profit/insert-page"

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

type KitPatch = {
  article?: DfyArticleResult | null
  articles?: DfyPageKitArticle[]
  upsertArticles?: DfyPageKitArticle[]
  posts?: DfyFacebookPost[]
  usedKeys?: Record<string, string>
  productName?: string
  productContext?: string
  niche?: string
}

export type UpdateKitResult =
  | { success: true; kit: DfyPageKit }
  | { success: false; error: string }

function applyArticlePatch(
  existing: DfyPageKitArticle[],
  patch: KitPatch,
): DfyPageKitArticle[] {
  let articles = existing

  if (patch.articles !== undefined) {
    articles = patch.articles
  }

  if (patch.article !== undefined) {
    if (patch.article === null) {
      articles = articles.filter((a) => a.source !== "dfy_profit")
    } else {
      articles = mergeKitArticles(articles, [toDfyArticleEntry(patch.article)])
    }
  }

  if (patch.upsertArticles?.length) {
    articles = mergeKitArticles(articles, patch.upsertArticles)
  }

  return articles
}

/**
 * Read-merge-write the pages.kit JSON for a user-owned page.
 */
export async function updatePageKit(
  supabase: SupabaseClient,
  input: {
    pageId: string
    userId: string
    patch: KitPatch
  },
): Promise<UpdateKitResult> {
  const { data: row, error: fetchError } = await supabase
    .from("pages")
    .select("id, kit, title")
    .eq("id", input.pageId)
    .eq("user_id", input.userId)
    .maybeSingle()

  if (fetchError) {
    if (isMissingKitColumnError(fetchError.message ?? "")) {
      return { success: false, error: MISSING_KIT_COLUMN_MESSAGE }
    }
    console.error("[dfy-profit] kit fetch failed:", fetchError.message)
    return { success: false, error: "Couldn’t update this kit. Please try again." }
  }

  if (!row) {
    return { success: false, error: "Profit page not found." }
  }

  const existing = parsePageKit(row.kit) ?? createEmptyPageKit({
    niche: input.patch.niche ?? "",
    productName: input.patch.productName ?? "",
    productContext: input.patch.productContext ?? "",
  })

  const articles = applyArticlePatch(existing.articles, input.patch)
  const dfy =
    articles.find((a) => a.source === "dfy_profit") ?? null

  const next: DfyPageKit = {
    ...existing,
    articles,
    article: dfy
      ? { title: dfy.title, excerpt: dfy.excerpt, html: dfy.html }
      : null,
    posts: input.patch.posts !== undefined ? input.patch.posts : existing.posts,
    usedKeys: input.patch.usedKeys !== undefined ? input.patch.usedKeys : existing.usedKeys,
    productName: input.patch.productName ?? existing.productName,
    productContext: input.patch.productContext ?? existing.productContext,
    niche: input.patch.niche ?? existing.niche,
    generatedAt: existing.generatedAt || new Date().toISOString(),
  }

  const { error: updateError } = await supabase
    .from("pages")
    .update({ kit: serializePageKit(next), updated_at: new Date().toISOString() })
    .eq("id", input.pageId)
    .eq("user_id", input.userId)

  if (updateError) {
    if (isMissingKitColumnError(updateError.message ?? "")) {
      return { success: false, error: MISSING_KIT_COLUMN_MESSAGE }
    }
    console.error("[dfy-profit] kit update failed:", updateError.message)
    return { success: false, error: "Couldn’t save kit details. Please try again." }
  }

  return { success: true, kit: next }
}

export async function getOwnedPageKit(
  supabase: SupabaseClient,
  input: { pageId: string; userId: string },
): Promise<
  | { success: true; kit: DfyPageKit | null; title: string; affiliateLink: string }
  | { success: false; error: string }
> {
  const { data: row, error } = await supabase
    .from("pages")
    .select("id, title, affiliate_link, kit")
    .eq("id", input.pageId)
    .eq("user_id", input.userId)
    .maybeSingle()

  if (error) {
    if (isMissingKitColumnError(error.message ?? "")) {
      return { success: false, error: MISSING_KIT_COLUMN_MESSAGE }
    }
    return { success: false, error: "Couldn’t load this page." }
  }

  if (!row) return { success: false, error: "Profit page not found." }

  return {
    success: true,
    kit: parsePageKit(row.kit),
    title: row.title,
    affiliateLink: row.affiliate_link,
  }
}
