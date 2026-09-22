export default function PageDetailsLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6" aria-busy="true" aria-label="Loading page details">
      <div className="h-5 w-56 animate-pulse rounded-md bg-muted/50" />

      <div className="glass-strong rounded-2xl border border-border/50 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-muted/50" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-40 animate-pulse rounded bg-muted/50" />
            <div className="h-9 w-3/4 animate-pulse rounded-lg bg-muted/50" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted/50" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded-full bg-muted/50" />
        </div>
        <div className="mt-5 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-28 animate-pulse rounded-full bg-muted/50" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/50 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[76px] animate-pulse bg-muted/40" />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-border/50 pt-6">
          <div className="h-12 min-w-[140px] flex-1 animate-pulse rounded-lg bg-muted/50" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-28 animate-pulse rounded-lg bg-muted/50" />
          ))}
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted/50" />
        </div>
      </div>

      {[1, 2].map((i) => (
        <div key={i} className="glass overflow-hidden rounded-2xl border border-border/50">
          <div className="flex items-start gap-4 border-b border-border/50 px-6 py-4">
            <div className="h-11 w-11 animate-pulse rounded-xl bg-muted/50" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 animate-pulse rounded bg-muted/50" />
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted/50" />
            </div>
          </div>
          <div className="space-y-3 p-6">
            <div className="h-20 animate-pulse rounded-xl bg-muted/40" />
            <div className="h-20 animate-pulse rounded-xl bg-muted/40" />
          </div>
        </div>
      ))}
    </div>
  )
}
