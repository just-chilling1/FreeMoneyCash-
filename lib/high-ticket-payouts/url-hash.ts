import { createHash } from "crypto"

/** Stable SHA-256 hex for paste-mode High-Ticket usage keys. */
export function hashAffiliateUrl(url: string): string {
  const trimmed = url.trim()
  let normalized = trimmed
  try {
    const parsed = new URL(trimmed)
    parsed.hash = ""
    normalized = parsed.toString()
  } catch {
    // Keep trimmed raw string when URL parsing fails.
  }
  return createHash("sha256").update(normalized).digest("hex")
}
