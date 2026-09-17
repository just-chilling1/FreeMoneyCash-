"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, LogOut } from "lucide-react"

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignOut}
      disabled={loading}
      className="h-12 border-destructive/30 bg-destructive/5 font-bold text-destructive hover:bg-destructive/15 hover:text-destructive"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </>
      )}
    </Button>
  )
}
