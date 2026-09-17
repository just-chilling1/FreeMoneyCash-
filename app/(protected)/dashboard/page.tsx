import { redirect } from "next/navigation"
import { FileText, Eye, MousePointerClick, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { formatCount, formatMoney, formatPercent, loadDashboardData } from "@/lib/dashboard"
import { StatCard } from "@/components/stat-card"
import { VideoIntroModal } from "@/components/video-intro-modal"
import { DashboardHero } from "@/components/dashboard/hero"
import { DashboardRecentPages } from "@/components/dashboard/recent-pages"
import { DashboardTrainingSection } from "@/components/dashboard/training-section"
import { DashboardQuickActions } from "@/components/dashboard/quick-actions"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export const metadata = {
  title: "Dashboard | Free Money Cash",
  description: "Watch the training, track your profit pages, and take your next step.",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const dashboard = await loadDashboardData(supabase, user)
  const { stats, recentPages, firstName, stories } = dashboard

  return (
    <>
      <VideoIntroModal showRewatchButton={false} />

      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardHero firstName={firstName} stats={stats} />

        <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
          <StatCard
            title="Pages Created"
            value={formatCount(stats.totalPages)}
            icon={FileText}
            hint={stats.totalPages > 0 ? `${formatCount(stats.activePages)} active` : "Create your first page"}
            glowColor="purple"
          />
          <StatCard
            title="Total Views"
            value={formatCount(stats.totalViews)}
            icon={Eye}
            hint={stats.totalViews === 0 && stats.totalPages > 0 ? "Share a page to get traffic" : undefined}
            glowColor="violet"
          />
          <StatCard
            title="Total Clicks"
            value={formatCount(stats.totalClicks)}
            icon={MousePointerClick}
            hint={stats.totalViews > 0 ? `${formatPercent(stats.ctr)} click-through rate` : undefined}
            glowColor="purple"
          />
          <StatCard
            title="Est. Earnings"
            value={formatMoney(stats.estimatedEarnings)}
            icon={DollarSign}
            hint="Based on tracked clicks"
            glowColor="purple"
          />
        </section>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-4">
          <div className="min-w-0 xl:col-span-3">
            <DashboardTrainingSection />
          </div>
          <div className="min-w-0 self-stretch xl:col-span-1 xl:row-span-3">
            <DashboardSidebar stories={stories} />
          </div>
          <div className="min-w-0 xl:col-span-3">
            <DashboardQuickActions />
          </div>
          <div className="min-w-0 xl:col-span-3">
            <DashboardRecentPages pages={recentPages} totalPages={stats.totalPages} />
          </div>
        </div>
      </div>
    </>
  )
}
