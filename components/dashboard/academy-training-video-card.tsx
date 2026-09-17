"use client"

import { useState, useTransition } from "react"
import { Check, Loader2, Play, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VideoOverlay } from "@/components/ui/video-overlay"
import { vimeoPlayerUrl, type TrainingVideo } from "@/lib/training-videos"
import { getVideoThumbnail } from "@/lib/video-thumbnails"
import { markTrainingComplete, unmarkTrainingComplete } from "@/app/actions/training-progress"

export function AcademyTrainingVideoCard({
  video,
  index,
  completed,
}: {
  video: TrainingVideo
  index: number
  completed: boolean
}) {
  const [open, setOpen] = useState(false)
  const [useVumbnailFallback, setUseVumbnailFallback] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const videoUrl = vimeoPlayerUrl(video.id)
  const preferredThumb = getVideoThumbnail(video.id)
  const thumbSrc = useVumbnailFallback ? `https://vumbnail.com/${video.id}.jpg` : preferredThumb

  const toggleComplete = () => {
    setError("")
    startTransition(async () => {
      const result = completed
        ? await unmarkTrainingComplete(video.id)
        : await markTrainingComplete(video.id)
      if (!result.success) {
        setError(result.error || "Something went wrong")
      }
    })
  }

  return (
    <>
      <Card
        className={`overflow-hidden border transition-all glass-strong ${
          completed
            ? "border-primary/40 shadow-[0_0_28px_rgba(207,161,59,0.15)]"
            : "border-border/50 hover:border-primary/25 hover:shadow-xl"
        }`}
      >
        <CardContent className="p-0">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
            <div className="relative aspect-video bg-[#17180f]">
              {thumbSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbSrc}
                  alt={`${video.title} thumbnail`}
                  loading="lazy"
                  decoding="async"
                  width={1920}
                  height={1080}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => {
                    if (!useVumbnailFallback) setUseVumbnailFallback(true)
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-card to-muted" />
              )}
              <div className={`absolute inset-0 ${thumbSrc ? "thumb-scrim" : "bg-black/40"}`} />

              {completed ? (
                <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  Completed
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={`Play ${video.title}`}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/30 bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-2xl transition-transform duration-300 hover:scale-110 sm:h-20 sm:w-20">
                  <Play className="ml-1 h-8 w-8 fill-current sm:h-10 sm:w-10" />
                </span>
                <span className="text-sm font-semibold text-foreground drop-shadow-lg">
                  Click to Play Video
                </span>
              </button>
            </div>

            <div className="flex flex-col justify-center space-y-5 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xl font-black text-primary-foreground shadow-lg sm:h-14 sm:w-14 sm:text-2xl">
                  {index + 1}
                </div>
                <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  {video.duration}
                </span>
              </div>

              <div>
                <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">{video.title}</h2>
                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {video.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  onClick={() => setOpen(true)}
                  variant="outline"
                  className="border-primary/30 bg-transparent hover:bg-primary/10 hover:text-primary"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch video
                </Button>

                <Button
                  type="button"
                  onClick={toggleComplete}
                  disabled={isPending}
                  className={
                    completed
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      : "bg-primary text-primary-foreground hover:bg-accent"
                  }
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : completed ? (
                    <RotateCcw className="mr-2 h-4 w-4" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {completed ? "Undo complete" : "Mark as complete"}
                </Button>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {open ? <VideoOverlay videoUrl={videoUrl} title={video.title} onClose={() => setOpen(false)} /> : null}
    </>
  )
}
