"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowRight,
  Briefcase,
  Dumbbell,
  GraduationCap,
  Heart,
  Leaf,
  Loader2,
  Megaphone,
  Plane,
  Rocket,
  Smartphone,
  Sparkles,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Niche {
  id: string
  name: string
  description: string
  icon: string
}

interface NicheSelectorProps {
  onSelect: (nicheId: string) => void
}

const NICHE_ICONS: Record<string, LucideIcon> = {
  "Dating & Relationships": Heart,
  "Health & Wellness": Leaf,
  "Make Money Online": Wallet,
  "Technology & Gadgets": Smartphone,
  "Fitness & Sports": Dumbbell,
  "Self-Help & Personal Development": Rocket,
  "Finance & Investing": TrendingUp,
  "Digital Marketing": Megaphone,
  "Beauty & Skincare": Sparkles,
  "Education & Learning": GraduationCap,
  "Business & Entrepreneurship": Briefcase,
  "Travel & Lifestyle": Plane,
}

function iconForNiche(name: string): LucideIcon {
  return NICHE_ICONS[name] ?? Sparkles
}

export function NicheSelector({ onSelect }: NicheSelectorProps) {
  const [niches, setNiches] = useState<Niche[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNiches = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("niches").select("*").order("name")

      if (data) {
        setNiches(data.filter((niche) => niche.name !== "General"))
      }
      setLoading(false)
    }

    fetchNiches()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Choose Your Niche</h2>
        <p className="text-base text-muted-foreground">
          Pick the market that fits your offer — you can create more pages later.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/40">
        <div className="divide-y divide-border/40">
          {niches.map((niche) => {
            const Icon = iconForNiche(niche.name)

            return (
              <button
                key={niche.id}
                type="button"
                onClick={() => onSelect(niche.id)}
                className={cn(
                  "group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors duration-200",
                  "hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none",
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary transition-colors group-hover:border-primary/45 group-hover:bg-primary/15">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-foreground sm:text-lg">{niche.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{niche.description}</p>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
