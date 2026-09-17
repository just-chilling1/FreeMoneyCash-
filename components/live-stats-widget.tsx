"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, CheckCircle2 } from "lucide-react"
import type { DashboardStory } from "@/lib/dashboard-shared"
import { cn } from "@/lib/utils"

const FALLBACK_STORIES: DashboardStory[] = [
  { name: "Sarah M.", amount: 247, action: "earned from her page" },
  { name: "Mike T.", amount: 1834, action: "generated this week" },
  { name: "Jessica R.", amount: 89, action: "earned completing surveys" },
  { name: "Emily W.", amount: 2156, action: "earned this month" },
]

function getDailyBaseValues() {
  const today = new Date().toDateString()
  const seed = today.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const seededRandom = (min: number, max: number, offset: number) => {
    const x = Math.sin(seed + offset) * 10000
    return Math.floor(min + (x - Math.floor(x)) * (max - min + 1))
  }

  const seededRandomFloat = (min: number, max: number, offset: number) => {
    const x = Math.sin(seed + offset) * 10000
    return Number.parseFloat((min + (x - Math.floor(x)) * (max - min)).toFixed(2))
  }

  return {
    articlesPublished: seededRandom(1182, 1367, 1),
    avgFastCash: seededRandomFloat(3.1, 4.25, 2),
    affiliateClicks: seededRandom(8900, 11500, 3),
    activeMembers: seededRandom(2700, 3200, 4),
    totalMoney: seededRandom(42000, 52000, 5),
  }
}

function getStoredStats() {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem("fmc-live-stats")
  const today = new Date().toDateString()

  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.date === today) {
        return parsed.stats
      }
    } catch {
      // ignore bad cache
    }
  }

  return null
}

