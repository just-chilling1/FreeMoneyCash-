"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, BookOpen, Crown, FileText, Package, Rocket, ShieldCheck, Sparkles } from "lucide-react"

const PREMIUM_FEATURES = [
  {
    href: "/upgrades/dfy-profit",
    label: "Done-For-You Profit",
    description: "One link and one niche become videos, an article, and Facebook posts.",
    icon: Package,
  },
  {
    href: "/upgrades/dfy-vault",
    label: "Unlimited",
    description: "200 done-for-you pages. Preview one, then publish it with your link.",
    icon: Crown,
  },
  {
    href: "/upgrades/instant-income",
    label: "Instant Income",
    description: "Fast-track methods to start earning sooner.",
    icon: Sparkles,
  },
  {
    href: "/upgrades/automated-income",
    label: "Automated Income",
    description: "Systems that keep commissions coming in.",
    icon: Rocket,
  },
  {
    href: "/upgrades/high-ticket-payouts",
    label: "Guaranteed High-Ticket Payouts",
    description: "100 authority articles with your offer link woven in.",
    icon: BookOpen,
  },
  {
    href: "/upgrades/license-rights",
    label: "Reseller & License Rights",
    description: "Request reseller license rights — our team activates the edition.",
    icon: FileText,
  },
  {
    href: "/upgrades/protector",
    label: "Cyber Protection",
    description: "Keep your account and links safe and healthy.",
    icon: ShieldCheck,
  },
]

export function PremiumUpgradesWidget() {
  const pathname = usePathname()

  return (
    <div className="premium-nav-section rounded-2xl p-2">
      <div className="px-3 pb-3 pt-2.5">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
          <Sparkles className="h-4 w-4 animate-pulse" fill="currentColor" />
          Premium Upgrades
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Unlock the tools that drive the biggest results.
        </p>
      </div>

      <div className="space-y-2">
        {PREMIUM_FEATURES.map((feature) => {
          const isActive = pathname === feature.href
          const Icon = feature.icon

          return (
            <Link
              key={feature.href}
              href={feature.href}
              className={`group flex items-start gap-3 rounded-xl border px-3 py-3 transition-all duration-300 ${
                isActive
                  ? "border-primary/40 bg-primary/15"
                  : "border-transparent hover:border-primary/25 hover:bg-primary/10"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br transition-all duration-300 ${
                  isActive
                    ? "from-primary to-secondary text-primary-foreground shadow-[0_0_16px_rgba(207,161,59,0.45)]"
                    : "from-primary/25 to-secondary/20 text-primary group-hover:from-primary group-hover:to-secondary group-hover:text-primary-foreground"
                }`}
              >
                <Icon size={19} strokeWidth={1.5} />
              </div>

              <div className="min-w-0 flex-1">
                <span className={`block text-sm font-bold tracking-wide ${isActive ? "text-foreground" : "text-zinc-100"}`}>
                  {feature.label}
                </span>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>

              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-primary/30 text-foreground"
                    : "bg-white/5 text-zinc-500 group-hover:translate-x-0.5 group-hover:bg-primary/30 group-hover:text-foreground"
                }`}
              >
                <ArrowRight size={14} />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
