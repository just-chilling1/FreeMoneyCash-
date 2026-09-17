import type { User } from "@supabase/supabase-js"
import type { createClient } from "@/lib/supabase/server"
import type { DashboardData, DashboardPage, DashboardStory } from "@/lib/dashboard-shared"

export type { DashboardData, DashboardPage, DashboardStats, DashboardStory } from "@/lib/dashboard-shared"
export {
  formatCount,
  formatMoney,
  formatPercent,
  getDashboardCta,
  INTRO_WATCHED_EVENT,
  INTRO_WATCHED_KEY,
} from "@/lib/dashboard-shared"

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

/** Matches the previous dashboard estimate: 5% of clicks at a $47 commission, scaled to dollars. */
const ESTIMATED_EARNINGS_PER_CLICK = (0.05 * 47) / 100
const RECENT_PAGE_LIMIT = 4

function firstNameFrom(profileName: string | null | undefined, email: string | null | undefined) {
  const fromName = profileName?.trim().split(/\s+/)[0]
  if (fromName) return fromName

  const fromEmail = email?.split("@")[0]?.trim()
  if (fromEmail) return fromEmail

  return "there"
}

function asNiche(value: unknown): { name: string; icon: string } | null {
  if (!value || typeof value !== "object") return null
  const niche = Array.isArray(value) ? value[0] : value
  if (!niche || typeof niche !== "object") return null

  const name = "name" in niche && typeof niche.name === "string" ? niche.name : ""
  const icon = "icon" in niche && typeof niche.icon === "string" ? niche.icon : ""
  if (!name && !icon) return null

  return { name, icon }
}

function parseEarnings(value: string | null | undefined) {
  if (!value) return 0
  const amount = Number.parseFloat(value.replace(/[^0-9.]/g, ""))
  return Number.isFinite(amount) ? amount : 0
}

export async function loadDashboardData(supabase: SupabaseClient, user: User): Promise<DashboardData> {
  const [profileResult, pagesResult, testimonialsResult] = await Promise.all([
    supabase.from("users").select("full_name, upgrade_level").eq("id", user.id).maybeSingle(),
    supabase
      .from("pages")
      .select("id, title, views, clicks, status, created_at, niches (name, icon)")
      .eq("user_id", user.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false }),
    supabase.from("testimonials").select("user_name, earnings").order("created_at", { ascending: false }).limit(6),
  ])

  if (profileResult.error) {
    console.error("Dashboard profile query failed:", profileResult.error.message)
  }
  if (pagesResult.error) {
    console.error("Dashboard pages query failed:", pagesResult.error.message)
  }
  if (testimonialsResult.error) {
    console.error("Dashboard testimonials query failed:", testimonialsResult.error.message)
  }

  const pages: DashboardPage[] = (pagesResult.data ?? []).map((page) => ({
    id: page.id,
    title: page.title,
    views: page.views || 0,
    clicks: page.clicks || 0,
    status: page.status,
    created_at: page.created_at,
    niche: asNiche(page.niches),
  }))

  const totalPages = pages.length
  const activePages = pages.filter((page) => page.status === "active").length
  const totalViews = pages.reduce((sum, page) => sum + page.views, 0)
  const totalClicks = pages.reduce((sum, page) => sum + page.clicks, 0)
  const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

  const stories: DashboardStory[] = (testimonialsResult.data ?? [])
    .map((item) => ({
      name: item.user_name,
      amount: parseEarnings(item.earnings),
      action: "shared a win inside Free Money Cash",
    }))
    .filter((story) => story.name)

  return {
    firstName: firstNameFrom(profileResult.data?.full_name, user.email),
    upgradeLevel: profileResult.data?.upgrade_level || "free",
    recentPages: pages.slice(0, RECENT_PAGE_LIMIT),
    stats: {
      totalPages,
      activePages,
      totalViews,
      totalClicks,
      ctr,
      estimatedEarnings: totalClicks * ESTIMATED_EARNINGS_PER_CLICK,
    },
    stories,
  }
}
