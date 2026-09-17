"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ACADEMY_TRAINING_VIDEOS } from "@/lib/training-videos"

const VALID_VIDEO_IDS = new Set(ACADEMY_TRAINING_VIDEOS.map((v) => v.id))

export async function markTrainingComplete(videoId: string) {
  try {
    if (!VALID_VIDEO_IDS.has(videoId)) {
      return { success: false, error: "Invalid video" }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const { error } = await supabase.from("training_progress").upsert(
      {
        user_id: user.id,
        video_id: videoId,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,video_id" },
    )

    if (error) {
      console.error("[training] mark complete failed:", error)
      return { success: false, error: "Failed to save progress" }
    }

    revalidatePath("/training")
    return { success: true }
  } catch (error) {
    console.error("[training] mark complete error:", error)
    return { success: false, error: "An error occurred" }
  }
}

export async function unmarkTrainingComplete(videoId: string) {
  try {
    if (!VALID_VIDEO_IDS.has(videoId)) {
      return { success: false, error: "Invalid video" }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const { error } = await supabase
      .from("training_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("video_id", videoId)

    if (error) {
      console.error("[training] unmark failed:", error)
      return { success: false, error: "Failed to update progress" }
    }

    revalidatePath("/training")
    return { success: true }
  } catch (error) {
    console.error("[training] unmark error:", error)
    return { success: false, error: "An error occurred" }
  }
}
