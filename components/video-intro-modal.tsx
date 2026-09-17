"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Play, X } from "lucide-react"
import { INTRO_WATCHED_EVENT, INTRO_WATCHED_KEY } from "@/lib/dashboard-shared"

interface VideoIntroModalProps {
  videoUrl?: string
  title?: string
  description?: string
  showRewatchButton?: boolean
}

export function VideoIntroModal({
  videoUrl = "https://player.vimeo.com/video/1134294445?badge=0&autopause=0&player_id=0&app_id=58479",
  title = "Welcome to Free Money Cash!",
  description = "Watch this quick 2-minute intro to learn how to create your first high-converting affiliate page.",
  showRewatchButton = true,
}: VideoIntroModalProps) {
  const [open, setOpen] = useState(false)
  const [hasWatched, setHasWatched] = useState(false)

  useEffect(() => {
    // Check if user has already watched the intro
    const watched = localStorage.getItem(INTRO_WATCHED_KEY)
    if (!watched) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setHasWatched(true)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
    localStorage.setItem(INTRO_WATCHED_KEY, "true")
    window.dispatchEvent(new Event(INTRO_WATCHED_EVENT))
    setHasWatched(true)
  }

  const handleSkip = () => {
    handleClose()
  }

  return (
    <>
      {/* Rewatch button - shows after user has watched once */}
      {showRewatchButton && hasWatched ? (
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          size="lg"
          className="fixed right-4 bottom-24 z-50 glass-strong border-primary/50 transition-all duration-300 hover:border-primary hover:glow-purple lg:right-6 lg:bottom-6"
        >
          <Play className="w-5 h-5 mr-2" />
          Watch Intro Again
        </Button>
      ) : null}

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setOpen(true)
            return
          }
          handleClose()
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl overflow-hidden border-primary/30 p-0 glass-strong"
        >
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-bold text-foreground">{title}</DialogTitle>
                <DialogDescription className="text-lg text-muted-foreground">{description}</DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </DialogHeader>

          {/* Video Container */}
          <div className="relative w-full aspect-video bg-black/50">
            <iframe
              src={videoUrl}
              title="Free Money Cash Introduction"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-4 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleSkip}
              className="glass hover:glass-strong border-border/50 hover:border-primary/50 transition-all duration-300 bg-transparent"
            >
              Skip for Now
            </Button>
            <Button
              size="lg"
              onClick={handleClose}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-background font-bold glow-purple transition-all duration-300"
            >
              Let's Get Started!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
