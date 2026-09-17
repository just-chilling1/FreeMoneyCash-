"use client"

import { useEffect, useState } from "react"
import { unlockUpgrade } from "@/app/actions/unlock-upgrade"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import Confetti from "react-confetti"

interface UnlockUpgradeClientProps {
  upgradeLevel: "dfy_vault" | "instant_income" | "automated_income"
  upgradeName: string
  upgradeValue: string
  features: string[]
}

export function UnlockUpgradeClient({ upgradeLevel, upgradeName, upgradeValue, features }: UnlockUpgradeClientProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    async function unlock() {
      const result = await unlockUpgrade(upgradeLevel)

      if (result.success) {
        setStatus("success")
        setShowConfetti(true)

        // Stop confetti after 5 seconds
        setTimeout(() => setShowConfetti(false), 5000)
      } else {
        setStatus("error")
      }
    }

    unlock()
  }, [upgradeLevel])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#17180f]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#CFA13B] animate-spin mx-auto mb-4" />
          <p className="text-xl text-white/80">Unlocking your upgrade...</p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#17180f] p-6">
        <div className="max-w-md w-full bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Unlock Failed</h1>
          <p className="text-white/60 mb-6">
            We couldn't unlock your upgrade. Please make sure you're logged in and try again.
          </p>
          <Link href="/dashboard">
            <Button className="w-full bg-[#CFA13B] hover:bg-[#CFA13B]/90 text-[#17180f] font-bold">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#17180f] p-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="max-w-2xl w-full bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-primary/30 shadow-[0_0_50px_rgba(207,161,59,0.3)]">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-[#CFA13B] to-[#747637] rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-accent animate-bounce" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-center text-white mb-3">🎉 Congratulations!</h1>
        <p className="text-xl text-center text-[#CFA13B] mb-6">
          You've unlocked <span className="font-bold">{upgradeName}</span>!
        </p>

        {/* Upgrade Value */}
        <div className="bg-[#17180f]/50 rounded-2xl p-6 mb-6 border border-[#CFA13B]/20">
          <div className="text-center mb-4">
            <span className="text-white/60 text-sm">Upgrade Value</span>
            <p className="text-5xl font-bold text-[#EFBE76]">{upgradeValue}</p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <p className="text-white/80 font-semibold mb-3">What You Just Unlocked:</p>
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#EFBE76] flex-shrink-0 mt-0.5" />
                <span className="text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-bold text-lg py-6 rounded-xl shadow-[0_0_30px_rgba(207,161,59,0.5)]">
              Go to Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <Link href="/training" className="block">
            <Button
              variant="outline"
              className="w-full border-[#CFA13B]/30 text-[#CFA13B] hover:bg-[#CFA13B]/10 font-semibold py-6 rounded-xl bg-transparent"
            >
              Access Training
            </Button>
          </Link>
        </div>

        {/* Footer Message */}
        <p className="text-center text-white/40 text-sm mt-6">
          Your account has been upgraded. All premium features are now available!
        </p>
      </div>
    </div>
  )
}
