import { FileText } from "lucide-react"
import { support } from "@/lib/support-config"

export function SupportRefundSection() {
  const { refundPolicy } = support

  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 glass-strong">
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground sm:text-xl">{refundPolicy.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{refundPolicy.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {refundPolicy.items.map((item) => (
          <div
            key={item.title}
            className="flex h-full flex-col rounded-xl border border-border/50 bg-muted/30 p-4"
          >
            <h3 className="mb-2 text-sm font-bold text-primary">{item.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
