import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-lg text-muted-foreground">Loading your Free Money Cash...</p>
      </div>
    </div>
  )
}
