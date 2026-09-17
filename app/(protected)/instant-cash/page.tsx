"use client"

import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock3,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const STEPS = [
  {
    title: "Pick a survey",
    description: "Browse Toluna and choose any survey that fits your interests.",
    detail: "Hundreds available",
  },
  {
    title: "Answer honestly",
    description: "Most surveys take just 3–10 minutes. Share your real opinions.",
    detail: "3–10 minutes",
  },
  {
    title: "Get paid",
    description: "Finish the survey and receive cash rewards directly from Toluna.",
    detail: "Instant rewards",
  },
]

const HIGHLIGHTS = [
  { icon: Wallet, label: "Real cash rewards" },
  { icon: Clock3, label: "Start in minutes" },
  { icon: ShieldCheck, label: "No experience needed" },
]

export default function InstantCashPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Button asChild variant="ghost" className="-ml-2 text-muted-foreground hover:text-foreground">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-secondary/15 p-6 shadow-[0_0_40px_rgba(207,161,59,0.14)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Fast Cash Method</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Instant Cash Injection
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Turn spare minutes into real cash by sharing your opinion. No product to sell, no page to build —
                just open Toluna and start earning.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/40 px-3 py-1.5 text-sm text-foreground"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-background/35 p-5 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Banknote className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Partner</p>
            <p className="mt-1 text-xl font-bold text-foreground">Toluna Surveys</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Trusted survey marketplace with paid opportunities available worldwide.
            </p>
            <Button asChild className="mt-5 h-12 w-full font-bold">
              <a href="https://www.toluna.com/en" target="_blank" rel="noopener noreferrer">
                Open Toluna
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">How It Works</h2>
          <p className="text-muted-foreground">Three simple steps from signup to cash rewards.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card
              key={step.title}
              className="group gap-0 border-primary/20 py-0 transition-all duration-200 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_0_24px_rgba(207,161,59,0.14)]"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                    {step.detail}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card
        highlighted
        className="gap-0 overflow-hidden border-primary/40 bg-gradient-to-br from-primary/20 via-card to-secondary/15 py-0 shadow-[0_0_36px_rgba(207,161,59,0.18)]"
      >
        <CardContent className="relative space-y-6 p-6 text-center sm:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Ready when you are</p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Start Taking Surveys Now</h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground">
              Jump into Toluna, complete your first survey, and begin collecting rewards. Perfect when you want cash
              flowing while your profit pages build momentum.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="h-14 w-full text-base font-bold shadow-[0_10px_28px_rgba(207,161,59,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(207,161,59,0.45)] sm:w-auto sm:min-w-[22rem] sm:px-10 sm:text-lg"
          >
            <a href="https://www.toluna.com/en" target="_blank" rel="noopener noreferrer">
              Start Taking Surveys Now
              <ArrowRight className="h-5 w-5" />
            </a>
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Opens in a new tab
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              100% Free to join
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Instant cash rewards
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
