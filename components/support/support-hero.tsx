"use client"

import { Clock, Headphones, Shield, Star } from "lucide-react"
import { support } from "@/lib/support-config"

const STAT_ICONS = {
  clock: Clock,
  star: Star,
  shield: Shield,
} as const

export function SupportHeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-card/80 shadow-[0_0_40px_rgba(207,161,59,0.08)] glass-strong">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 p-5 sm:p-6 md:p-8">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 text-primary shadow-[0_0_24px_-8px_rgba(207,161,59,0.45)]">
            <Headphones size={26} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
              Member support
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Get help from our team
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Browse the FAQ below for quick answers about pages, traffic, training, and your
              account. Prefer email? Reach us at{" "}
              <a href={`mailto:${support.email}`} className="font-semibold text-primary hover:underline">
                {support.email}
              </a>
              .
            </p>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {support.stats.map((stat, index) => {
            const Icon = STAT_ICONS[stat.icon]
            const isPrimary = index === 0

            return (
              <li
                key={stat.label}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 ${
                  isPrimary
                    ? "border-emerald-500/25 bg-emerald-500/10"
                    : "border-border/50 bg-muted/40"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isPrimary ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon size={17} />
                </div>
                <div className="min-w-0">
                  {"highlight" in stat && stat.highlight ? (
                    <>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-sm font-semibold text-emerald-400">{stat.highlight}</p>
                    </>
                  ) : (
                    <p className="text-sm font-medium leading-snug text-foreground">{stat.label}</p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
