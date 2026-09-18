import { UnlockUpgradeClient } from "@/app/(protected)/unlock/UnlockUpgradeClient"

export default function UnlockDFYVaultPage() {
  return (
    <UnlockUpgradeClient
      upgradeLevel="dfy_vault"
      upgradeName="Unlimited"
      upgradeValue="$47"
      features={[
        "200 Done-For-You Pages",
        "Pre-written content in 10 niches",
        "Instant deployment templates",
        "Compliance-checked copy",
      ]}
    />
  )
}
