const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
])

function isIpv4(host: string): number[] | null {
  const parts = host.split(".")
  if (parts.length !== 4) return null
  const nums = parts.map((part) => Number(part))
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null
  return nums
}

function isPrivateOrLocalHostname(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase()
  if (BLOCKED_HOSTS.has(host)) return true
  if (host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) return true

  if (host === "::1" || host === "0.0.0.0") return true
  if (host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true

  const ipv4 = isIpv4(host)
  if (ipv4) {
    const [a, b] = ipv4
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 192 && b === 168) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 100 && b >= 64 && b <= 127) return true
  }

  return false
}

function parseHttpsUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim())
    if (url.protocol !== "https:") return null
    if (url.username || url.password) return null
    if (url.port && url.port !== "443") return null
    if (isPrivateOrLocalHostname(url.hostname)) return null
    return url
  } catch {
    return null
  }
}

/** True for public https URLs that are safe to store or fetch server-side. */
export function isValidAffiliateUrl(value: string): boolean {
  return parseHttpsUrl(value) !== null
}

/** Returns the trimmed https URL, or null if it is not a public affiliate URL. */
export function sanitizeAffiliateUrl(value: string): string | null {
  const url = parseHttpsUrl(value)
  return url ? url.toString() : null
}

/** Use for href attributes. Returns null when the value must not be rendered. */
export function safeHref(value: string | null | undefined): string | null {
  if (!value) return null
  return sanitizeAffiliateUrl(value)
}

export function assertSafeFetchUrl(value: string): URL {
  const url = parseHttpsUrl(value)
  if (!url) {
    throw new Error("Blocked URL")
  }
  return url
}

export function isSafeFetchedUrl(value: string): boolean {
  return parseHttpsUrl(value) !== null
}
