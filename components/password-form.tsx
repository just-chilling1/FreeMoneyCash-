"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Lock } from "lucide-react"

export function PasswordForm({ userEmail }: { userEmail: string }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." })
      return
    }

    if (newPassword === currentPassword) {
      setMessage({ type: "error", text: "New password must be different from your current password." })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      })

      if (signInError) {
        setMessage({ type: "error", text: "Current password is incorrect." })
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

      if (updateError) {
        setMessage({ type: "error", text: updateError.message || "Failed to update password." })
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setMessage({ type: "success", text: "Password updated successfully." })
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="text-sm font-semibold text-muted-foreground">
          Current password
        </Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="h-12 glass"
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-semibold text-muted-foreground">
            New password
          </Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-12 glass"
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-muted-foreground">
            Confirm new password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 glass"
            required
            minLength={8}
          />
        </div>
      </div>

      {message ? (
        <div
          className={`rounded-xl border p-4 text-sm font-semibold ${
            message.type === "success"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={loading}
        className="h-12 bg-primary font-bold text-primary-foreground hover:bg-accent"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Update password
          </>
        )}
      </Button>
    </form>
  )
}
