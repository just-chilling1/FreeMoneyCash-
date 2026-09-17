import Link from "next/link"
import { ArrowUpRight, Eye, MousePointerClick } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCount, formatPercent, type DashboardPage } from "@/lib/dashboard-shared"

function statusClass(status: string) {
  if (status === "active") return "bg-emerald-500/15 text-emerald-400"
  if (status === "paused") return "bg-amber-500/15 text-amber-400"
  return "bg-destructive/15 text-destructive"
}

export function DashboardRecentPages({ pages, totalPages }: { pages: DashboardPage[]; totalPages: number }) {
  if (pages.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Recent pages</h2>
          <p className="text-muted-foreground">Your latest profit pages and how they are performing.</p>
        </div>
        {totalPages > pages.length ? (
          <Button asChild variant="outline">
            <Link href="/pages">View all</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4">
        {pages.map((page) => {
          const ctr = page.views > 0 ? (page.clicks / page.views) * 100 : 0

          return (
            <Card key={page.id} className="glass border-border/50 transition-all duration-300 hover:glow-purple">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {page.niche?.icon ? <span className="text-xl">{page.niche.icon}</span> : null}
                    <h3 className="truncate text-lg font-bold text-foreground">{page.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass(page.status)}`}>
                      {page.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {page.niche?.name ? `${page.niche.name} · ` : ""}
                    Created {new Date(page.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="font-semibold tabular-nums text-foreground">{formatCount(page.views)}</span>
                    <span className="text-muted-foreground">views</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MousePointerClick className="h-4 w-4 text-secondary" />
                    <span className="font-semibold tabular-nums text-foreground">{formatCount(page.clicks)}</span>
                    <span className="text-muted-foreground">clicks</span>
                  </div>
                  <p className="text-sm font-semibold text-accent">{formatPercent(ctr)} CTR</p>
                  <Button asChild size="sm" className="ml-auto sm:ml-0">
                    <Link href={`/article/${page.id}`} target="_blank" rel="noopener noreferrer">
                      View
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
