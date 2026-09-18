import type { User } from "@supabase/supabase-js"
import { support } from "@/lib/support-config"
import {
  formatProtectorDate,
  formatRelativeTime,
  getMembershipStatus,
  getUpgradeLabel,
  shortenUserId,
} from "./account"

const PRODUCT_NAME = support.productName

export interface ProtectorAccountInfo {
  email: string
  fullName: string | null
  membership: string
  premiumTier: string
  memberSince: string
  lastLogin: string
  authProtection: string
  accountId: string
  pagesGenerated: number
}

export interface ProtectorActivityItem {
  id: string
  label: string
  time: string
  sortAt: number
}

export interface ProtectorViewModel {
  account: ProtectorAccountInfo
  activities: ProtectorActivityItem[]
  accountStatus: string
  isEmailVerified: boolean
}

interface UserProfileRow {
  email: string
  full_name: string | null
  upgrade_level: string | null
  pages_generated: number | null
  created_at: string | null
}

export function buildProtectorViewModel(user: User, profile: UserProfileRow | null): ProtectorViewModel {
  const email = profile?.email?.trim() || user.email || "—"
  const fullName =
    profile?.full_name?.trim() ||
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null) ||
    null
  const upgradeLevel = profile?.upgrade_level ?? "free"
  const isEmailVerified = Boolean(user.email_confirmed_at)
  const lastSignIn = user.last_sign_in_at ?? null
  const createdAt = profile?.created_at ?? user.created_at ?? null

  const activities: ProtectorActivityItem[] = []

  if (lastSignIn) {
    activities.push({
      id: "login",
      label: `Successful login to ${PRODUCT_NAME}`,
      time: formatRelativeTime(lastSignIn),
      sortAt: new Date(lastSignIn).getTime(),
    })
  }

  activities.push({
    id: "session",
    label: "Secure session active",
    time: "Now",
    sortAt: Date.now(),
  })

  if (upgradeLevel !== "free") {
    activities.push({
      id: "premium",
      label: `${getUpgradeLabel(upgradeLevel)} premium access confirmed`,
      time: formatRelativeTime(createdAt),
      sortAt: (createdAt ? new Date(createdAt).getTime() : 0) + 1,
    })
  }

  if (createdAt) {
    activities.push({
      id: "created",
      label: `${PRODUCT_NAME} account created`,
      time: formatProtectorDate(createdAt),
      sortAt: new Date(createdAt).getTime(),
    })
  }

  activities.sort((a, b) => b.sortAt - a.sortAt)

  return {
    account: {
      email,
      fullName,
      membership: getMembershipStatus(upgradeLevel),
      premiumTier: getUpgradeLabel(upgradeLevel),
      memberSince: formatProtectorDate(createdAt),
      lastLogin: lastSignIn ? formatRelativeTime(lastSignIn) : "This session",
      authProtection: isEmailVerified ? "Email verified" : "Verification pending",
      accountId: shortenUserId(user.id),
      pagesGenerated: profile?.pages_generated ?? 0,
    },
    activities: activities.slice(0, 5),
    accountStatus: isEmailVerified ? "Verified" : "Pending",
    isEmailVerified,
  }
}
