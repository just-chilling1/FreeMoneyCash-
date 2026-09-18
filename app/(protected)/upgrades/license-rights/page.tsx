import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LicenseRightsContent } from "./license-rights-content"

export const metadata: Metadata = {
  title: "Reseller & License Rights | Reseller Edition",
  description: "Request activation for the Full Turnkey Reseller & License Rights Edition",
}

export default async function LicenseRightsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <LicenseRightsContent />
}
