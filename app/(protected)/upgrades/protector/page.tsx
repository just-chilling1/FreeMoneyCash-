import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { buildProtectorViewModel } from "@/lib/protector/build-protector-data"
import { ProtectorContent } from "./protector-content"

export const metadata: Metadata = {
  title: "Cyber Protection | Account Security Overview",
  description: "Real-time account security monitoring and status",
}

export const dynamic = "force-dynamic"

export default async function ProtectorPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, upgrade_level, pages_generated, created_at")
    .eq("id", user.id)
    .single()

  const viewModel = buildProtectorViewModel(user, profile)

  return <ProtectorContent data={viewModel} />
}
