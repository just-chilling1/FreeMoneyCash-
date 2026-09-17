"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import type { FaqItem, FaqSection } from "@/lib/faq"

function SupportFaqAccordion({ items }: { items: FaqItem[] }) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  return (
    <div className="divide-y divide-border/60">
      {items.map((faq) => {
        const isOpen = expandedKey === faq.q

        return (
          <div key={faq.q}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-1 py-3.5 text-left transition-colors hover:bg-primary/5 sm:px-2"
              onClick={() => setExpandedKey(isOpen ? null : faq.q)}
              aria-expanded={isOpen}
            >
              <span className="text-sm font-medium text-foreground">{faq.q}</span>
              {isOpen ? (
                <ChevronUp size={18} className="shrink-0 text-primary" />
              ) : (
                <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-1 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-2">
                    {faq.a}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export function SupportFaqCardHeader() {
  return (
    <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
        <HelpCircle className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground sm:text-xl">Frequently Asked Questions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick answers about pages, traffic, training, and your account
        </p>
      </div>
    </div>
  )
}

export function SupportFaqSections({ sections }: { sections: FaqSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary sm:px-2">
            {section.title}
          </h3>
          <SupportFaqAccordion items={section.items} />
        </div>
      ))}
    </div>
  )
}
