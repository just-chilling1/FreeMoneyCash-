"use client"

import { motion } from "framer-motion"
import { faqSections } from "@/lib/faq"
import { support } from "@/lib/support-config"
import { SupportHeroSection } from "@/components/support/support-hero"
import { SupportFaqCardHeader, SupportFaqSections } from "@/components/support/support-faq"
import { SupportRefundSection } from "@/components/support/support-refund"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-3">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Help</p>
        <h1 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">
          {support.pageTitle}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{support.pageSubtitle}</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5"
      >
        <motion.div variants={itemVariants}>
          <SupportHeroSection />
        </motion.div>

        <motion.div
          variants={itemVariants}
          id="faq"
          className="overflow-hidden rounded-2xl border border-border/50 glass-strong"
        >
          <SupportFaqCardHeader />
          <div className="px-4 pb-5 pt-2 sm:px-6 sm:pb-6">
            <SupportFaqSections sections={faqSections} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SupportRefundSection />
        </motion.div>
      </motion.div>
    </div>
  )
}
