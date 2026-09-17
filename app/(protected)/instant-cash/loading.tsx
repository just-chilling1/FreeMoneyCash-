import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Loading Instant Cash Injection...</p>
      </div>
    </div>
  )
}
