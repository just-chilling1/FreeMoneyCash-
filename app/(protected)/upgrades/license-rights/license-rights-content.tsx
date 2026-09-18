"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  LayoutTemplate,
  Loader2,
  Lock,
  Mail,
  Palette,
  Play,
  Scale,
  Send,
  Sparkles,
  Tag,
  Unlock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SUPPORT_EMAIL, support } from "@/lib/support-config"
import {
  EDITION_CONTENTS,
  type EditionContent,
  type EditionIconId,
} from "@/lib/license-rights/edition-contents"
import {
  DEFAULT_REQUEST_MESSAGE,
  REQUEST_SUBJECT,
  clearPendingRequest,
  readPendingRequest,
  savePendingRequest,
  submitLicenseRightsRequest,
  type PendingLicenseRightsRequest,
} from "@/lib/license-rights/request"
import { vimeoPlayerUrl } from "@/lib/training-videos"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const TRAINING_VIMEO_ID = "1226547483"
const PRODUCT_NAME = support.productName

const ACTIVATION_STEPS = [
  {
    num: "1",
    title: "Send your request",
    desc: "Tell support you purchased this edition. Your ticket is filed as License Rights.",
  },
  {
    num: "2",
    title: "Team reviews it",
    desc: "We verify the purchase on your account. Typical reply is 2 hours, up to 48.",
  },
  {
    num: "3",
    title: "License unlocks",
    desc: "The reseller edition is activated on your account and the assets below open.",
  },
] as const

type FormState = "idle" | "submitting" | "error"

const EDITION_ICONS: Record<EditionIconId, typeof Scale> = {
  scale: Scale,
  palette: Palette,
  layout: LayoutTemplate,
  book: BookOpen,
}

function EditionContentCard({ item }: { item: EditionContent }) {
  const Icon = EDITION_ICONS[item.icon]

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/10 p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Icon size={20} aria-hidden />
          </div>
          <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-accent/40 bg-accent/15 text-accent">
            <Lock size={10} aria-hidden />
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-foreground">{item.title}</h3>
            <span className="rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent uppercase">
              Locked
            </span>
          </div>
          <p className="text-xs leading-relaxed font-semibold text-muted-foreground">{item.description}</p>
        </div>
      </div>
    </div>
  )
}

