import { isSafeFetchedUrl } from "@/lib/affiliate-url"

const DEFAULT_TIMEOUT_MS = 8_000

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim()
}

export function deriveNameFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "")
    const stem = host.split(".")[0]
    if (!stem) return "This Offer"
    return stem
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  } catch {
    return "This Offer"
  }
}

export function parseOfferContext(html: string): { title: string; description: string } {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
    ""

  return { title: decodeEntities(title), description: decodeEntities(description) }
}

/**
 * Best-effort read of the affiliate destination for a product name and blurb.
 * Never throws: affiliate URLs frequently cloak, redirect, or block bots, and a
 * failed scrape must not fail the run.
 */
export async function scrapeOfferContext(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<{ productName: string; productContext: string }> {
  const fallbackName = deriveNameFromUrl(url)
  if (!isSafeFetchedUrl(url)) {
    return { productName: fallbackName, productContext: "" }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; WifiCodeBot/1.0)" },
    })
    if (!isSafeFetchedUrl(response.url)) {
      return { productName: fallbackName, productContext: "" }
    }
    if (!response.ok) return { productName: fallbackName, productContext: "" }

    const { title, description } = parseOfferContext((await response.text()).slice(0, 200_000))
    return {
      productName: title ? title.split(/[|\-–—]/)[0].trim() || fallbackName : fallbackName,
      productContext: description || title,
    }
  } catch {
    return { productName: fallbackName, productContext: "" }
  } finally {
    clearTimeout(timeout)
  }
}
