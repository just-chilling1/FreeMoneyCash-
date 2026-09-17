"use server"

import { createClient } from "@supabase/supabase-js"

// Use service role key for admin operations
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function searchUserByEmail(email: string) {
  try {
    console.log("[v0] Searching for user:", email)

    // Query the public.users table directly for instant results
    // This bypasses the pagination issue and is much faster
    const { data: userData, error: dbError } = await supabaseAdmin
      .from("users")
      .select("id, email, created_at")
      .ilike("email", email)
      .single()

    if (dbError) {
      console.error("[v0] Database query error:", dbError)
      
      // Check if it's a "not found" error
      if (dbError.code === "PGRST116") {
        return { success: false, error: "User not found" }
      }
      
      return { success: false, error: "Failed to search user" }
    }

    if (!userData) {
      console.log("[v0] User not found")
      return { success: false, error: "User not found" }
    }

    console.log("[v0] User found:", userData.id, userData.email)

    return {
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        created_at: userData.created_at,
      },
    }
  } catch (error) {
    console.error("[v0] Admin search error:", error)
    return { success: false, error: "Failed to search user" }
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    console.log("[v0] Resetting password for user:", userId)

    // Use Supabase Admin API to update user password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })

    if (error) {
      console.error("[v0] Password reset error:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] Password successfully reset for user:", userId)
    return { success: true }
  } catch (error) {
    console.error("[v0] Admin password reset error:", error)
    return { success: false, error: "Failed to reset password" }
  }
}
