import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { EarningsBanner } from "@/components/earnings-banner"
import { AnimatedBackground } from "@/components/animated-background"
import { BottomNav } from "@/components/bottom-nav"
import { SupportPageBanner } from "@/components/support-page-banner"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <AnimatedBackground />
      <AppSidebar />
      <main className="transition-[padding] duration-300 lg:pl-[var(--sidebar-w)]">
        <div className="min-h-dvh bg-transparent p-4 pt-[calc(env(safe-area-inset-top)+3.5rem)] pb-24 lg:p-8 lg:pt-8 lg:pb-8">
          <EarningsBanner />
          {children}
          <SupportPageBanner />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