function PendingActivationPanel({
  email,
  viaMailto,
  onReset,
}: {
  email: string
  viaMailto: boolean
  onReset: () => void
}) {
  return (
    <div className="space-y-6 rounded-xl border border-primary/25 bg-primary/5 p-6 sm:p-8">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="rounded-full bg-primary/20 p-3">
          <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[11px] font-bold tracking-wide text-accent uppercase">
            <Clock size={12} aria-hidden />
            Awaiting team activation
          </span>
          <h3 className="text-base font-black tracking-tight text-foreground uppercase">Request received</h3>
        </div>
        <p className="text-sm leading-relaxed font-semibold text-muted-foreground">
          {viaMailto ? (
            <>
              Your email app should open with subject <span className="font-black text-foreground">{REQUEST_SUBJECT}</span>.
              Tap <span className="font-black text-foreground">Send</span> to deliver it — then we&apos;ll reply to{" "}
              <span className="font-black break-all text-foreground">{email}</span>.
            </>
          ) : (
            <>
              We&apos;ll reply to <span className="font-black break-all text-foreground">{email}</span> when your reseller
              license is activated.
            </>
          )}{" "}
          We usually respond within about 2 hours — during busy periods, please allow 24–48 hours.
        </p>
        <p className="text-sm leading-relaxed font-semibold text-muted-foreground">
          This edition stays locked until the team activates it. Our reply will go to{" "}
          <span className="font-black break-all text-foreground">{email}</span> only — check that inbox&apos;s spam or junk
          folder if you don&apos;t see it within 48 hours.
        </p>
      </div>

      <Button type="button" variant="outline" onClick={onReset} className="w-full">
        Send another request
      </Button>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-12 animate-pulse rounded-xl bg-muted" />
      <div className="h-36 animate-pulse rounded-xl bg-muted" />
      <div className="h-11 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}

export function LicenseRightsContent() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState(DEFAULT_REQUEST_MESSAGE)
  const [formState, setFormState] = useState<FormState>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [pending, setPending] = useState<PendingLicenseRightsRequest | null>(null)
  const [viaMailto, setViaMailto] = useState(false)
  const [ready, setReady] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email)
      const id = user?.id ?? "anonymous"
      setUserId(id)
      setPending(readPendingRequest(id))
      setReady(true)
    })
  }, [])

  const handleReset = () => {
    if (userId) clearPendingRequest(userId)
    setPending(null)
    setViaMailto(false)
    setFormState("idle")
    setErrorMessage("")
  }

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL)
      setCopiedEmail(true)
      window.setTimeout(() => setCopiedEmail(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      setErrorMessage("")

      const trimmedEmail = email.trim()
      const trimmedMessage = message.trim()

      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setErrorMessage("Please enter a valid email address.")
        setFormState("error")
        return
      }

      if (trimmedMessage.length < 10) {
        setErrorMessage("Please add a bit more detail so we can help you.")
        setFormState("error")
        return
      }

      setFormState("submitting")

      const result = await submitLicenseRightsRequest({
        email: trimmedEmail,
        message: trimmedMessage,
      })

      if (!result.ok) {
        setErrorMessage(result.error)
        setFormState("error")
        return
      }

      if (userId) savePendingRequest(userId, trimmedEmail)
      setPending({ email: trimmedEmail, submittedAt: new Date().toISOString() })
      setViaMailto(result.viaMailto)
      setFormState("idle")
    },
    [email, message, userId],
  )

  const overviewStats = [
    {
      label: "Edition status",
      value: pending ? "Pending review" : "Not activated",
      icon: pending ? Clock : Lock,
    },
    {
      label: "Ticket subject",
      value: REQUEST_SUBJECT,
      icon: Tag,
    },
    {
      label: "Typical reply",
      value: "2–48 hours",
      icon: Clock,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Button asChild variant="ghost" className="border border-primary/60 text-primary hover:border-primary hover:bg-primary/10 hover:text-accent">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="space-y-8">
        <div className="space-y-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-secondary/10 p-8 text-center md:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/40">
            <FileText className="h-12 w-12 text-primary-foreground" />
          </div>
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-primary">Premium</p>
            {ready ? (
              pending ? (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-4 py-2.5">
                  <Clock size={15} className="text-accent" aria-hidden />
                  <span className="text-xs font-black tracking-wider text-accent uppercase">Pending review</span>
                </div>
              ) : (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2.5 text-primary">
                  <Lock size={15} aria-hidden />
                  <span className="text-xs font-black tracking-wider uppercase">Activation required</span>
                </div>
              )
            ) : null}
            <h1 className="mb-4 text-4xl font-black tracking-tight text-foreground lg:text-6xl">
              Reseller & License Rights
            </h1>
            <p className="mb-4 text-xl font-bold text-accent md:text-2xl">Full Turnkey Reseller Edition</p>
            <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-muted-foreground md:text-xl">
              Request activation from our support desk. Your ticket is filed as &quot;{REQUEST_SUBJECT}&quot; and the
              team unlocks this edition on your account.
            </p>
          </div>
          <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
            {EDITION_CONTENTS.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-foreground"
              >
                <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
                {item.title}
              </span>
            ))}
          </div>
        </div>

        <Card highlighted className="overflow-hidden border-primary/20 glass-strong">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
              <div className="relative aspect-video bg-black">
                {!isVideoPlaying ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                    <iframe
                      src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { background: true })}
                      title="Reseller & License Rights preview"
                      allow="autoplay; fullscreen; picture-in-picture"
                      className="pointer-events-none absolute inset-0 h-full w-full border-0"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <Button
                      size="lg"
                      onClick={() => setIsVideoPlaying(true)}
                      className="relative z-10 h-24 w-24 rounded-full border-4 border-primary/40 text-primary-foreground shadow-[0_0_24px_rgba(207,161,59,0.45)] transition-all duration-300 hover:scale-110"
                    >
                      <Play className="ml-1 h-12 w-12 fill-white" />
                    </Button>
                    <div className="absolute right-0 bottom-8 left-0 text-center">
                      <p className="text-xl font-black text-foreground drop-shadow-lg">
                        Watch Reseller & License Rights Tutorial
                      </p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { autoplay: true })}
                    title="Reseller & License Rights training video"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center space-y-4 bg-primary/5 p-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <span className="text-sm font-black tracking-wider text-primary uppercase">Watch First</span>
                </div>
                <h2 className="text-3xl font-black text-foreground">How to request activation</h2>
                <p className="text-lg font-semibold leading-relaxed text-muted-foreground">
                  Watch this to understand how the Full Turnkey Reseller & License Rights Edition works and how to
                  request activation for your {PRODUCT_NAME} account.
                </p>
                <ul className="space-y-2">
                  {["One ticket, subject License Rights", "Team verifies the purchase", "Assets stay locked until then"].map(
                    (item) => (
                      <li key={item} className="flex items-start gap-2 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 glass-strong">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Award className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-[11px] font-black tracking-[0.2em] text-primary uppercase">Included edition</p>
              <h2 className="text-2xl font-black text-foreground">Full Turnkey Reseller Rights</h2>
              <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Sparkles size={15} className="text-primary" aria-hidden />
                Premium reseller edition
              </p>
              <p className="text-base leading-relaxed font-semibold text-muted-foreground">
                Sell {PRODUCT_NAME} under your own brand with turnkey assets. Submit one request below — our team
                handles activation manually.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black tracking-wide text-primary uppercase">
              Subject: {REQUEST_SUBJECT}
            </span>
          </CardContent>
        </Card>

        <Card className="border-primary/20 glass-strong">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-black text-foreground">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              Three steps to activation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {ACTIVATION_STEPS.map((step) => (
                <div key={step.num} className="rounded-xl border border-primary/25 bg-primary/10 p-6">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-black text-primary-foreground">
                    {step.num}
                  </div>
                  <h3 className="mb-3 text-2xl font-black text-foreground">{step.title}</h3>
                  <p className="text-lg leading-relaxed font-semibold text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {overviewStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <span className="text-[11px] font-black tracking-wider text-muted-foreground uppercase">{stat.label}</span>
                </div>
                <p className="text-lg font-black text-foreground">{stat.value}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="scroll-mt-8 xl:col-span-7" id="license-request">
            <Card className="border-primary/20 glass-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground">
                  <FileText className="h-7 w-7 text-primary" />
                  Request activation
                </CardTitle>
                <p className="text-base font-semibold text-muted-foreground">
                  We send your message to support with the title &quot;{REQUEST_SUBJECT}&quot;.
                </p>
              </CardHeader>
              <CardContent>
                {!ready ? (
                  <FormSkeleton />
                ) : pending ? (
                  <PendingActivationPanel email={pending.email} viaMailto={viaMailto} onReset={handleReset} />
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="min-w-0">
                      <Label htmlFor="license-rights-email" className="mb-2 text-xs font-black tracking-wide text-muted-foreground uppercase">
                        Your email
                      </Label>
                      <Input
                        id="license-rights-email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={formState === "submitting"}
                      />
                    </div>

                    <div className="min-w-0">
                      <Label htmlFor="license-rights-message" className="mb-2 text-xs font-black tracking-wide text-muted-foreground uppercase">
                        Your message
                      </Label>
                      <Textarea
                        id="license-rights-message"
                        name="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        disabled={formState === "submitting"}
                        rows={6}
                        className="min-h-[148px] resize-y"
                      />
                    </div>

                    {formState === "error" && errorMessage ? (
                      <p
                        role="alert"
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-300"
                      >
                        {errorMessage}
                      </p>
                    ) : null}

                    <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3">
                      <p className="text-xs leading-relaxed font-semibold text-muted-foreground">
                        <span className="font-black text-foreground">What happens next:</span> Support receives your ticket,
                        verifies your purchase, and replies when the reseller license is ready. Check spam if you
                        don&apos;t hear back within 48 hours.
                      </p>
                    </div>

                    <Button type="submit" disabled={formState === "submitting"} className="min-h-[46px] w-full">
                      {formState === "submitting" ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Send className="h-4 w-4" />
                          Send License Rights request
                        </span>
                      )}
                    </Button>

                    <div className="flex gap-3 rounded-xl border border-border bg-muted/60 px-3 py-3">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-snug font-semibold text-muted-foreground">
                          Form not working? Copy our support email:
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleCopyEmail()}
                            className="text-left text-sm font-bold break-all text-primary hover:underline"
                          >
                            {SUPPORT_EMAIL}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleCopyEmail()}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary",
                            )}
                          >
                            {copiedEmail ? (
                              <>
                                <Check size={12} aria-hidden />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={12} aria-hidden />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-5">
            <Card className="h-full border-primary/20 glass-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-foreground">
                  <Unlock className="h-7 w-7 text-primary" />
                  What you unlock
                </CardTitle>
                <p className="text-sm font-semibold text-muted-foreground">
                  {EDITION_CONTENTS.length} deliverables included after activation
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {EDITION_CONTENTS.map((item) => (
                  <EditionContentCard key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
