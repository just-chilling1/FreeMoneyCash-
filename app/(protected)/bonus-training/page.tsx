import Link from "next/link"

export default function BonusTrainingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      <div className="text-center">
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-primary">
          Member Bonus Training
        </p>
        <h1 className="text-balance text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Watch The Bonus Training That Took Me To Earning{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            $1,000–$5,000 Per Day
          </span>
          ...
        </h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-[0_0_40px_rgba(207,161,59,0.12)] ring-1 ring-inset ring-white/5">
        <div className="aspect-video bg-[#17180f]">
          <iframe
            title="Bonus Training Video"
            src="/bonus-training-player.html"
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>

      <Link
        href="https://freedomescapexcelerator.com/2k-per-day"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center rounded-xl bg-primary px-8 py-6 text-center text-xl font-black text-primary-foreground shadow-[0_12px_36px_rgba(207,161,59,0.35)] transition-all duration-200 hover:bg-accent hover:shadow-[0_14px_40px_rgba(239,190,118,0.4)] sm:py-7 sm:text-2xl md:text-3xl"
      >
        Click Here To Continue &gt;&gt;
      </Link>
    </div>
  )
}