export function LiveStatsWidget({ stories = [] }: { stories?: DashboardStory[] }) {
  const [stats, setStats] = useState(getDailyBaseValues)
  const [mounted, setMounted] = useState(false)
  const [flickerStates, setFlickerStates] = useState({
    articles: false,
    fastCash: false,
    clicks: false,
    members: false,
    money: false,
  })
  const [currentStory, setCurrentStory] = useState<DashboardStory | null>(null)
  const [isStoryVisible, setIsStoryVisible] = useState(false)
  const rotatingStories = useMemo(() => {
    const merged = [...stories.filter((story) => story.name), ...FALLBACK_STORIES]
    return merged.slice(0, 8)
  }, [stories])

  useEffect(() => {
    setMounted(true)
    const stored = getStoredStats()
    if (stored) {
      setStats(stored)
    } else {
      const baseValues = getDailyBaseValues()
      localStorage.setItem(
        "fmc-live-stats",
        JSON.stringify({ date: new Date().toDateString(), stats: baseValues }),
      )
      setStats(baseValues)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const incrementStats = () => {
      setStats((prev) => {
        const newStats = {
          articlesPublished: prev.articlesPublished + Math.floor(Math.random() * 3) + 1,
          avgFastCash: Number.parseFloat((prev.avgFastCash + Math.random() * 0.05).toFixed(2)),
          affiliateClicks: prev.affiliateClicks + Math.floor(Math.random() * 15) + 5,
          activeMembers: prev.activeMembers + Math.floor(Math.random() * 2),
          totalMoney: prev.totalMoney + Math.floor(Math.random() * 50) + 20,
        }

        const today = new Date().toDateString()
        localStorage.setItem("fmc-live-stats", JSON.stringify({ date: today, stats: newStats }))

        return newStats
      })

      const keys = Object.keys(flickerStates) as Array<keyof typeof flickerStates>
      const randomKey = keys[Math.floor(Math.random() * keys.length)]
      setFlickerStates((prev) => ({ ...prev, [randomKey]: true }))
      setTimeout(() => {
        setFlickerStates((prev) => ({ ...prev, [randomKey]: false }))
      }, 300)
    }

    const interval = setInterval(incrementStats, 5000)
    return () => clearInterval(interval)
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mounted) return

    const showRandomStory = () => {
      const randomStory = rotatingStories[Math.floor(Math.random() * rotatingStories.length)]
      setCurrentStory(randomStory)
      setIsStoryVisible(true)

      setTimeout(() => {
        setIsStoryVisible(false)
      }, 5000)
    }

    const initialStoryTimeout = setTimeout(showRandomStory, 3000)
    const storyInterval = setInterval(
      () => {
        showRandomStory()
      },
      60000 + Math.random() * 60000,
    )

    return () => {
      clearTimeout(initialStoryTimeout)
      clearInterval(storyInterval)
    }
  }, [mounted, rotatingStories])

  const formatNumber = (value: number) => value.toLocaleString("en-US")

  const metricRows = [
    { key: "articles" as const, label: "Articles Today", value: formatNumber(stats.articlesPublished) },
    { key: "fastCash" as const, label: "Avg Fast Cash", value: String(stats.avgFastCash) },
    { key: "clicks" as const, label: "Clicks Tracked", value: formatNumber(stats.affiliateClicks) },
    { key: "members" as const, label: "Active This Week", value: formatNumber(stats.activeMembers) },
  ]

  return (
    <div className="sticky top-4 z-20 space-y-6 lg:top-8">
      <Card className="glass-strong relative gap-0 overflow-hidden border-2 border-primary/30 py-0 shadow-xl [&>div]:gap-3">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

        <CardHeader className="relative z-10 space-y-1 px-4 pb-2 pt-4 text-center">
          <CardTitle className="text-lg font-bold text-white sm:text-xl">What&apos;s happening right now</CardTitle>
          <p className="text-xs font-medium leading-snug text-muted-foreground sm:text-sm">
            Members are generating results every day through Free Money Cash.
          </p>
        </CardHeader>

        <CardContent className="relative z-10 space-y-3 px-4 pb-4">
          <div className="flex flex-col gap-2">
            {metricRows.map((row) => (
              <div
                key={row.key}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-3.5 py-2 transition-all duration-300",
                  flickerStates[row.key] && "border-primary/60 shadow-lg shadow-primary/20",
                )}
              >
                <p className="text-sm font-medium text-muted-foreground">{row.label}</p>
                <p className="text-2xl font-black tabular-nums tracking-tight text-primary">{row.value}</p>
              </div>
            ))}
          </div>

          <div className="flex min-h-[2.5rem] items-center justify-center">
            {isStoryVisible && currentStory ? (
              <div className="w-full animate-in slide-in-from-bottom-3 fade-in duration-500">
                <div className="rounded-lg bg-gradient-to-r from-emerald-500/20 to-primary/20 p-[2px]">
                  <div className="flex items-start gap-3 rounded-lg bg-background/95 p-2.5">
                    <div className="mt-0.5 flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 text-center">
                      <p className="mb-0.5 line-clamp-2 text-xs font-bold text-foreground">
                        {currentStory.name} just {currentStory.action}!
                      </p>
                      <p className="text-sm font-black text-emerald-400">${formatNumber(currentStory.amount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50" />
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-500/25 via-card to-primary/15 p-5 shadow-[0_0_40px_rgba(52,211,153,0.28)] backdrop-blur-md transition-all duration-300",
          flickerStates.money && "scale-[1.02] border-emerald-300 shadow-[0_0_52px_rgba(52,211,153,0.45)]",
        )}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />

        <div className="relative z-10 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300">
              Total Money Generated Today
            </p>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <p className="text-4xl font-black tabular-nums tracking-tight text-emerald-300 sm:text-[2.75rem]">
              ${formatNumber(stats.totalMoney)}
            </p>
            <TrendingUp className="h-7 w-7 shrink-0 text-emerald-400" />
          </div>

          <p className="text-xs font-medium text-muted-foreground">Updating live across Free Money Cash</p>
        </div>
      </div>
    </div>
  )
}
