"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Circle, GraduationCap, Share2, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { INTRO_WATCHED_EVENT, INTRO_WATCHED_KEY } from "@/lib/dashboard-shared"

type Step = {
  id: "watch" | "build" | "share"
  title: string
  description: string
  href: string
  action: string
  done: boolean
  icon: typeof Zap
}

export function GettingStarted({ hasPage, hasTraffic }: { hasPage: boolean; hasTraffic: boolean }) {
  const [watched, setWatched] = useState(false)

  useEffect(() => {
    const syncWatched = () => {
      setWatched(localStorage.getItem(INTRO_WATCHED_KEY) === "true")
    }

    syncWatched()
    window.addEventListener(INTRO_WATCHED_EVENT, syncWatched)
    window.addEventListener("storage", syncWatched)
    return () => {
      window.removeEventListener(INTRO_WATCHED_EVENT, syncWatched)
      window.removeEventListener("storage", syncWatched)
    }
  }, [])

  const steps: Step[] = [
    {
      id: "watch",
      title: "Watch the welcome video",
      description: "See exactly how to launch your first profit page.",
      href: "#start-here",
      action: "Watch now",
      done: watched,
      icon: GraduationCap,
    },
    {
      id: "build",
      title: "Build your first page",
      description: "Pick a niche and generate a live page in minutes.",
      href: "/create",
      action: "Start building",
      done: hasPage,
      icon: Zap,
    },
    {
      id: "share",
      title: "Share it for traffic",
      description: "Get your page in front of people and start tracking clicks.",
      href: "/share",
      action: "Open share tools",
      done: hasTraffic,
      icon: Share2,
    },
  ]

  const completed = steps.filter((step) => step.done).length
  if (completed === steps.length) return null

  return (
    <Card className="glass-strong border-primary/30">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your next steps</h2>
            <p className="text-muted-foreground">
              {completed} of {steps.length} complete — finish these to start earning.
            </p>
          </div>
          <p className="text-sm font-semibold text-primary">{Math.round((completed / steps.length) * 100)}% ready</p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${(completed / steps.length) * 100}%` }}
          />
        </div>

        <ol className="grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <li key={step.id} className="rounded-xl border border-border/50 bg-background/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  {step.done ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <Check className="h-4 w-4" />
                      Done
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Circle className="h-3 w-3" />
                      Step {index + 1}
                    </span>
                  )}
                </div>
                <h3 className="mb-1 text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                <Button asChild variant={step.done ? "outline" : "default"} className="w-full">
                  <Link href={step.href}>{step.done ? "Review" : step.action}</Link>
                </Button>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
