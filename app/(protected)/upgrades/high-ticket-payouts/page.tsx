import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HighTicketPayoutsContent } from "./high-ticket-payouts-content"

export default async function HighTicketPayoutsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <HighTicketPayoutsContent />
}
