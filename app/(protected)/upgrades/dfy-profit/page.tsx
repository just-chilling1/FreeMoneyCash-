import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { listPremiumGenerationSets } from "@/app/actions/premium-generation-sets"
import { DfyProfitContent } from "./dfy-profit-content"

export const metadata: Metadata = {
  title: "Done-For-You Profit | Your complete promo kit",
  description:
    "Paste your affiliate link, pick a niche, and get videos, an authority article, and Facebook posts in one run.",
}

export default async function DfyProfitPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const libraryResult = await listPremiumGenerationSets("dfy_profit")
  const initialSets = libraryResult.success ? libraryResult.sets : []
  const libraryError = libraryResult.success ? "" : libraryResult.error

  return <DfyProfitContent initialSets={initialSets} initialLibraryError={libraryError} />
}
