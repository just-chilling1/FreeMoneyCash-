"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLoginPage() {
  const [email] = useState("admin@freemoneycash.com")
  const [password] = useState("fmc@@admin29")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Hardcoded credentials check
    if (email === "admin@freemoneycash.com" && password === "fmc@@admin29") {
      // Set admin session in localStorage
      localStorage.setItem("fmc_admin_authenticated", "true")
      router.push("/secret-fmc-admin-panel-2029/dashboard")
    } else {
      setError("Invalid admin credentials")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-red-500/20">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-500/10 rounded-full">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          <CardDescription>Restricted Access - Authorized Personnel Only</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert className="bg-blue-500/10 border-blue-500/20">
              <AlertDescription className="text-blue-300 text-sm">
                ✓ Admin credentials are pre-configured. Simply click the button below to access the admin panel.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg" disabled={loading}>
              {loading ? "Authenticating..." : "🔓 Access Admin Panel"}
            </Button>

            <p className="text-xs text-center text-slate-400 mt-4">
              Logged in as: <span className="text-white font-medium">{email}</span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
