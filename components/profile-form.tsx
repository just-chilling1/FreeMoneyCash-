"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

interface ProfileFormProps {
  profile: {
    id: string
    full_name?: string | null
  } | null
  userEmail: string
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return

    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("users").update({ full_name: fullName.trim() }).eq("id", profile.id)

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully." })
      router.refresh()
    } catch {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground">
          Email address
        </Label>
        <Input id="email" type="email" value={userEmail} disabled className="h-12 glass opacity-80" />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-semibold text-muted-foreground">
          Full name
        </Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-12 glass"
          placeholder="Enter your full name"
        />
      </div>

      {message ? (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-sm font-semibold ${
            message.type === "success"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
          {message.text}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={loading || !profile?.id}
        className="h-12 w-full bg-primary font-bold uppercase tracking-wide text-primary-foreground shadow-[0_8px_24px_rgba(207,161,59,0.3)] hover:bg-accent sm:w-auto sm:min-w-[200px]"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </form>
  )
}
