/** Canonical Free Money Cash training videos (Vimeo). Single source of truth. */

export type TrainingVideo = {
  id: string
  title: string
  description: string
  duration: string
}

export function vimeoPlayerUrl(id: string, options?: { autoplay?: boolean; background?: boolean }) {
  const params = new URLSearchParams({
    badge: "0",
    autopause: "0",
    player_id: "0",
    app_id: "58479",
  })

  if (options?.autoplay) {
    params.set("autoplay", "1")
    params.set("controls", "1")
  }

  if (options?.background) {
    params.set("background", "1")
    params.set("muted", "1")
  }

  return `https://player.vimeo.com/video/${id}?${params.toString()}`
}

/** Dashboard Track A — videos 1–3 (same order as ProfitLoop Start Here) */
export const DASHBOARD_TRAINING_VIDEOS = [
  {
    id: "1134298307",
    title: "Watch This First",
    description:
      "Before you build a single page — watch this. It shows you exactly how Free Money Cash works and what to do next.",
    duration: "8 min",
  },
  {
    id: "1134298418",
    title: "Create Your First Profit Page",
    description:
      "Follow along as we create your first money-making page together — niche, offer, and publish in minutes.",
    duration: "12 min",
  },
  {
    id: "1134943080",
    title: "Generate Thousands of Free Clicks",
    description:
      "Discover the exact method to drive free traffic to your pages every day and start earning commissions.",
    duration: "18 min",
  },
] as const satisfies readonly TrainingVideo[]

/** Full Training Center curriculum */
export const ACADEMY_TRAINING_VIDEOS = [
  ...DASHBOARD_TRAINING_VIDEOS,
  {
    id: "1134944459",
    title: "Generate Extra Clicks Instantly",
    description: "Quick technique to boost your traffic instantly with minimal effort.",
    duration: "10 min",
  },
  {
    id: "1134298475",
    title: "How To Make Your First $100 TODAY",
    description: "Special bonus training showing you how to get your first commission fast.",
    duration: "15 min",
  },
] as const satisfies readonly TrainingVideo[]
