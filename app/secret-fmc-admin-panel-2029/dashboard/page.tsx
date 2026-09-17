"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Shield, Search, User, Calendar, Mail, Lock, LogOut, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { searchUserByEmail, resetUserPassword } from "./actions"

interface UserResult {
  id: string
  email: string
  created_at: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchEmail, setSearchEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [searchResult, setSearchResult] = useState<UserResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem("fmc_admin_authenticated")
    if (!isAuthenticated) {
      router.push("/secret-fmc-admin-panel-2029/login")
    }
  }, [router, mounted])

  const handleSearch = async () => {
    if (!searchEmail) return

    setLoading(true)
    setMessage(null)
    setSearchResult(null)

    try {
      const result = await searchUserByEmail(searchEmail)
      console.log("[v0] Search result:", result)
      if (result.success && result.user) {
        setSearchResult(result.user)
      } else {
        setMessage({ type: "error", text: result.error || "User not found" })
      }
    } catch (error) {
      console.error("[v0] Search error:", error)
      setMessage({ type: "error", text: "Failed to search user" })
    }

    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (!searchResult || !newPassword) return

    setResetting(true)
    setMessage(null)

    try {
      const result = await resetUserPassword(searchResult.id, newPassword)
      if (result.success) {
        setMessage({
          type: "success",
          text: `✓ Password successfully reset for ${searchResult.email}. User can now login with the new password.`,
        })
        setNewPassword("")
      } else {
        setMessage({ type: "error", text: result.error || "Failed to reset password" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to reset password" })
    }

    setResetting(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("fmc_admin_authenticated")
    router.push("/secret-fmc-admin-panel-2029/login")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Free Money Cash Admin</h1>
              <p className="text-sm text-slate-400">User Management System</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-red-500/20 text-red-500 hover:bg-red-500/10 bg-transparent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert
            variant={message.type === "error" ? "destructive" : "default"}
            className={message.type === "success" ? "border-green-500/50 bg-green-500/10" : ""}
          >
            {message.type === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-500" : ""}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Search Section */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search User
            </CardTitle>
            <CardDescription>Find user account by email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="border-slate-700 bg-slate-900"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !searchEmail}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Details */}
        {searchResult && (
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Email Address</p>
                    <p className="font-medium">{searchResult.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Account Created</p>
                    <p className="font-medium">{formatDate(searchResult.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6 space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <Lock className="h-5 w-5" />
                  <h3 className="font-semibold">Reset User Password</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="text"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-slate-700 bg-slate-900"
                  />
                  <p className="text-xs text-slate-400">
                    This will immediately reset the user's password. No email verification required.
                  </p>
                </div>

                <Button
                  onClick={handleResetPassword}
                  disabled={resetting || !newPassword}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {resetting ? "Resetting Password..." : "Reset Password Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning Notice */}
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-yellow-500">Admin Notice</p>
                <p className="text-sm text-slate-300">
                  This panel provides direct access to user accounts. Use password reset functionality responsibly and
                  only when assisting legitimate support requests. All actions are logged.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
