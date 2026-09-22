"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { postUsedKey } from "@/lib/generation-set-name"
import { getOwnedPageKit, updatePageKit } from "@/lib/dfy-profit/page-kit-store"
import type { DfyPageKit } from "@/lib/dfy-profit/page-kit"

type ActionOk<T> = { success: true } & T
type ActionFail = { success: false; error: string }
type ActionResult<T extends object = object> = ActionOk<T> | ActionFail

export async function markPageKitPostUsed(
  pageId: string,
  postId: string,
): Promise<ActionResult<{ kit: DfyPageKit }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const id = pageId.trim()
    const key = postUsedKey(postId.trim())
    if (!id || !key) return { success: false, error: "Invalid item." }

    const owned = await getOwnedPageKit(supabase, { pageId: id, userId: user.id })
    if (!owned.success) return { success: false, error: owned.error }
    if (!owned.kit) return { success: false, error: "This page has no DFY kit." }

    if (owned.kit.usedKeys[key]) {
      return { success: true, kit: owned.kit }
    }

    const usedKeys = { ...owned.kit.usedKeys, [key]: new Date().toISOString() }
    const updated = await updatePageKit(supabase, {
      pageId: id,
      userId: user.id,
      patch: { usedKeys },
    })

    if (!updated.success) return { success: false, error: updated.error }

    revalidatePath("/pages")
    revalidatePath(`/pages/${id}`)
    revalidatePath("/upgrades/dfy-profit")
    revalidatePath("/upgrades/instant-income")
    return { success: true, kit: updated.kit }
  } catch (err) {
    console.error("[page-kit] mark-used error:", err)
    return { success: false, error: "Couldn’t mark this post as used. Please try again." }
  }
}
