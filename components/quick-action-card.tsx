import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface QuickActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  buttonText: string
  glowColor?: "purple" | "violet" | "jade"
  featured?: boolean
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  buttonText,
  glowColor = "purple",
  featured = false,
}: QuickActionCardProps) {
  const glowClass = glowColor === "violet" ? "glow-violet" : "glow-purple"

  return (
    <Card
      highlighted={featured}
      className={cn(
        "glass h-full w-full min-w-0 gap-0 border-border/50 py-0",
        "[&>div.relative]:flex [&>div.relative]:h-full [&>div.relative]:min-h-0 [&>div.relative]:flex-1 [&>div.relative]:flex-col",
        glowClass,
        featured && "ring-1 ring-primary/40",
      )}
    >
      <CardContent className="flex h-full flex-1 flex-col p-6">
        <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary glow-purple sm:h-16 sm:w-16">
          <Icon className="h-7 w-7 text-white sm:h-8 sm:w-8" />
        </div>
        <h3 className="mb-2 shrink-0 text-xl font-bold text-foreground sm:text-2xl">{title}</h3>
        <p className="min-h-[3rem] flex-1 text-base leading-relaxed text-muted-foreground sm:min-h-[3.25rem]">
          {description}
        </p>
        <Button
          asChild
          className="mt-6 h-12 w-full shrink-0 whitespace-normal text-base font-bold sm:h-14 sm:text-lg"
          size="lg"
          variant={featured ? "default" : "outline"}
        >
          <Link href={href}>{buttonText}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
