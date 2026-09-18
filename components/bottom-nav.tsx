'use client'

import {
  Home,
  Zap,
  FileText,
  GraduationCap,
  Menu,
  Sparkles,
  Share2,
  DollarSign,
  TrendingUp,
  Settings,
  Crown,
  Rocket,
  BookOpen,
  Package,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const tabs = [
  { title: 'Home', url: '/dashboard', icon: Home },
  { title: 'Build', url: '/create', icon: Zap },
  { title: 'Pages', url: '/pages', icon: FileText },
  { title: 'Training', url: '/training', icon: GraduationCap },
]

const mainMore = [
  { title: 'Share & Promote', url: '/share', icon: Share2 },
  { title: 'Instant Cash Injection', url: '/instant-cash', icon: DollarSign },
  { title: 'Bonus Training', url: '/bonus-training', icon: TrendingUp },
  { title: 'Settings', url: '/settings', icon: Settings },
]

const premiumItems = [
  { title: 'Done-For-You Profit', url: '/upgrades/dfy-profit', icon: Package },
  { title: 'Unlimited', url: '/upgrades/dfy-vault', icon: Crown },
  { title: 'Instant Income', url: '/upgrades/instant-income', icon: Sparkles },
  { title: 'Automated Income', url: '/upgrades/automated-income', icon: Rocket },
  { title: 'Guaranteed High-Ticket Payouts', url: '/upgrades/high-ticket-payouts', icon: BookOpen },
  { title: 'Reseller & License Rights', url: '/upgrades/license-rights', icon: FileText },
  { title: 'Cyber Protection', url: '/upgrades/protector', icon: ShieldCheck },
]

/** Fixed bottom tab bar for mobile. Hidden on desktop (lg+) where the sidebar lives. */
export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const moreActive = !tabs.some((t) => t.url === pathname)

  return (
    <>
      <nav
        className="fixed right-0 bottom-0 left-0 z-50 border-t border-primary/20 bg-background/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-16">
          {tabs.map((tab) => {
            const isActive = pathname === tab.url
            const Icon = tab.icon
            return (
              <Link
                key={tab.url}
                href={tab.url}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? 'text-primary' : 'text-zinc-500 active:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 right-3 left-3 h-[3px] rounded-b-full bg-gradient-to-r from-primary to-accent" />
                )}
                <Icon className="h-6 w-6" />
                <span className="text-[11px] leading-none font-semibold">{tab.title}</span>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              moreActive ? 'text-primary' : 'text-zinc-500 active:text-white'
            }`}
          >
            {moreActive && (
              <span className="absolute top-0 right-3 left-3 h-[3px] rounded-b-full bg-gradient-to-r from-primary to-accent" />
            )}
            <Menu className="h-6 w-6" />
            <span className="text-[11px] leading-none font-semibold">More</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed right-0 bottom-0 left-0 z-[70] max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-[#CFA13B]/20 bg-background lg:hidden"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
            >
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/15" />
              <div className="flex items-center justify-between px-4 pt-3">
                <p className="text-sm font-black tracking-widest text-white uppercase">More</p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setMoreOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-zinc-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-4">
                <div>
                  <p className="mb-2 px-1 text-[12px] font-semibold tracking-widest text-[#CFA13B]/70 uppercase">
                    Main
                  </p>
                  <div className="space-y-1.5">
                    {mainMore.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.url
                      return (
                        <Link
                          key={item.url}
                          href={item.url}
                          onClick={() => setMoreOpen(false)}
                          className={`flex min-h-[52px] items-center gap-3 rounded-xl border px-4 py-3.5 text-base font-semibold transition-colors ${
                            isActive
                              ? 'border-[#CFA13B]/40 bg-[#CFA13B]/15 text-white'
                              : 'border-transparent text-zinc-300 active:bg-[#CFA13B]/10'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.title}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <div className="premium-nav-section rounded-2xl p-2">
                  <p className="mb-2 flex items-center gap-1.5 px-1 text-[12px] font-semibold tracking-widest text-[#CFA13B] uppercase">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse-glow" />
                    Premium Upgrades
                  </p>
                  <div className="space-y-1.5">
                    {premiumItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.url
                      return (
                        <Link
                          key={item.url}
                          href={item.url}
                          onClick={() => setMoreOpen(false)}
                          className={`premium-sidebar-item flex min-h-[52px] items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${
                            isActive ? 'is-active' : ''
                          }`}
                        >
                          <Icon className="h-5 w-5 text-[#CFA13B]" />
                          {item.title}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreOpen(false)
                      void handleSignOut()
                    }}
                    className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold text-red-400 active:bg-red-400/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
