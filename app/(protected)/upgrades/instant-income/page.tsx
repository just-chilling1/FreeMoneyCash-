import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isMissingKitColumnError, MISSING_KIT_COLUMN_MESSAGE } from "@/lib/dfy-profit/insert-page"
import {
  PROFIT_PAGE_SELECT,
  mapProfitPageRow,
  type ProfitPageOption,
} from "@/lib/profit-pages/page-options"
import { InstantIncomeContent } from "./instant-income-content"

export default async function InstantIncomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase
    .from("pages")
    .select(PROFIT_PAGE_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  let pages: ProfitPageOption[] = []
  let initialError = ""

  if (error) {
    initialError = isMissingKitColumnError(error.message ?? "")
      ? MISSING_KIT_COLUMN_MESSAGE
      : "Couldn’t load your pages. Refresh to try again."
    console.error("[instant-income] pages load failed:", error.message)
  } else {
    pages = (data ?? []).map(mapProfitPageRow)
  }

  return <InstantIncomeContent initialPages={pages} initialError={initialError} />
}
