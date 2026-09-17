import type { Metadata } from "next"
import SharePageClient from "./SharePageClient"

export const metadata: Metadata = {
  title: "Share Tools | Free Money Cash",
  description: "Share your affiliate pages across social media and track performance",
}

export default function SharePage() {
  return <SharePageClient />
}
