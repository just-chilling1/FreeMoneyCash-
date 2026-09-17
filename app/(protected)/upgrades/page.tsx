import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Crown, Zap, Rocket } from "lucide-react"
import Link from "next/link"

const upgrades = [
  {
    id: "dfy_vault",
    name: "DFY Vault",
    tagline: "Done-For-You Templates",
    icon: Crown,
    color: "purple",
    features: [
      "50+ Pre-Written Page Templates",
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
      "Everything in DFY Vault",
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
                ? "DFY Vault"
                : profile?.upgrade_level === "instant_income"
                  ? "Instant Income"
                  : "Automated Income"}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
