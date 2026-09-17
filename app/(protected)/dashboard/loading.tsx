export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1 space-y-4">
          <div className="h-4 w-28 rounded-lg bg-muted/50 animate-pulse" />
          <div className="h-12 w-72 max-w-full rounded-lg bg-muted/50 animate-pulse sm:w-96" />
          <div className="h-6 w-full max-w-xl rounded-lg bg-muted/50 animate-pulse" />
          <div className="h-14 rounded-xl bg-muted/50 animate-pulse" />
        </div>
        <div className="h-14 w-full rounded-xl bg-muted/50 animate-pulse sm:w-56" />
      </div>

      <div className="h-48 rounded-2xl bg-muted/50 animate-pulse" />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-4">
        <div className="space-y-6 xl:col-span-3">
          <div className="h-8 w-40 rounded-lg bg-muted/50 animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-h-[22rem] rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
        <div className="space-y-6 xl:col-span-1">
          <div className="min-h-[20rem] rounded-2xl bg-muted/50 animate-pulse" />
          <div className="h-28 rounded-2xl bg-muted/50 animate-pulse" />
          <div className="min-h-[16rem] rounded-2xl bg-muted/50 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
