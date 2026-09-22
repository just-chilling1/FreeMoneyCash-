import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DfyProfitContent } from "./dfy-profit-content"

export const metadata: Metadata = {
  title: "Done-For-You Profit | Your complete promo kit",
  description:
    "Paste your affiliate link, pick a niche, and get a hosted profit page, an authority article, and Facebook posts in one run.",
}

export default async function DfyProfitPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <DfyProfitContent />
}
