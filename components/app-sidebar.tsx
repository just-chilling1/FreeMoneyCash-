'use client'

import {
  Home,
  Zap,
  FileText,
  GraduationCap,
  Crown,
  Settings,
  LogOut,
  Share2,
  DollarSign,
  TrendingUp,
  Sparkles,
  Rocket,
  PanelLeftClose,
  PanelLeftOpen,
  Headphones,
  BookOpen,
  Package,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Build Page', url: '/create', icon: Zap },
  { title: 'Your Pages', url: '/pages', icon: FileText },
  { title: 'Share & Promote', url: '/share', icon: Share2 },
  { title: 'Instant Cash Injection', url: '/instant-cash', icon: DollarSign },
  { title: 'New System to Earn $1,000-$5,000 Per Day', url: '/bonus-training', icon: TrendingUp },
  { title: 'Training', url: '/training', icon: GraduationCap },
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

const COLLAPSE_KEY = 'fmc_sidebar_collapsed'

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(COLLAPSE_KEY) === '1'
    setCollapsed(saved)
    document.documentElement.dataset.sidebar = saved ? 'collapsed' : 'expanded'
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      document.documentElement.dataset.sidebar = next ? 'collapsed' : 'expanded'
      return next
    })
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navLinkClass = (isActive: boolean) =>
    `cyber-sidebar-item flex items-center gap-3 rounded-lg py-3 text-sm font-medium transition-all duration-300 ${
      collapsed ? 'justify-center px-0' : 'px-4'
    } ${isActive ? 'active bg-primary/5 text-primary' : 'text-zinc-400 hover:text-primary/80'}`

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={`border-b border-white/5 ${collapsed ? 'px-3 py-5' : 'p-6'}`}>
        <div className={`flex items-center ${collapsed ? 'flex-col gap-3' : 'gap-3'}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-[0_0_24px_rgba(207,161,59,0.4)]">
            <span className="text-lg font-black italic text-primary-foreground">F</span>
          </div>
          {!collapsed && (
            <Link href="/dashboard" className="min-w-0 flex-1 hover:opacity-90">
              <h1 className="whitespace-nowrap text-lg font-black italic uppercase tracking-tighter text-white">
                FREE&nbsp;MONEY
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50">
                CASH
              </p>
            </Link>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-primary"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </div>

      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2 py-4' : 'p-4'}`}>
        {!collapsed && (
          <p className="mb-2 px-4 text-[10px] uppercase tracking-widest text-zinc-500">Navigation</p>
        )}
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.url
            const Icon = item.icon
            return (
              <motion.li
                key={item.url}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  href={item.url}
                  title={collapsed ? item.title : undefined}
                  className={navLinkClass(isActive)}
                >
                  <Icon size={18} strokeWidth={1.5} className="shrink-0" />
                  {!collapsed && <span className="tracking-wide">{item.title}</span>}
                  {!collapsed && isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      style={{ boxShadow: '0 0 10px rgba(207, 161, 59, 0.5)' }}
                    />
                  )}
                </Link>
              </motion.li>
            )
          })}
        </ul>

        <div className={`${collapsed ? 'mt-6 border-t border-white/5 pt-4' : 'mt-8'}`}>
          <div className={`premium-nav-section ${collapsed ? 'p-1' : 'p-2'}`}>
            {!collapsed && (
              <p className="flex items-center gap-1.5 px-2.5 pt-1.5 pb-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3 w-3 animate-pulse-glow" fill="currentColor" />
                Premium Features
              </p>
            )}
            <ul className="space-y-1">
              {premiumItems.map((item, index) => {
                const isActive = pathname === item.url
                const Icon = item.icon
                return (
                  <motion.li
                    key={item.url}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                  >
                    <Link
                      href={item.url}
                      title={collapsed ? item.title : undefined}
                      className={`premium-sidebar-item flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-300 ${
                        collapsed ? 'justify-center px-0' : 'px-3'
                      } ${isActive ? 'is-active' : ''}`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.5}
                        className={isActive ? 'text-primary' : 'text-primary/80'}
                      />
                      {!collapsed && <span className="tracking-wide">{item.title}</span>}
                      {!collapsed && isActive && (
                        <motion.div
                          layoutId="activePremiumIndicator"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                          style={{ boxShadow: '0 0 10px rgba(207, 161, 59, 0.7)' }}
                        />
                      )}
                    </Link>
                  </motion.li>
                )
              })}
            </ul>
          </div>
        </div>
      </nav>

      <div className={collapsed ? 'px-2 pt-4 pb-2' : 'px-4 pt-4 pb-4'}>
        <Link
          href="/support"
          title={collapsed ? 'Support' : undefined}
          className={`flex items-center gap-2 rounded-lg border border-white/5 bg-primary/5 py-3 transition-colors hover:border-primary/20 hover:bg-primary/10 ${
            collapsed ? 'justify-center px-0' : 'px-4'
          }`}
        >
          <Headphones size={collapsed ? 18 : 14} strokeWidth={1.5} className="shrink-0 text-primary" />
          {!collapsed && (
            <span className="text-xs uppercase tracking-wider text-zinc-400">Support</span>
          )}
        </Link>
      </div>

      <div className={collapsed ? 'p-2' : 'px-4 pb-4'}>
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex w-full items-center gap-3 rounded-lg py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-red-400/5 hover:text-red-400 ${
            collapsed ? 'justify-center px-0' : 'px-4'
          }`}
        >
          <LogOut size={18} strokeWidth={1.5} />
          {!collapsed && <span className="tracking-wide">Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div
        className="fixed top-0 right-0 left-0 z-40 flex h-14 items-center gap-3 border-b border-white/5 bg-background/90 px-4 backdrop-blur lg:hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <span className="text-sm font-black italic text-primary-foreground">F</span>
        </div>
        <span className="whitespace-nowrap text-sm font-black italic uppercase tracking-tighter text-white">
          Free&nbsp;Money&nbsp;Cash
        </span>
      </div>

      <aside
        className="cyber-sidebar fixed top-0 left-0 z-40 hidden h-full transition-[width] duration-300 lg:block"
        style={{ width: 'var(--sidebar-w)' }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
