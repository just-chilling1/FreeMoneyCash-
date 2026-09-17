import { DollarSign, GraduationCap, Zap } from "lucide-react"
import { QuickActionCard } from "@/components/quick-action-card"

export function DashboardQuickActions() {
  return (
    <section aria-labelledby="dashboard-quick-actions" className="w-full">
      <h2 id="dashboard-quick-actions" className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
        Quick actions
      </h2>
      <div className="grid w-full grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        <QuickActionCard
          title="Build New Page"
          description="Create your profit page in under 3 minutes"
          icon={Zap}
          href="/create"
          buttonText="Start Building"
          featured
        />
        <QuickActionCard
          title="Learn & Earn"
          description="Master the system with proven training"
          icon={GraduationCap}
          href="/training"
          buttonText="Watch Now"
        />
        <QuickActionCard
          title="Instant Cash Injection"
          description="Unlock fast-cash methods to start earning sooner"
          icon={DollarSign}
          href="/instant-cash"
          buttonText="Unlock Now"
        />
      </div>
    </section>
  )
}
