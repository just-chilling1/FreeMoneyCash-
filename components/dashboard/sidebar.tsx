import { DashboardTipsWidget } from "@/components/dashboard/dashboard-tips-widget"
import { PremiumUpgradesWidget } from "@/components/dashboard/premium-upgrades-widget"
import { LiveStatsWidget } from "@/components/live-stats-widget"
import type { DashboardStory } from "@/lib/dashboard-shared"

export function DashboardSidebar({ stories }: { stories: DashboardStory[] }) {
  return (
    <aside className="flex min-w-0 flex-col gap-6 xl:h-full">
      <DashboardTipsWidget />
      <PremiumUpgradesWidget />
      <LiveStatsWidget stories={stories} />
    </aside>
  )
}
