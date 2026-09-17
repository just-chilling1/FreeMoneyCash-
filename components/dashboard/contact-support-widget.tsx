"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, Headphones, Loader2, Lock, Mail, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { SUPPORT_EMAIL, supportRoutes } from "@/lib/support-config"

export function ContactSupportWidget() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const rootRef = useRef<HTMLDivElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    void (async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user?.email) setEmail(user.email)
      } catch {
        // Ignore auth lookup failures (offline / blocked network); form still works.
      }
    })()
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
    }
  }, [open])

  useEffect(() => {
    if (!open || sent) return

    const id = window.setTimeout(() => {
      if (email.trim()) {
        messageInputRef.current?.focus()
      } else {
        emailInputRef.current?.focus()
      }
    }, 50)

    return () => window.clearTimeout(id)
  }, [open, sent, email])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError("")

    const trimmedEmail = email.trim()
    const trimmedMessage = message.trim()

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    if (trimmedMessage.length < 10) {
      setError("Please add a bit more detail so we can help you.")
      return
    }

    setSubmitting(true)

    const subject = "Free Money Cash — Support Request"
    const body = `Please reply to: ${trimmedEmail}\n\n${trimmedMessage}`
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    setSent(true)
    setSubmitting(false)
  }

  return (
    <div
      ref={rootRef}
      className="fixed z-50 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-4 flex flex-col items-end sm:bottom-6 sm:right-6"
    >
      <AnimatePresence>
        {open ? (
          <motion.div
            key="support-panel"
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 w-[min(100vw-2rem,360px)] origin-bottom-right"
          >
            <Card className="overflow-hidden border-primary/20 shadow-2xl shadow-black/40">
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5">
                    <Headphones className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-white">
                      Need help?
                    </CardTitle>
                    <p className="mt-0.5 text-[11px] text-zinc-400">We typically reply within 2 hours</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-zinc-400 hover:text-white"
                  aria-label="Close support"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="max-h-[min(70dvh,560px)] space-y-5 overflow-y-auto pt-2">
                {sent ? (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 p-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      </div>
                      <h3 className="text-base font-black uppercase tracking-tight text-white">
                        Check your email app
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                        Your email app should open with your message ready. Tap{" "}
                        <span className="font-semibold text-white">Send</span>, then we&apos;ll reply to{" "}
                        <span className="break-all font-semibold text-white">{email}</span>. We usually
                        respond within about 2 hours — during busy periods, please allow 24–48 hours.
                      </p>
                    </div>
                    <Button type="button" variant="outline" className="w-full" onClick={() => setSent(false)}>
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed text-zinc-300">
                      We usually reply within about 2 hours. Because of high email volume, please allow{" "}
                      <span className="font-medium text-white">24–48 hours</span> during busy periods. Your
                      answer will go to the email you enter below.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="support-email"
                          className="text-xs font-semibold uppercase tracking-wide text-primary/90"
                        >
                          Your email
                        </Label>
                        <Input
                          ref={emailInputRef}
                          id="support-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="support-message"
                          className="text-xs font-semibold uppercase tracking-wide text-primary/90"
                        >
                          Your message
                        </Label>
                        <Textarea
                          ref={messageInputRef}
                          id="support-message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell us what you need help with..."
                          required
                          disabled={submitting}
                          rows={4}
                          className="min-h-[112px] resize-y"
                        />
                      </div>

                      {error ? <p className="text-sm text-red-400">{error}</p> : null}

                      <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3 text-xs leading-relaxed text-zinc-400">
                        <span className="font-semibold text-zinc-300">Please note:</span> We will reply to the
                        email address you enter above. If you don&apos;t see our reply within 48 hours, check
                        your spam or junk folder.
                      </p>

                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          "Send message"
                        )}
                      </Button>
                    </form>

                    <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                        <div className="min-w-0 space-y-1">
                          <p className="text-xs leading-relaxed text-zinc-400">
                            If the form doesn&apos;t work, email us directly:
                          </p>
                          <a
                            href={`mailto:${SUPPORT_EMAIL}`}
                            className="block break-all text-sm font-semibold text-primary hover:underline"
                          >
                            {SUPPORT_EMAIL}
                          </a>
                        </div>
                      </div>
                    </div>

                    <p className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-500">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      We don&apos;t share your contact info with anyone.
                    </p>

                    <Link
                      href={supportRoutes.faq}
                      onClick={() => setOpen(false)}
                      className="block text-center text-xs font-semibold text-primary hover:underline"
                    >
                      Browse FAQ on Support page
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close support" : "Need help? Contact support"}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110 active:scale-95"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Headphones className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  )
}
