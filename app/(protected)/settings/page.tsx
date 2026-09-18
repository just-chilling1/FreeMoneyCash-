import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProfileForm } from "@/components/profile-form"
import { PasswordForm } from "@/components/password-form"
import { SignOutButton } from "@/components/sign-out-button"
import { ACADEMY_TRAINING_VIDEOS } from "@/lib/training-videos"
import { ChevronRight, FileText, GraduationCap, Shield } from "lucide-react"

function planLabel(level: string | null | undefined) {
  switch (level) {
    case "dfy_vault":
      return "Unlimited"
    case "instant_income":
      return "Instant Income"
    case "automated_income":
      return "Automated Income"
    default:
      return "Free Plan"
  }
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { data: progressRows }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("training_progress").select("video_id").eq("user_id", user.id),
  ])

  const completedIds = new Set((progressRows ?? []).map((row) => row.video_id as string))
  const trainingTotal = ACADEMY_TRAINING_VIDEOS.length
  const trainingDone = ACADEMY_TRAINING_VIDEOS.filter((v) => completedIds.has(v.id)).length
  const trainingPct = trainingTotal === 0 ? 0 : Math.round((trainingDone / trainingTotal) * 100)
  const plan = planLabel(profile?.upgrade_level)

  const legalLinks = [
    { href: "/legal/privacy", label: "Privacy Policy" },
    { href: "/legal/terms", label: "Terms of Service" },
    { href: "/legal/disclaimer", label: "Earnings Disclaimer" },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-3">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Account</p>
        <h1 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your profile, security, and plan</p>
      </div>

      <Card className="border-primary/20 glass-strong">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-2xl font-bold text-foreground">Account information</CardTitle>
          <Badge className="border-primary/30 bg-primary/15 px-3 py-1.5 text-sm font-bold text-primary hover:bg-primary/15">
            {plan}
          </Badge>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} userEmail={user.email || ""} />
        </CardContent>
      </Card>

      <Card className="border-border/50 glass-strong">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Security</CardTitle>
              <p className="text-sm text-muted-foreground">Change your password</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PasswordForm userEmail={user.email || ""} />
        </CardContent>
      </Card>

      <Card className="border-border/50 glass-strong">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Account snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/50 bg-card/50 p-5 text-center">
              <p className="mb-2 text-sm text-muted-foreground">Pages generated</p>
              <p className="text-3xl font-black text-primary">{profile?.pages_generated || 0}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-5 text-center">
              <p className="mb-2 text-sm text-muted-foreground">Member since</p>
              <p className="text-xl font-bold text-foreground">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-5 text-center">
              <p className="mb-2 text-sm text-muted-foreground">Account status</p>
              <p className="text-xl font-bold text-primary">Active</p>
            </div>
            <Link
              href="/training"
              className="rounded-xl border border-primary/25 bg-primary/5 p-5 text-center transition hover:border-primary/40 hover:bg-primary/10"
            >
              <p className="mb-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                Training
              </p>
              <p className="text-2xl font-black text-primary">
                {trainingDone}/{trainingTotal}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{trainingPct}% complete</p>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 glass-strong">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Session</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Sign out of Free Money Cash on this device.</p>
          <SignOutButton />
        </CardContent>
      </Card>

      <Card className="border-border/50 glass-strong">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/30">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Legal & compliance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {legalLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-xl border border-border/40 bg-card/40 px-4 py-4 text-base font-semibold text-foreground transition hover:border-primary/35 hover:bg-primary/5 hover:text-primary"
            >
              {item.label}
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
