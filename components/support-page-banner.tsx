"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Need Help banner at the end of every protected page, matching the Robinhood layout. */
export function SupportPageBanner() {
  const pathname = usePathname()
  if (pathname === "/support" || pathname.startsWith("/support/")) return null

  return (
    <section aria-labelledby="page-support-heading" className="mx-auto mt-10 w-full max-w-7xl">
      <div className="glass-strong rounded-2xl border border-primary/40 p-6 shadow-[0_0_32px_rgba(207,161,59,0.12)]">
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Headphones className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h3 id="page-support-heading" className="mb-0.5 text-xl font-extrabold text-foreground">
                Need Help?
              </h3>
              <p className="text-sm text-muted-foreground">Priority support available 24/7</p>
            </div>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/support">Contact Support</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
