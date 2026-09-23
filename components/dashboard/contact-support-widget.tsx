"use client"

import { FormEvent, useEffect, useState } from "react"
import { CheckCircle2, Headphones, Loader2, Lock, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { SUPPORT_EMAIL, support } from "@/lib/support-config"

type FormState = "idle" | "submitting" | "success" | "error"

function openSupportMailto(email: string, message: string) {
  const subject = `${support.productName} — Support Request`
  const body = `Please reply to: ${email}\n\n${message}`
  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

async function parseJsonResponse(res: Response): Promise<{
  error?: string
  useMailto?: boolean
  success?: boolean
} | null> {
  const text = await res.text()
  if (!text.trim()) return {}

  try {
    return JSON.parse(text) as { error?: string; useMailto?: boolean; success?: boolean }
  } catch {
    return null
  }
}

export function ContactSupportWidget() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [formState, setFormState] = useState<FormState>("idle")
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [sentViaMailto, setSentViaMailto] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    void (async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user?.email) setEmail(user.email)
      } catch {
        // Form still works if the session lookup fails.
      }
    })()
  }, [])

  const handleSubmit = async (event: FormEvent) => {
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

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: trimmedEmail, message: trimmedMessage }),
      })

      const data = await parseJsonResponse(res)

      if (data === null || data.useMailto) {
        openSupportMailto(trimmedEmail, trimmedMessage)
        setSubmittedEmail(trimmedEmail)
        setSentViaMailto(true)
        setFormState("success")
        return
      }

      if (res.status === 401) {
        throw new Error("Your session expired. Please refresh the page and try again.")
      }

      if (res.ok && data.success) {
        setSubmittedEmail(trimmedEmail)
        setSentViaMailto(false)
        setFormState("success")
        return
      }

      throw new Error(data.error || "Something went wrong. Please try again.")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.")
      setFormState("error")
    }
  }

  if (formState === "success") {
    return (
      <Card className="min-w-0 overflow-hidden border-primary/25">
        <CardContent className="space-y-5">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-foreground">
              {sentViaMailto ? "Check your email app" : "Message sent"}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {sentViaMailto ? (
                <>
                  Your email app should open with your message ready. Tap{" "}
                  <span className="font-semibold text-foreground">Send</span>, then we&apos;ll reply to{" "}
                  <span className="break-all font-semibold text-foreground">{submittedEmail}</span>. We usually
                  respond within about 2 hours — during busy periods, please allow 24–48 hours.
                </>
              ) : (
                <>
                  We&apos;ll reply to{" "}
                  <span className="break-all font-semibold text-foreground">{submittedEmail}</span>. We usually
                  respond within about 2 hours — during busy periods, please allow 24–48 hours.
                </>
              )}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setFormState("idle")
              setMessage("")
              setSentViaMailto(false)
              setErrorMessage("")
            }}
          >
            Send another message
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="min-w-0 overflow-hidden border-primary/25">
      <CardHeader className="pb-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 p-2.5">
            <Headphones className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">
            Contact Support
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-0">
        <p className="text-sm leading-relaxed text-muted-foreground">
          We usually reply within about 2 hours. Because of high email volume, please allow{" "}
          <span className="font-medium text-foreground">24–48 hours</span> during busy periods. Your answer will
          go to the email you enter below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="support-email" className="text-xs font-semibold uppercase tracking-wide text-primary/90">
              Your email
            </Label>
            <Input
              id="support-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={formState === "submitting"}
            />
          </div>

          <div className="min-w-0 space-y-2">
            <Label
              htmlFor="support-message"
              className="text-xs font-semibold uppercase tracking-wide text-primary/90"
            >
              Your message
            </Label>
            <Textarea
              id="support-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you need help with..."
              required
              disabled={formState === "submitting"}
              rows={4}
              className="min-h-[112px] resize-y"
            />
          </div>

          {formState === "error" && errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

          <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Please note:</span> We will reply to the email address
            you enter above. If you don&apos;t see our reply within 48 hours, check your spam or junk folder.
          </p>

          <Button type="submit" className="w-full" disabled={formState === "submitting"}>
            {formState === "submitting" ? (
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
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 space-y-1">
              <p className="text-xs leading-relaxed text-muted-foreground">
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

        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          We don&apos;t share your contact info with anyone.
        </p>
      </CardContent>
    </Card>
  )
}
