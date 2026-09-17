"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const TIPS = [
  {
    title: "What to do next",
    body: "Watch the three Start Here videos in order, then build your first profit page and share it for traffic.",
  },
  {
    title: "Tip",
    body: "Keep your first outreach short and clear. Share one page consistently before creating more.",
  },
  {
    title: "Tip",
    body: "Pick a niche you understand — your pages and promotions will sound more natural.",
  },
  {
    title: "Tip",
    body: "After you publish a page, open Share & Promote and post it to at least one platform today.",
  },
]

export function DashboardTipsWidget() {
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length)
    }, 12000)
    return () => window.clearInterval(timer)
  }, [])

  const tip = TIPS[tipIndex]

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Tips</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-zinc-300">{tip.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{tip.body}</p>
          <p className="mt-3 text-xs leading-snug text-zinc-600">Individual results vary.</p>
        </div>
      </CardContent>
    </Card>
  )
}
