"use client"

import { useEffect, useState } from "react"

const messages = [
  "Sarah M. just earned $127 in commissions!",
  "Mike T. generated his 5th page today!",
  "Jennifer L. reached $1,000 in total earnings!",
  "David R. got 47 clicks on his latest page!",
  "Lisa K. just upgraded to Unlimited!",
  "Tom B. made his first sale in 24 hours!",
]

export function MotivationalTicker() {
  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass border border-accent/30 rounded-xl p-4 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <p className="text-base text-accent font-semibold animate-fade-in">{messages[currentMessage]}</p>
      </div>
    </div>
  )
}
