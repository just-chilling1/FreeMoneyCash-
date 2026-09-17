"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Facebook, Twitter, Linkedin, Mail, MessageCircle, Copy, Check } from "lucide-react"
import { useState } from "react"
import { FaPinterest, FaReddit, FaTelegram } from "react-icons/fa"

interface SharePageDialogProps {
  pageUrl: string
  pageTitle: string
}

export function SharePageDialog({ pageUrl, pageTitle }: SharePageDialogProps) {
  const [copied, setCopied] = useState(false)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(pageTitle + " " + pageUrl)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&description=${encodeURIComponent(pageTitle)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(pageTitle)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`,
    email: `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(pageUrl)}`,
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-12 bg-transparent px-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_rgba(207,161,59,0.18)]"
        >
          <Share2 className="mr-2 h-5 w-5" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Share Your Page</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Share your affiliate page across social media to maximize your reach
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleShare("facebook")}
              className="h-14 text-base font-bold bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
            >
              <Facebook className="w-5 h-5 mr-2" />
              Facebook
            </Button>
            <Button
              onClick={() => handleShare("twitter")}
              className="h-14 text-base font-bold bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white"
            >
              <Twitter className="w-5 h-5 mr-2" />
              Twitter
            </Button>
            <Button
              onClick={() => handleShare("linkedin")}
              className="h-14 text-base font-bold bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
            >
              <Linkedin className="w-5 h-5 mr-2" />
              LinkedIn
            </Button>
            <Button
              onClick={() => handleShare("whatsapp")}
              className="h-14 text-base font-bold bg-[#25D366] hover:bg-[#25D366]/90 text-white"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
            <Button
              onClick={() => handleShare("pinterest")}
              className="h-14 text-base font-bold bg-[#E60023] hover:bg-[#E60023]/90 text-white"
            >
              <FaPinterest className="w-5 h-5 mr-2" />
              Pinterest
            </Button>
            <Button
              onClick={() => handleShare("reddit")}
              className="h-14 text-base font-bold bg-[#FF4500] hover:bg-[#FF4500]/90 text-white"
            >
              <FaReddit className="w-5 h-5 mr-2" />
              Reddit
            </Button>
            <Button
              onClick={() => handleShare("telegram")}
              className="h-14 text-base font-bold bg-[#0088cc] hover:bg-[#0088cc]/90 text-white"
            >
              <FaTelegram className="w-5 h-5 mr-2" />
              Telegram
            </Button>
            <Button onClick={() => handleShare("email")} className="h-14 text-base font-bold glass bg-transparent">
              <Mail className="w-5 h-5 mr-2" />
              Email
            </Button>
          </div>

          {/* Copy Link */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Or copy link</p>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 rounded-xl glass text-base text-foreground truncate">{pageUrl}</div>
              <Button onClick={handleCopyLink} className="h-auto px-6 glow-purple">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
