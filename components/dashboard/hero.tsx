import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MotivationalTicker } from "@/components/motivational-ticker"
import { getDashboardCta, type DashboardStats } from "@/lib/dashboard-shared"

export function DashboardHero({ firstName, stats }: { firstName: string; stats: DashboardStats }) {
  const cta = getDashboardCta(stats)

  return (
    <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 flex-1 space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Home</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Welcome to Free Money Cash{firstName && firstName !== "there" ? `, ${firstName}` : ""}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Watch the three videos below in order — then jump into Build Page and start earning. The Training
            Center is there whenever you want a deeper walkthrough.
          </p>
          <p className="text-sm text-muted-foreground">{cta.hint}</p>
        </div>
        <MotivationalTicker />
      </div>

      <Button asChild size="lg" className="h-14 w-full shrink-0 text-base font-bold sm:w-auto">
        <Link href={cta.href}>
          {cta.label}
          <ArrowRight className="h-5 w-5" />
        </Link>
      </Button>
    </section>
  )
}
