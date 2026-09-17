"use client"

import { useState } from "react"
import { Clock, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { VideoOverlay } from "@/components/ui/video-overlay"
import { vimeoPlayerUrl } from "@/lib/training-videos"
import { getVideoThumbnail } from "@/lib/video-thumbnails"
import { INTRO_WATCHED_EVENT, INTRO_WATCHED_KEY } from "@/lib/dashboard-shared"
import { cn } from "@/lib/utils"

type TrainingVideoCardProps = {
  videoId: string
  title: string
  description: string
  duration: string
  priority?: boolean
  markIntroWatched?: boolean
  className?: string
}

export function TrainingVideoCard({
  videoId,
  title,
  description,
  duration,
  priority = false,
  markIntroWatched = false,
  className,
}: TrainingVideoCardProps) {
  const [open, setOpen] = useState(false)
  const [useVumbnailFallback, setUseVumbnailFallback] = useState(false)
  const videoUrl = vimeoPlayerUrl(videoId)
  const preferredThumb = getVideoThumbnail(videoId)
  const thumbSrc = useVumbnailFallback ? `https://vumbnail.com/${videoId}.jpg` : preferredThumb

  const handleOpen = () => {
    if (markIntroWatched) {
      localStorage.setItem(INTRO_WATCHED_KEY, "true")
      window.dispatchEvent(new Event(INTRO_WATCHED_EVENT))
    }
    setOpen(true)
  }

  return (
    <Card
      highlighted={priority}
      className={cn(
        "glass-strong gap-0 overflow-hidden border-border/50 py-0",
        priority && "ring-2 ring-primary/40",
        className,
      )}
    >
      <CardContent className="flex flex-col p-0">
        <div className="space-y-1 p-5 pb-4">
          <h3 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        </div>

        <div className="relative aspect-video bg-zinc-900">
          {thumbSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbSrc}
              alt={`${title} thumbnail`}
              decoding="async"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              width={1920}
              height={1080}
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => {
                if (!useVumbnailFallback) setUseVumbnailFallback(true)
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
          )}
          <div className={`absolute inset-0 ${thumbSrc ? "thumb-scrim" : "bg-black/40"}`} />
          <button
            type="button"
            onClick={handleOpen}
            aria-label={`Play ${title}`}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 bg-gradient-to-br from-primary to-secondary text-white shadow-2xl transition-transform duration-300 hover:scale-110 sm:h-24 sm:w-24">
              <Play className="ml-1 h-10 w-10 fill-white sm:h-12 sm:w-12" />
            </span>
            <span className="text-sm font-semibold text-white drop-shadow-lg sm:text-base">
              ▶ Click to Play Video
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 py-4 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{duration}</span>
        </div>
      </CardContent>

      {open ? <VideoOverlay videoUrl={videoUrl} title={title} onClose={() => setOpen(false)} /> : null}
    </Card>
  )
}
