"use client"

import { useState } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Fingerprint,
  Gem,
  Globe,
  Key,
  Lock,
  Mail,
  Play,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { support } from "@/lib/support-config"
import type { ProtectorViewModel } from "@/lib/protector/build-protector-data"
import { vimeoPlayerUrl } from "@/lib/training-videos"
import { cn } from "@/lib/utils"

interface ProtectorContentProps {
  data: ProtectorViewModel
}

const TRAINING_VIMEO_ID = "1226546051"
const PRODUCT_NAME = support.productName

const PROTECTION_LAYERS = [
  {
    num: "1",
    title: "Verified identity",
    desc: "Sign-in credentials and email status are checked on every session.",
  },
  {
    num: "2",
    title: "Encrypted session",
    desc: "Your connection stays private while you work inside the member area.",
  },
  {
    num: "3",
    title: "Live monitoring",
    desc: "Account, platform, and page tools stay visible on this page.",
  },
] as const

function getSecurityChecks(data: ProtectorViewModel) {
  const name = data.account.fullName || "your account"
  return [
    {
      icon: ShieldCheck,
      title: "Account Verified",
      description: data.isEmailVerified
        ? `${name} is verified on ${PRODUCT_NAME} with validated sign-in credentials`
        : `Complete email verification to fully secure your ${PRODUCT_NAME} account`,
    },
    {
      icon: Lock,
      title: "Secure Connection",
      description: `Your ${PRODUCT_NAME} session uses a private, encrypted connection`,
    },
    {
      icon: Key,
      title: "Session Protected",
      description: `Authenticated session for account ${data.account.accountId}`,
    },
    {
      icon: Shield,
      title: "Data Encryption",
      description: "Profile, pages, and vault data are encrypted in transit",
    },
    {
      icon: Server,
      title: "Platform Status",
      description: `${PRODUCT_NAME} member area, Build Page, and premium tools are operational`,
    },
    {
      icon: Globe,
      title: "Tool Connectivity",
      description: "Page generation, Your Pages, and premium upgrade tools are responding normally",
    },
  ]
}

const activityIcons = {
  login: CheckCircle2,
  session: Activity,
  premium: Gem,
  created: Server,
} as const

function StatusChip({
  ok,
  okLabel,
  pendingLabel,
}: {
  ok: boolean
  okLabel: string
  pendingLabel: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-black tracking-wide uppercase",
        ok
          ? "border-primary/40 bg-primary text-primary-foreground"
          : "border-accent/40 bg-accent/15 text-accent",
      )}
    >
      <CheckCircle2 className="h-3 w-3" aria-hidden />
      {ok ? okLabel : pendingLabel}
    </span>
  )
}

