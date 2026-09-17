"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Smartphone, DollarSign, TrendingUp } from "lucide-react"

export function EarningsBanner() {
  const pathname = usePathname()

  // Skip promo strip on pages where it isn't useful.
  if (
    pathname === "/bonus-training" ||
    pathname === "/settings" ||
    pathname === "/support" ||
    pathname.startsWith("/support/")
  ) {
    return null
  }

  return (
    <div className="mb-6 w-full rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/20 via-secondary/15 to-accent/20 p-6 md:p-8 glass-strong">
      <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
        <div className="flex-shrink-0">
          <div className="relative flex h-40 w-40 items-center justify-center md:h-52 md:w-52">
            <div className="relative">
              <Smartphone className="h-24 w-24 text-foreground/90 md:h-32 md:w-32" strokeWidth={1.5} />
              <DollarSign
                className="absolute -top-2 -right-2 h-12 w-12 animate-pulse text-primary md:h-16 md:w-16"
                strokeWidth={2.5}
              />
              <TrendingUp
                className="absolute -bottom-2 -left-2 h-10 w-10 text-accent md:h-12 md:w-12"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="mb-3 text-xl font-bold text-foreground md:text-2xl">
            Want To Multiply Your Earnings To{" "}
            <span className="text-primary">$1,000 – $5,000</span> A Day?
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Free Money Cash is great, but if you want to scale to truly life-changing income, you need to watch this
            training which shows how to make the serious big boy big girl money. And guess what?
            <br />
            <br />
            This training is free if you&apos;re a Free Money Cash member. So, if you want to watch the training, just
            tap the button below.
          </p>
          <Link
            href="/bonus-training"
            className="inline-block rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-[0_8px_24px_rgba(207,161,59,0.3)] transition-colors duration-200 hover:bg-accent"
          >
            Click Here To Learn How
          </Link>
        </div>
      </div>
    </div>
  )
}
