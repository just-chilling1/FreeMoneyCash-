"use client"

import { useState } from "react"
import { StepIndicator } from "@/components/step-indicator"
import { NicheSelector } from "@/components/niche-selector"
import { PageGenerator } from "@/components/page-generator"

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null)

  const handleNicheSelect = (nicheId: string) => {
    setSelectedNiche(nicheId)
    setCurrentStep(2)
  }

  const handleBack = () => {
    setCurrentStep(1)
    setSelectedNiche(null)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Create</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Build Your Profit Page
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Two steps: pick a niche, paste your affiliate link, and AI builds your page.
        </p>
      </section>

      <StepIndicator currentStep={currentStep} />

      <div className="min-h-[28rem]">
        {currentStep === 1 && <NicheSelector onSelect={handleNicheSelect} />}
        {currentStep === 2 && selectedNiche && <PageGenerator nicheId={selectedNiche} onBack={handleBack} />}
      </div>
    </div>
  )
}
