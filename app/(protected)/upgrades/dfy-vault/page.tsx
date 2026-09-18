import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DFYVaultContent } from "./dfy-vault-content"

export default async function DFYVaultPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return <DFYVaultContent />
}
