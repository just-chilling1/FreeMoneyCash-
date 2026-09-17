import Link from "next/link"
import { ArrowRight, Flame } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function BonusPromoCard() {
  return (
    <Card className="overflow-hidden border-primary/35 bg-gradient-to-br from-primary/10 via-card to-secondary/10 shadow-[0_0_28px_rgba(207,161,59,0.12)]">
      <CardContent className="relative space-y-5 p-5 sm:p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
          <Flame className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Bonus Training</span>
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          <p>
            Imagine checking your phone and seeing an extra{" "}
            <span className="font-bold text-foreground">$1,000, $3,000, or even $5,000</span> deposited — without
            grinding a 9-to-5 or chasing side hustles that barely pay.
          </p>
          <p>
            Free Money Cash is a strong start. This bonus training shows the system members use to scale into
            serious daily income.
          </p>
          <p className="font-semibold text-foreground">Ready to multiply what you&apos;re building here?</p>
        </div>

        <Link
          href="/bonus-training"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-center text-sm font-bold text-primary-foreground shadow-[0_8px_24px_rgba(207,161,59,0.35)] transition-all duration-200 hover:bg-accent hover:shadow-[0_10px_28px_rgba(239,190,118,0.4)] sm:text-base"
        >
          Yes! Show Me How To Earn $1,000–$5,000 A Day
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </CardContent>
    </Card>
  )
}
