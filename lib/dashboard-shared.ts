export type DashboardPage = {
  id: string
  title: string
  views: number
  clicks: number
  status: string
  created_at: string
  niche: { name: string; icon: string } | null
}

export type DashboardStory = {
  name: string
  amount: number
  action: string
}

export type DashboardStats = {
  totalPages: number
  activePages: number
  totalViews: number
  totalClicks: number
  ctr: number
  estimatedEarnings: number
}

export type DashboardData = {
  firstName: string
  upgradeLevel: string
  recentPages: DashboardPage[]
  stats: DashboardStats
  stories: DashboardStory[]
}

export const INTRO_WATCHED_KEY = "fmc-intro-watched"
export const INTRO_WATCHED_EVENT = "fmc-intro-watched"

export function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

export function getDashboardCta(stats: DashboardStats) {
  if (stats.totalPages === 0) {
    return {
      href: "/create",
      label: "Build Your First Page",
      hint: "Create your first profit page in under 3 minutes.",
    }
  }

  if (stats.totalViews === 0) {
    return {
      href: "/share",
      label: "Share Your Pages",
      hint: "Your pages are live. Share them to start getting traffic.",
    }
  }

  return {
    href: "/create",
    label: "Build Another Page",
    hint: `${formatCount(stats.totalViews)} views and ${formatCount(stats.totalClicks)} clicks across ${formatCount(stats.totalPages)} ${stats.totalPages === 1 ? "page" : "pages"}.`,
  }
}
