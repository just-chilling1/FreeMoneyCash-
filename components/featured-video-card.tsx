"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Sparkles } from "lucide-react"
import { useState } from "react"
import { INTRO_WATCHED_EVENT, INTRO_WATCHED_KEY } from "@/lib/dashboard-shared"

export function FeaturedVideoCard() {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    localStorage.setItem(INTRO_WATCHED_KEY, "true")
    window.dispatchEvent(new Event(INTRO_WATCHED_EVENT))
    setIsPlaying(true)
  }

  return (
    <Card
      highlighted
      className="glass-strong h-full gap-0 overflow-hidden border-border/50 py-0 glow-purple ring-4 ring-primary/30 shadow-2xl shadow-primary/50"
    >
      <CardContent className="flex h-full flex-col p-0">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-5 sm:p-6">
          <div className="mb-2 flex items-center gap-3">
            <Sparkles className="h-5 w-5 animate-pulse text-primary sm:h-6 sm:w-6" />
            <span className="text-xs font-black uppercase tracking-wider text-primary sm:text-sm">Must Watch First</span>
          </div>
          <h3 className="mb-2 text-2xl font-black text-foreground sm:text-3xl">Watch this to get started</h3>
          <p className="text-base font-semibold text-muted-foreground sm:text-lg">
            This short video shows you exactly how to use Free Money Cash
          </p>
        </div>

        <div className="relative aspect-video bg-black">
          {!isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
              <div className="absolute inset-0">
                <iframe
                  src="https://player.vimeo.com/video/1134294445?badge=0&autopause=0&player_id=0&app_id=58479&background=1&muted=1"
                  title="Free Money Cash Welcome Preview"
                  allow="autoplay; fullscreen; picture-in-picture"
                  className="pointer-events-none absolute inset-0 h-full w-full border-0"
                />
              </div>

              <div className="absolute inset-0 bg-black/40" />

              <Button
                type="button"
                size="lg"
                aria-label="Play welcome video"
                onClick={handlePlay}
                className="relative z-10 h-20 w-20 rounded-full border-4 border-white/20 bg-primary text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-accent sm:h-28 sm:w-28"
              >
                <Play className="ml-1 h-10 w-10 fill-white sm:h-14 sm:w-14" />
              </Button>

              <div className="absolute right-0 bottom-16 left-0 text-center sm:bottom-6">
                <p className="text-lg font-black text-white drop-shadow-lg sm:text-xl">Click to play</p>
              </div>
            </div>
          ) : (
            <div className="relative h-full w-full">
              <iframe
                src="https://player.vimeo.com/video/1134294445?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&controls=1"
                title="Free Money Cash Welcome"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
