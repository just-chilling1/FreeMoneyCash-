import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Check, Crown, FileText, Package, Rocket, ShieldCheck, Zap } from "lucide-react"
import Link from "next/link"

const upgrades = [
  {
    id: "dfy_profit",
    name: "Done-For-You Profit",
    tagline: "One link, one complete promo kit",
    icon: Package,
    color: "gold",
    features: [
      "5 YouTube Shorts to comment on",
      "Ready-to-copy comments for each video",
      "Hosted authority article with your link",
      "3 Facebook posts promoting the article",
      "Save, restore, and mark items as used",
    ],
    href: "/upgrades/dfy-profit",
  },
  {
    id: "dfy_vault",
    name: "Unlimited",
    tagline: "200 ready-to-publish pages",
    icon: Crown,
    color: "purple",
    features: [
      "200 Pre-Written Page Templates",
      "Swipe File of Top Performers",
      "Advanced SEO Training",
      "Priority Email Support",
      "Unlimited Page Generation",
      "Custom Branding Options",
    ],
    href: "/upgrades/dfy-vault",
  },
  {
    id: "instant_income",
    name: "Instant Income",
    tagline: "Fast-Track Your Earnings",
    icon: Zap,
    color: "violet",
    features: [
      "Everything in Unlimited",
      "Paid Traffic Training",
      "FB Ads Masterclass",
      "Landing Page Builder",
      "Split Testing Tools",
      "1-on-1 Strategy Call",
    ],
    href: "/upgrades/instant-income",
  },
  {
    id: "automated_income",
    name: "Automated Income",
    tagline: "Set It and Forget It",
    icon: Rocket,
    color: "jade",
    features: [
      "Everything in Instant Income",
      "Email Automation System",
      "Auto-Responder Sequences",
      "Traffic Automation Tools",
      "Advanced Analytics Dashboard",
      "Lifetime Updates & Support",
    ],
    href: "/upgrades/automated-income",
  },
  {
    id: "high_ticket_payouts",
    name: "Guaranteed High-Ticket Payouts",
    tagline: "Authority Articles That Convert",
    icon: BookOpen,
    color: "gold",
    features: [
      "100 Long-Form Authority Articles",
      "9 High-Ticket Niches",
      "Affiliate Link Woven Into Every CTA",
      "Preview, Copy Text, or Copy HTML",
      "Medium, LinkedIn, Quora, and Blog Guide",
      "Mark Articles as Used Per Offer",
    ],
    href: "/upgrades/high-ticket-payouts",
  },
  {
    id: "license_rights",
    name: "Reseller & License Rights",
    tagline: "Resell under your brand",
    icon: FileText,
    color: "gold",
    features: [
      "Reseller license",
      "Rebrandable assets",
      "Sales pages",
      "Support docs",
      "Team activation via License Rights ticket",
    ],
    href: "/upgrades/license-rights",
  },
  {
    id: "protector",
    name: "Cyber Protection",
    tagline: "Account Security Overview",
    icon: ShieldCheck,
    color: "violet",
    features: [
      "Real-time security monitoring",
      "Encryption & session status",
      "Account verification dashboard",
      "Server & tool health checks",
      "Recent activity timeline",
    ],
    href: "/upgrades/protector",
  },
]

export default async function UpgradesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground">Your Premium Content</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Access your exclusive training materials, templates, and tools
        </p>
      </div>

      {profile?.upgrade_level !== "free" && (
        <Card highlighted className="glass-strong glow-purple border-border/50">
          <CardContent className="p-6 text-center">
            <p className="text-lg font-bold text-accent">
              Current Plan:{" "}
              {profile?.upgrade_level === "dfy_vault"
                ? "Unlimited"
                : profile?.upgrade_level === "instant_income"
                  ? "Instant Income"
                  : "Automated Income"}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {upgrades.map((upgrade) => {
          const Icon = upgrade.icon
          const isCurrentPlan = profile?.upgrade_level === upgrade.id
          const glowClass = upgrade.color === "violet" ? "glow-violet" : "glow-purple"

          return (
            <Card highlighted key={upgrade.id} className={`glass-strong border-border/50 ${glowClass} flex flex-col`}>
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 glow-purple">
                  <Icon className="w-10 h-10 text-background" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground mb-2">{upgrade.name}</CardTitle>
                <p className="text-base text-muted-foreground">{upgrade.tagline}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 mb-8 flex-1">
                  {upgrade.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-base text-foreground leading-relaxed">{feature}</p>
                    </div>
                  ))}
                </div>
                <Button asChild className={`w-full h-14 text-lg font-bold ${glowClass}`}>
                  <Link href={upgrade.href}>{isCurrentPlan ? "Access Your Content" : "View Details"}</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
