import type React from "react"
import { AnimatedBackground } from "@/components/animated-background"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <AnimatedBackground />
      {children}
    </div>
  )
}
