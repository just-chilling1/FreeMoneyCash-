"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsResetting(true)
    setResetError(null)
    setResetSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      setResetSuccess(true)
      setResetEmail("")
    } catch (error: unknown) {
      setResetError(error instanceof Error ? error.message : "Failed to send reset email")
    } finally {
      setIsResetting(false)
    }
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      // Reset form when dialog closes
      setResetEmail("")
      setResetSuccess(false)
      setResetError(null)
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
            <CardTitle className="text-center text-3xl font-bold text-primary">Welcome to Free Money Cash</CardTitle>
            <CardDescription className="text-center text-lg text-muted-foreground">
              Sign in to access your affiliate page builder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base">
                    Password
                  </Label>
                  <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Forgot Password?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="glass-strong glow-purple sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-primary">Reset Your Password</DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                          Enter your email address and we'll send you a password reset link.
                        </DialogDescription>
                      </DialogHeader>
                      {!resetSuccess ? (
                        <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="reset-email" className="text-base">
                              Email Address
                            </Label>
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="your@email.com"
                              required
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="h-12 text-lg glass"
                            />
                          </div>
                          {resetError && (
                            <Alert variant="destructive">
                              <AlertDescription>{resetError}</AlertDescription>
                            </Alert>
                          )}
                          <Button
                            type="submit"
                            className="w-full h-12 text-base font-bold glow-purple"
                            disabled={isResetting}
                          >
                            {isResetting ? "Sending..." : "Send Reset Link"}
                          </Button>
                        </form>
                      ) : (
                        <Alert className="border-green-500/50 bg-green-500/10">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <AlertDescription className="text-green-500 text-base ml-2">
                            <p className="font-semibold mb-2">Password reset email sent!</p>
                            <p className="text-sm">
                              Please check your inbox for the password reset link. The email may take{" "}
                              <strong>5-10 minutes</strong> to arrive.
                            </p>
                            <p className="text-sm mt-2">
                              <Mail className="inline h-4 w-4 mr-1" />
                              Don't forget to check your <strong>spam/junk folder</strong> if you don't see it in your inbox.
                            </p>
                          </AlertDescription>
                        </Alert>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                <Input
                  id="password"
                  type="password"
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
              <Button type="submit" className="w-full h-14 text-lg font-bold glow-purple" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
              <div className="text-center">
                <p className="text-base text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/auth/sign-up" className="text-primary hover:underline font-semibold">
                    Create Account
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
