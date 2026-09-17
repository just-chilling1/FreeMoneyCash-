import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, GraduationCap, Headphones } from "lucide-react"
import { ACADEMY_TRAINING_VIDEOS } from "@/lib/training-videos"
import { AcademyTrainingVideoCard } from "@/components/dashboard/academy-training-video-card"

export default async function TrainingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: progressRows } = await supabase
    .from("training_progress")
    .select("video_id")
    .eq("user_id", user.id)

  const completedIds = new Set((progressRows ?? []).map((row) => row.video_id as string))
  const total = ACADEMY_TRAINING_VIDEOS.length
  const completedCount = ACADEMY_TRAINING_VIDEOS.filter((v) => completedIds.has(v.id)).length
  const progressPct = total === 0 ? 0 : Math.round((completedCount / total) * 100)
  const allDone = completedCount === total

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="space-y-4">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Academy</p>
        <h1 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">
          Training Center
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Follow these videos in any order to master Free Money Cash and start earning.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/15 via-secondary/10 to-accent/10 p-6 glass-strong sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
              {allDone ? (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              ) : (
                <GraduationCap className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {allDone ? "Training complete — nice work!" : "Your training progress"}
              </p>
              <p className="text-base text-muted-foreground">
                {completedCount} of {total} videos marked complete
              </p>
            </div>
          </div>
          <p className="text-3xl font-black text-primary sm:text-4xl">{progressPct}%</p>
        </div>

        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Training completion"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {ACADEMY_TRAINING_VIDEOS.map((training, index) => (
          <AcademyTrainingVideoCard
            key={training.id}
            video={training}
            index={index}
            completed={completedIds.has(training.id)}
          />
        ))}
      </div>

      <Card className="border-primary/20 glass-strong">
        <CardContent className="space-y-4 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
            <Headphones className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="mb-2 text-2xl font-bold text-foreground">Need More Help?</h3>
            <p className="text-base text-muted-foreground sm:text-lg">
              Questions about the training? Email{" "}
              <a
                href="mailto:support@freemoneycash.com"
                className="font-bold text-primary hover:underline"
              >
                support@freemoneycash.com
              </a>{" "}
              anytime — we usually reply within a few hours.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
