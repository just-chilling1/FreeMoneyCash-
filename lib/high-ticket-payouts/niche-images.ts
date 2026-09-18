/**
 * Niche-related featured images for authority articles.
 * Prefers Pixabay (PIXABAY_API_KEY) on the server; falls back to keyworded stock URLs.
 */

const PIXABAY_TIMEOUT_MS = 5_000

/** Visual search phrases tuned for stock libraries (not product brand names). */
export const NICHE_VISUAL_QUERIES: Record<string, string> = {
  "Health & Wellness": "health wellness yoga meditation lifestyle",
  "Finance & Investing": "personal finance investing calculator desk",
  "Fitness & Sports": "fitness gym workout training athlete",
  "Digital Marketing": "digital marketing laptop analytics office",
  "Self-Help & Personal Development": "personal development journaling motivation sunrise",
  "Beauty & Skincare": "skincare beauty cosmetics spa wellness",
  "Education & Learning": "education learning student books laptop",
  "Business & Entrepreneurship": "entrepreneur business startup office meeting",
  "Travel & Lifestyle": "travel lifestyle suitcase adventure destination",
  // Common DFY / Gold Rush style niches
  "Weight Loss": "weight loss fitness healthy food lifestyle",
  "Make Money Online": "online business laptop entrepreneur home office",
  "Dating & Relationships": "happy couple relationship together outdoors",
  "Personal Development": "personal growth journaling coffee morning",
  "Health Supplements": "health supplements vitamins wellness lifestyle",
  "Pet Training": "dog training puppy owner outdoors",
  "Affiliate Marketing": "online marketing laptop workspace entrepreneur",
}

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "to",
  "of",
  "in",
  "on",
  "with",
  "your",
  "best",
  "top",
  "guide",
  "review",
  "reviews",
  "vs",
  "under",
  "how",
  "what",
  "why",
  "is",
  "are",
  "buyers",
  "buyer",
  "buying",
  "tips",
  "avoid",
  "mistakes",
  "honest",
  "worth",
  "picks",
  "complete",
  "beginner",
  "beginners",
  "advanced",
  "pro",
  "step",
  "by",
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w))
}

function hashSeed(text: string): number {
  return text.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

/** Resolve a stock-friendly visual query for a niche / territory label. */
export function nicheVisualQuery(niche: string): string {
  const trimmed = niche.trim()
  if (!trimmed) return "lifestyle professional photography"

  const direct = NICHE_VISUAL_QUERIES[trimmed]
  if (direct) return direct

  const lower = trimmed.toLowerCase()
  for (const [key, query] of Object.entries(NICHE_VISUAL_QUERIES)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return query
    }
  }

  const words = tokenize(trimmed).slice(0, 5)
  return words.length > 0 ? words.join(" ") : "lifestyle professional photography"
}

/** Build a Pixabay `q` string: niche visuals first, then a couple title tokens. */
export function buildPixabayQuery(niche: string, title: string): string {
  const base = nicheVisualQuery(niche)
  const nicheTokens = new Set(tokenize(niche))
  const extra = tokenize(title)
    .filter((w) => !nicheTokens.has(w))
    .slice(0, 2)
    .join(" ")
  return `${base}${extra ? ` ${extra}` : ""}`.slice(0, 100)
}

/**
 * Sync niche-related fallback (no API key). Uses LoremFlickr tags derived from the niche
 * so catalog HTML baked on the client still shows on-niche photos.
 */
export function buildNicheFallbackImageUrl(niche: string, title: string): string {
  const tagPath = nicheVisualQuery(niche)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map(encodeURIComponent)
    .join(",")
  const lock = hashSeed(`${niche}|${title}`) % 100000
  return `https://loremflickr.com/1200/630/${tagPath}?lock=${lock}`
}

interface PixabayHit {
  id?: number
  largeImageURL?: string
  webformatURL?: string
  imageWidth?: number
  imageHeight?: number
}

/**
 * Fetch a horizontal niche-related photo from Pixabay.
 * Returns null when PIXABAY_API_KEY is missing or the request fails.
 */
export async function fetchPixabayNicheImage(
  niche: string,
  title: string,
): Promise<string | null> {
  const apiKey = process.env.PIXABAY_API_KEY?.trim()
  if (!apiKey) {
    console.warn("[rh] PIXABAY_API_KEY not set — using niche fallback image URL")
    return null
  }

  const query = buildPixabayQuery(niche, title)
  if (!query) return null

  const url = new URL("https://pixabay.com/api/")
  url.searchParams.set("key", apiKey)
  url.searchParams.set("q", query)
  url.searchParams.set("image_type", "photo")
  url.searchParams.set("orientation", "horizontal")
  url.searchParams.set("safesearch", "true")
  url.searchParams.set("order", "popular")
  url.searchParams.set("per_page", "40")
  url.searchParams.set("min_width", "800")

  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(PIXABAY_TIMEOUT_MS),
    })
    if (!response.ok) return null

    const data = (await response.json()) as { hits?: PixabayHit[] }
    let hits = (data.hits ?? []).filter((h) => h.largeImageURL || h.webformatURL)
    // Prefer landscape for featured/OG-style images
    hits = hits.filter((h) => (h.imageWidth ?? 0) >= (h.imageHeight ?? 1))
    if (hits.length === 0) return null

    const seed = hashSeed(`${niche}|${title}`)
    const hit = hits[seed % hits.length]
    return hit.largeImageURL || hit.webformatURL || null
  } catch (error) {
    console.warn("[rh] Pixabay featured image fetch failed", error)
    return null
  }
}

/** Pixabay when available; otherwise niche-keyworded fallback URL. */
export async function resolveNicheFeaturedImageUrl(
  niche: string,
  title: string,
): Promise<string> {
  const pixabay = await fetchPixabayNicheImage(niche, title)
  return pixabay ?? buildNicheFallbackImageUrl(niche, title)
}

/** Replace the first featured `<img src="...">` inside article HTML. */
export function replaceFeaturedImageUrl(html: string, imageUrl: string): string {
  return html.replace(/<img\b([^>]*?)\bsrc="[^"]*"/i, `<img$1src="${imageUrl}"`)
}