function AccountRow({
  icon: Icon,
  label,
  value,
  tone = "ink",
}: {
  icon: LucideIcon
  label: string
  value: string
  tone?: "ink" | "success" | "warning"
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">{label}</p>
        <p
          className={cn(
            "truncate text-sm font-bold",
            tone === "success" && "text-primary",
            tone === "warning" && "text-accent",
            tone === "ink" && "text-foreground",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

export function ProtectorContent({ data }: ProtectorContentProps) {
  const { account, activities, accountStatus, isEmailVerified } = data
  const securityChecks = getSecurityChecks(data)
  const displayName = account.fullName || account.email
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Button asChild variant="ghost" className="border border-primary/60 text-primary hover:border-primary hover:bg-primary/10 hover:text-accent">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="space-y-8">
        <div className="space-y-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-secondary/10 p-8 text-center md:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/40">
            <ShieldCheck className="h-12 w-12 text-primary-foreground" />
          </div>
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-primary">Premium</p>
            {isEmailVerified ? (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-primary-foreground shadow-lg shadow-primary/30">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary-foreground" />
                <span className="text-xs font-black tracking-wider uppercase">All systems secure</span>
              </div>
            ) : (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-xs font-black tracking-wider text-accent uppercase">Verification pending</span>
              </div>
            )}
            <h1 className="mb-4 text-4xl font-black tracking-tight text-foreground lg:text-6xl">Cyber Protection</h1>
            <p className="mb-4 text-xl font-bold text-accent md:text-2xl">Account security overview</p>
            <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-muted-foreground md:text-xl">
              Live status for {displayName}. {PRODUCT_NAME} watches sign-in, session, and platform health — nothing
              here is a scan you have to run.
            </p>
          </div>
          <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
            {["Verified identity", "Encrypted session", "Live monitoring", "Recent activity"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </div>

        <Card highlighted className="overflow-hidden border-primary/20 glass-strong">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
              <div className="relative aspect-video bg-black">
                {!isVideoPlaying ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                    <iframe
                      src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { background: true })}
                      title="Cyber Protection preview"
                      allow="autoplay; fullscreen; picture-in-picture"
                      className="pointer-events-none absolute inset-0 h-full w-full border-0"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <Button
                      size="lg"
                      onClick={() => setIsVideoPlaying(true)}
                      className="relative z-10 h-24 w-24 rounded-full border-4 border-primary/40 text-primary-foreground shadow-[0_0_24px_rgba(207,161,59,0.45)] transition-all duration-300 hover:scale-110"
                    >
                      <Play className="ml-1 h-12 w-12 fill-white" />
                    </Button>
                    <div className="absolute right-0 bottom-8 left-0 text-center">
                      <p className="text-xl font-black text-foreground drop-shadow-lg">Watch Cyber Protection Tutorial</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { autoplay: true })}
                    title="Cyber Protection training video"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center space-y-4 bg-primary/5 p-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <span className="text-sm font-black tracking-wider text-primary uppercase">Watch First</span>
                </div>
                <h2 className="text-3xl font-black text-foreground">How Cyber Protection works</h2>
                <p className="text-lg font-semibold leading-relaxed text-muted-foreground">
                  Watch this to understand how Cyber Protection keeps your {PRODUCT_NAME} account and activity secure.
                </p>
                <ul className="space-y-2">
                  {["Email status on every session", "Encrypted connection while you work", "Activity stays on this page"].map(
                    (item) => (
                      <li key={item} className="flex items-start gap-2 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 glass-strong">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-[11px] font-black tracking-[0.2em] text-primary uppercase">Live monitoring</p>
              <h2 className="text-2xl font-black text-foreground">
                {isEmailVerified ? "Protected account" : "Finish verification"}
              </h2>
              <p className="text-base leading-relaxed font-semibold text-muted-foreground">
                {PRODUCT_NAME} watches sign-in, session, and platform health for {displayName}. This page is the live
                readout — nothing here is a scan you have to run.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black tracking-wide text-primary uppercase">
              {isEmailVerified ? "Email verified" : "Verify email"}
            </span>
          </CardContent>
        </Card>

        <Card className="border-primary/20 glass-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-black text-foreground">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              What stays protected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {PROTECTION_LAYERS.map((step) => (
                <div key={step.num} className="rounded-xl border border-primary/25 bg-primary/10 p-6">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-black text-primary-foreground">
                    {step.num}
                  </div>
                  <h3 className="mb-3 text-2xl font-black text-foreground">{step.title}</h3>
                  <p className="text-lg leading-relaxed font-semibold text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {[
            { label: "Protection", value: isEmailVerified ? "Strong" : "Good", ok: true },
            { label: "Account status", value: accountStatus, ok: isEmailVerified },
            { label: "Security", value: "Bank-level", ok: true },
            { label: "Availability", value: "Always on", ok: true },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-primary/25 bg-primary/5 p-3.5 sm:p-5">
              <p className="mb-1.5 text-[10px] font-black tracking-wider text-muted-foreground uppercase sm:mb-2 sm:text-[11px]">
                {metric.label}
              </p>
              <p
                className={cn(
                  "text-lg leading-tight font-black sm:text-2xl lg:text-3xl",
                  metric.ok ? "text-primary" : "text-accent",
                )}
              >
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border-primary/20 glass-strong lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground">
                <ShieldCheck className="h-7 w-7 text-primary" />
                Security checks
              </CardTitle>
              <p className="text-sm font-semibold text-muted-foreground">Live status for this session</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {securityChecks.map((check) => {
                const Icon = check.icon
                const verified = check.title !== "Account Verified" || isEmailVerified
                return (
                  <div
                    key={check.title}
                    className="flex items-center gap-4 rounded-xl border border-primary/20 bg-muted/40 p-4"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        verified ? "bg-primary/20 text-primary" : "bg-accent/15 text-accent",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-foreground">{check.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed font-semibold text-muted-foreground">{check.description}</p>
                    </div>
                    <StatusChip ok={verified} okLabel="Verified" pendingLabel="Pending" />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-primary/20 glass-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground">
                  <User className="h-7 w-7 text-primary" />
                  Account info
                </CardTitle>
                <p className="text-sm font-semibold text-muted-foreground">Who this session belongs to</p>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {account.fullName ? <AccountRow icon={User} label="Name" value={account.fullName} /> : null}
                <AccountRow icon={Mail} label="Email" value={account.email} />
                <AccountRow icon={Gem} label="Premium tier" value={account.premiumTier} tone="success" />
                <AccountRow icon={Shield} label="Membership" value={account.membership} tone="success" />
                <AccountRow
                  icon={Lock}
                  label="Auth"
                  value={account.authProtection}
                  tone={isEmailVerified ? "success" : "warning"}
                />
                <AccountRow icon={Calendar} label="Last login" value={account.lastLogin} />
                <AccountRow icon={Calendar} label="Member since" value={account.memberSince} />
                <AccountRow icon={Fingerprint} label="Account ID" value={account.accountId} />
                <AccountRow icon={FileText} label="Pages generated" value={`${account.pagesGenerated} generated`} />
              </CardContent>
            </Card>

            <Card className="border-primary/20 glass-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground">
                  <Activity className="h-7 w-7 text-primary" />
                  Recent activity
                </CardTitle>
                <p className="text-sm font-semibold text-muted-foreground">Latest account events</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {activities.map((event) => {
                  const Icon = activityIcons[event.id as keyof typeof activityIcons] ?? Activity
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 rounded-xl border border-primary/20 px-3 py-3"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground">{event.label}</p>
                        <p className="text-xs font-semibold text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
