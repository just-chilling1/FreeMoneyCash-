import { Play } from "lucide-react"
import { DASHBOARD_TRAINING_VIDEOS } from "@/lib/training-videos"
import { TrainingVideoCard } from "@/components/dashboard/training-video-card"
import { BonusPromoCard } from "@/components/dashboard/bonus-promo-card"

export function DashboardTrainingSection() {
  const [first, second, third] = DASHBOARD_TRAINING_VIDEOS

  return (
    <section id="start-here" className="scroll-mt-24 space-y-6 lg:scroll-mt-6">
      <div className="flex items-center gap-3">
        <Play className="h-7 w-7 text-primary" />
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Start Here</h2>
      </div>

      <TrainingVideoCard
        videoId={first.id}
        title={first.title}
        description={first.description}
        duration={first.duration}
        priority
        markIntroWatched
      />

      <BonusPromoCard />

      <TrainingVideoCard
        videoId={second.id}
        title={second.title}
        description={second.description}
        duration={second.duration}
      />

      <BonusPromoCard />

      <TrainingVideoCard
        videoId={third.id}
        title={third.title}
        description={third.description}
        duration={third.duration}
      />
    </section>
  )
}
