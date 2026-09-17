"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Sparkles, CheckCircle2, ChevronDown, ExternalLink, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import generatePageAction from "@/app/actions/generate-page"
import { cn } from "@/lib/utils"

interface PageGeneratorProps {
  nicheId: string
  onBack: () => void
}

const GENERATION_STEPS = [
  "Preparing your page",
  "Writing the article",
  "Embedding your affiliate link",
  "Finalizing for publish",
]

export function PageGenerator({ nicheId, onBack }: PageGeneratorProps) {
  const [affiliateLink, setAffiliateLink] = useState("")
  const [affiliateHelpOpen, setAffiliateHelpOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!generating || success) return

    const interval = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, GENERATION_STEPS.length - 1))
    }, 3500)

    return () => clearInterval(interval)
  }, [generating, success])

  const handleGenerate = async () => {
    if (!affiliateLink.trim()) {
      alert("Please enter your affiliate link")
      return
    }

    setGenerating(true)
    setActiveStep(0)

    try {
      const result = await generatePageAction(nicheId, affiliateLink)

      if (!result.success) {
        throw new Error(result.error || "Failed to generate page")
      }

      setActiveStep(GENERATION_STEPS.length)
      setSuccess(true)

      setTimeout(() => {
        router.push("/pages")
      }, 3000)
    } catch (error) {
      console.error("[v0] Error generating page:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate page. Please try again."
      alert(errorMessage)
      setGenerating(false)
      setActiveStep(0)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-xl gap-0 border-primary/30 py-0 shadow-[0_0_28px_rgba(207,161,59,0.12)]">
          <CardContent className="space-y-5 p-8 text-center sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <CheckCircle2 className="h-9 w-9 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Page Created Successfully!</h2>
              <p className="text-base text-muted-foreground">
                Your affiliate page is ready to start earning commissions.
              </p>
            </div>
            <p className="text-sm font-semibold text-primary">Redirecting to your pages...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Generate Your Page</h2>
          <p className="text-base text-muted-foreground">Paste your affiliate link and let AI write the page</p>
        </div>
        <Button variant="outline" onClick={onBack} disabled={generating} className="h-11 shrink-0 bg-transparent">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="gap-0 border-primary/25 py-0">
        <CardContent className="space-y-6 p-5 sm:p-7">
          {!generating && (
            <>
              <div className="space-y-2.5">
                <Label htmlFor="affiliateLink" className="text-base font-semibold">
                  Your Affiliate Link
                </Label>
                <Input
                  id="affiliateLink"
                  type="url"
                  placeholder="https://example.com/your-affiliate-link"
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  className="h-12 text-base"
                />
                <p className="text-sm text-muted-foreground">
                  This is the link where you&apos;ll earn commissions. Get it from your affiliate network.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
                <button
                  type="button"
                  aria-expanded={affiliateHelpOpen}
                  onClick={() => setAffiliateHelpOpen((open) => !open)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-primary/5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-primary sm:text-base">Where to get your affiliate link</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {affiliateHelpOpen ? "Hide DigiStore24 quick start" : "Need a link? Open DigiStore24 quick start"}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-primary transition-transform duration-200",
                      affiliateHelpOpen && "rotate-180",
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-out",
                    affiliateHelpOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-4 border-t border-primary/20 px-4 pb-4 pt-3">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        We recommend{" "}
                        <span className="font-semibold text-foreground">DigiStore24</span> — a free affiliate marketplace
                        with thousands of products you can promote and earn commissions from.
                      </p>

                      <ol className="space-y-3">
                        {[
                          {
                            step: "1",
                            content: (
                              <>
                                Go to{" "}
                                <a
                                  href="https://www.digistore24.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-primary underline underline-offset-2 hover:text-accent"
                                >
                                  digistore24.com
                                </a>{" "}
                                and create a free account
                              </>
                            ),
                          },
                          {
                            step: "2",
                            content: <>Browse products in your niche and click &quot;Promote&quot;</>,
                          },
                          {
                            step: "3",
                            content: <>Copy your unique affiliate link and paste it above</>,
                          },
                        ].map((item) => (
                          <li key={item.step} className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-black text-primary">
                              {item.step}
                            </span>
                            <span className="pt-0.5 text-sm text-muted-foreground">{item.content}</span>
                          </li>
                        ))}
                      </ol>

                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-primary/40 bg-transparent font-bold text-primary hover:bg-primary/10"
                      >
                        <a href="https://www.digistore24.com" target="_blank" rel="noopener noreferrer">
                          Create Free DigiStore24 Account
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {generating && (
            <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-bold text-foreground">Building your page</p>
                  <p className="text-sm text-muted-foreground">
                    This usually takes a little while — we&apos;ll move you forward as soon as it&apos;s ready.
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5">
                {GENERATION_STEPS.map((step, index) => {
                  const isDone = activeStep > index || success
                  const isCurrent = !success && activeStep === index

                  return (
                    <li
                      key={step}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                        isDone && "border-primary/25 bg-primary/10",
                        isCurrent && "border-primary/40 bg-primary/5",
                        !isDone && !isCurrent && "border-border/30 bg-background/20",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                          isDone && "bg-primary text-primary-foreground",
                          isCurrent && "bg-primary/20 text-primary",
                          !isDone && !isCurrent && "bg-muted text-muted-foreground",
                        )}
                      >
                        {isDone ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        ) : isCurrent ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <span className="text-[10px] font-bold">{index + 1}</span>
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isDone || isCurrent ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {step}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/3 animate-[progress-slide_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={generating || !affiliateLink.trim()}
            className="h-14 w-full text-base font-bold sm:h-16 sm:text-lg"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Your Page...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Page with AI
              </>
            )}
          </Button>

          {!generating && (
            <div className="space-y-2 rounded-xl border border-border/40 bg-background/30 p-4">
              <p className="text-sm font-semibold text-primary">What happens next</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>✓ AI writes a 1000-word review article</li>
                <li>✓ Optimized for conversions and compliance</li>
                <li>✓ Your affiliate link embedded automatically</li>
                <li>✓ Ready to share and start earning</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
