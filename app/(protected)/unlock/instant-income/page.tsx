import { UnlockUpgradeClient } from "@/app/(protected)/unlock/UnlockUpgradeClient"

export default function UnlockInstantIncomePage() {
  return (
    <UnlockUpgradeClient
      upgradeLevel="instant_income"
      upgradeName="Instant Income"
      upgradeValue="$97"
      features={[
        "Everything in Unlimited",
        "100+ High-Converting Offers",
        "Advanced training videos",
        "Email swipe files",
        "Social media templates",
      ]}
    />
  )
}
