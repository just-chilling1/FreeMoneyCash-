import Link from "next/link"
import { ArrowLeft, FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PageDetailsNotFound() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="glass-strong rounded-2xl border border-border/50 p-10 text-center sm:p-14">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
          <FileQuestion className="h-9 w-9" aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-foreground">We couldn&apos;t find that page</h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          It may have been deleted, or the link you followed doesn&apos;t belong to your account.
        </p>
        <Button asChild className="mt-8 h-12 px-6 text-base font-bold glow-purple">
          <Link href="/pages">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Your Pages
          </Link>
        </Button>
      </div>
    </div>
  )
}
