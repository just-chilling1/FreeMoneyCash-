"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
          emailConfirm: false, // Disable email verification
        },
      })
      if (error) throw error
      router.push("/dashboard") // Redirect directly to dashboard instead of verify-email page
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6">
      <div className="relative z-10 w-full max-w-md">
        <Card className="glass-strong glow-purple">
          <CardHeader className="space-y-2">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[0_0_40px_rgba(207,161,59,0.4)]">
                <span className="text-3xl font-black italic text-primary-foreground">F</span>
              </div>
            </div>
            <CardTitle className="text-center text-3xl font-bold text-primary">Join Free Money Cash</CardTitle>
            <CardDescription className="text-lg text-muted-foreground text-center">
              Start generating affiliate pages in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 text-lg glass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-lg glass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-lg glass"
                />
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full h-14 text-lg font-bold glow-violet" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              <div className="text-center">
                <p className="text-base text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
