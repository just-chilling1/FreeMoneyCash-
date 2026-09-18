import type { VideoOpportunity } from "@/lib/video-opportunity"

export type { VideoOpportunity }

export interface FetchVideosInput {
  productName: string
  productDescription: string
  keyword?: string
  mode: "trending" | "niche"
}

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/
/** Shorts below this view count are excluded from Gold Rush results. */
const MIN_VIEWS = 50_000

/** Too broad to search or match on alone — causes irrelevant viral results. */
const GENERIC_WORDS = new Set([
  "money", "make", "course", "teach", "people", "online", "system", "program",
  "using", "learn", "guide", "best", "free", "easy", "fast", "quick", "help",
  "start", "started", "works", "work", "method", "secret", "secrets", "tips",
  "trick", "tricks", "hack", "hacks", "simple", "steps", "step", "ways",
  "income", "profit", "profits", "business", "success", "successful",
])

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "your", "you", "are", "was",
  "how", "what", "when", "who", "why", "can", "get", "has", "have", "had", "not",
  "but", "all", "any", "our", "out", "day", "way", "new", "old", "one", "two",
  "teaches", "about", "into", "over", "after", "before", "without",
])

type NicheProfile = {
  titleKeywords: string[]
  searchQueries: string[]
}

async function callChatGpt(prompt: string): Promise<string | null> {
  const rapidApiKey = process.env.RAPIDAPI_KEY
  const rapidApiHost = process.env.RAPIDAPI_HOST || "chatgpt-42.p.rapidapi.com"

  if (!rapidApiKey) return null

  try {
    const response = await fetchWithTimeout(`https://${rapidApiHost}/gpt4o`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": rapidApiHost,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        web_access: false,
      }),
      cache: "no-store",
    }, 9000)

    if (!response.ok) {
      console.error("[youtube] AI keyword extraction failed:", response.status)
      return null
    }

    const data = await response.json()
    if (typeof data.result === "string") return data.result
    if (data.choices?.[0]?.message?.content) return data.choices[0].message.content
    if (data.message?.content) return data.message.content
    if (typeof data === "string") return data
    return null
  } catch (error) {
    console.error("[youtube] AI keyword extraction error:", error)
    return null
  }
}

function parseAiSearchProfile(text: string): NicheProfile | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0]) as {
      searchQueries?: unknown
      titleKeywords?: unknown
    }

    const searchQueries = Array.isArray(parsed.searchQueries)
      ? parsed.searchQueries
          .filter((q): q is string => typeof q === "string" && q.trim().length >= 3)
          .map((q) => q.trim())
          .slice(0, 6)
      : []

    const titleKeywords = Array.isArray(parsed.titleKeywords)
      ? parsed.titleKeywords
          .filter((k): k is string => typeof k === "string" && k.trim().length >= 3)
          .map((k) => k.trim().toLowerCase())
          .slice(0, 15)
      : []

    if (searchQueries.length === 0 || titleKeywords.length === 0) return null

    return { searchQueries, titleKeywords }
  } catch {
    return null
  }
}

/** Use AI to understand the product and derive YouTube search keywords. */
async function extractSearchProfileWithAI(
  productName: string,
  productDescription: string,
  userKeyword?: string,
): Promise<NicheProfile | null> {
  const prompt = `You help affiliate marketers find the right YouTube Shorts to comment on.

PRODUCT NAME: ${productName}
PRODUCT DESCRIPTION: ${productDescription}
${userKeyword ? `USER'S NICHE KEYWORD: ${userKeyword}` : ""}

Understand what this product is really about and who the target audience is. Then figure out what viral YouTube Shorts that audience watches — where leaving a helpful comment with an affiliate link would feel natural.

Return ONLY valid JSON (no markdown, no explanation):
{
  "searchQueries": ["query 1", "query 2", "query 3", "query 4", "query 5"],
  "titleKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"]
}

RULES:
- searchQueries: 5 specific YouTube search phrases real people would use (2-5 words each). These must match the product niche exactly.
- titleKeywords: 8-12 words/phrases that relevant video TITLES would contain. Include synonyms and related terms.
- Do NOT use generic phrases like "make money online", "online course", "side hustle", "passive income" unless the product is specifically about that exact topic.
- Focus on the TOPIC of the product (e.g. crypto → "bitcoin trading", "crypto investing", "ethereum price").
- Think about what Shorts the buyer of this product already watches before buying.
${userKeyword ? `- Include "${userKeyword}" as one search query and related terms in titleKeywords.` : ""}`

  console.log("[youtube] AI analyzing product for search keywords...")
  const aiResponse = await callChatGpt(prompt)
  if (!aiResponse) return null

  const profile = parseAiSearchProfile(aiResponse)
  if (!profile) {
    console.error("[youtube] Failed to parse AI keyword response")
    return null
  }

  console.log("[youtube] AI keywords:", profile)
  return profile
}

const NICHE_PATTERNS: Array<{ pattern: RegExp; profile: NicheProfile }> = [
  {
    pattern: /crypto|bitcoin|ethereum|blockchain|defi|nft|altcoin|trading crypto/i,
    profile: {
      titleKeywords: ["crypto", "cryptocurrency", "bitcoin", "ethereum", "blockchain", "trading", "altcoin", "defi", "nft", "btc", "eth", "binance", "coinbase"],
      searchQueries: ["crypto trading shorts", "cryptocurrency investing", "bitcoin trading tips", "make money crypto", "crypto for beginners"],
    },
  },
  {
    pattern: /weight loss|lose weight|keto|diet|fat loss|slim|calories/i,
    profile: {
      titleKeywords: ["weight", "keto", "diet", "fat", "calories", "pounds", "lbs", "slim", "fitness", "workout", "gym"],
      searchQueries: ["weight loss transformation", "keto diet results", "lose weight fast", "fat loss tips"],
    },
  },
  {
    pattern: /dropship|ecommerce|e-commerce|shopify|amazon fba/i,
    profile: {
      titleKeywords: ["dropship", "dropshipping", "shopify", "ecommerce", "amazon", "fba", "store", "selling online"],
      searchQueries: ["dropshipping tutorial", "shopify store", "amazon fba beginner", "ecommerce side hustle"],
    },
  },
  {
    pattern: /forex|day trad|stock market|investing|investment/i,
    profile: {
      titleKeywords: ["forex", "trading", "stocks", "invest", "market", "portfolio", "dividend", "options"],
      searchQueries: ["stock market investing", "day trading tips", "forex trading beginner", "investing for beginners"],
    },
  },
  {
    pattern: /affiliate|clickbank|digistore|jvzoo/i,
    profile: {
      titleKeywords: ["affiliate", "clickbank", "commission", "passive", "marketing", "promote"],
      searchQueries: ["affiliate marketing beginner", "make money affiliate", "clickbank tutorial"],
    },
  },
  {
    pattern: /ai |artificial intelligence|chatgpt|midjourney/i,
    profile: {
      titleKeywords: ["ai", "chatgpt", "artificial", "automation", "prompt", "midjourney", "openai"],
      searchQueries: ["make money with ai", "chatgpt tutorial", "ai side hustle", "ai tools"],
    },
  },
  {
    pattern: /water|survival|prepper|off grid/i,
    profile: {
      titleKeywords: ["water", "survival", "prepper", "offgrid", "off-grid", "filter", "well", "drought"],
      searchQueries: ["water survival tips", "off grid water", "emergency water filter", "prepper water"],
    },
  },
]

function getRapidApiKey(): string | undefined {
  return process.env.RAPIDAPI_KEY
}

/** Fetch with a hard timeout so a slow upstream can never hang the server action. */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

function isValidYouTubeVideoId(videoId: string): boolean {
  return YOUTUBE_ID_PATTERN.test(videoId)
}

function getSignificantWords(text: string): string[] {
  return (
    text
      .toLowerCase()
      .match(/\b[a-z]{4,}\b/g)
      ?.filter((word) => !STOP_WORDS.has(word) && !GENERIC_WORDS.has(word)) ?? []
  )
}

function detectNicheProfile(productName: string, productDescription: string): NicheProfile {
  const combined = `${productName} ${productDescription}`

  for (const { pattern, profile } of NICHE_PATTERNS) {
    if (pattern.test(combined)) {
      return profile
    }
  }

  const nameWords = getSignificantWords(productName)
  return {
    titleKeywords: nameWords,
    searchQueries: nameWords.length > 0 ? [`${productName.trim()} shorts`] : [productName.trim()],
  }
}

/** Build focused YouTube search queries — never single generic words like "money". */
function buildSearchQueries(
  productName: string,
  productDescription: string,
  niche: NicheProfile,
  userKeyword?: string,
): string[] {
  const queries = new Set<string>()

  const trimmedName = productName.trim()
  if (trimmedName.length >= 3) {
    queries.add(trimmedName)
    queries.add(`${trimmedName} shorts`)
  }

  if (userKeyword && userKeyword.length >= 3) {
    queries.add(userKeyword)
    queries.add(`${userKeyword} shorts`)
  }

  for (const query of niche.searchQueries) {
    queries.add(query)
  }

  const significant = getSignificantWords(`${productName} ${productDescription}`)
  for (const word of significant.slice(0, 2)) {
    if (word.length >= 5) {
      queries.add(`${word} shorts`)
    }
  }

  return [...queries]
    .filter((q) => {
      const words = q.toLowerCase().split(/\s+/).filter((w) => w.length >= 3 && w !== "shorts")
      return words.some((w) => !GENERIC_WORDS.has(w))
    })
    .slice(0, 6)
}

function isTitleRelevant(title: string, titleKeywords: string[]): boolean {
  if (titleKeywords.length === 0) return true

  const lowerTitle = title.toLowerCase().replace(/#/g, " ")

  for (const keyword of titleKeywords) {
    const kw = keyword.toLowerCase().replace(/#/g, " ").trim()
    if (kw.length >= 3 && lowerTitle.includes(kw)) return true

    const words = kw.split(/\s+/).filter((w) => w.length >= 4)
    if (words.some((w) => lowerTitle.includes(w))) return true
  }

  return false
}

function mapRawVideoWithMinViews(
  video: Record<string, unknown>,
  relevanceScore: number,
  minViews: number,
): VideoOpportunity | null {
  const videoId = String(video.videoId || "")
  if (!isValidYouTubeVideoId(videoId)) return null

  const viewCount = parseInt(String(video.viewCount || "0"))
  if (viewCount < minViews) return null

  const likeCount = parseInt(String(video.likeCount || "0"))
  const commentCount = parseInt(String(video.commentCount || "0"))

  const metrics = calculateOpportunityMetrics({
    statistics: {
      viewCount: viewCount.toString(),
      likeCount: likeCount.toString(),
      commentCount: commentCount.toString(),
    },
  })

  const thumbnail = video.thumbnail as Array<{ url?: string }> | undefined

  return {
    videoId,
    title: String(video.title || "Untitled"),
    channelTitle: String(video.channelTitle || video.channelName || "Unknown Channel"),
    thumbnailUrl: thumbnail?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    viewCount,
    likeCount,
    commentCount,
    publishedAt: String(video.publishedTime || new Date().toISOString()),
    relevanceScore,
    ...metrics,
  }
}

function calculateRelevanceScore(title: string, titleKeywords: string[], searchQueries: string[]): number {
  const lowerTitle = title.toLowerCase()
  let score = 0

  for (const keyword of titleKeywords) {
    if (lowerTitle.includes(keyword.toLowerCase())) {
      score += keyword.length >= 8 ? 3 : 2
    }
  }

  for (const query of searchQueries) {
    const phrase = query.replace(/\s*shorts\s*$/i, "").trim().toLowerCase()
    if (phrase.length >= 4 && lowerTitle.includes(phrase)) {
      score += 4
    }
  }

  return score
}

function calculateOpportunityMetrics(video: {
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string }
}): { estimatedClicks: number; viralScore: number } {
  const views = parseInt(video.statistics?.viewCount || "0")
  const likes = parseInt(video.statistics?.likeCount || "0")
  const comments = parseInt(video.statistics?.commentCount || "0")

  const engagementRate = views > 0 ? ((likes + comments * 3) / views) * 100 : 0
  const viralScore = Math.min(100, Math.round(engagementRate * 1000))

  const baseClickRate = 0.00001
  const bonusClickRate = (viralScore / 100) * 0.00009
  const clickRate = baseClickRate + bonusClickRate
  const rawClicks = views * clickRate
  const estimatedClicks = Math.max(10, Math.min(99, Math.round(rawClicks)))

  return { estimatedClicks, viralScore }
}

function mapRawVideo(video: Record<string, unknown>, relevanceScore: number): VideoOpportunity | null {
  return mapRawVideoWithMinViews(video, relevanceScore, MIN_VIEWS)
}

async function isVideoAvailable(videoId: string): Promise<boolean> {
  if (!isValidYouTubeVideoId(videoId)) return false

  try {
    const response = await fetchWithTimeout(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`,
      { method: "GET", cache: "no-store" },
      5000,
    )
    return response.ok
  } catch {
    return false
  }
}

/** Validate availability in parallel; if the whole step is slow, keep the candidates. */
async function validateVideos(videos: VideoOpportunity[]): Promise<VideoOpportunity[]> {
  try {
    const checks = await Promise.all(
      videos.map(async (video) => ((await isVideoAvailable(video.videoId)) ? video : null)),
    )
    const valid = checks.filter((v): v is VideoOpportunity => v !== null)
    return valid.length > 0 ? valid : videos
  } catch {
    return videos
  }
}

async function searchShortsByQuery(query: string, sortBy: "views" | "date" = "views"): Promise<Record<string, unknown>[]> {
  const apiKey = getRapidApiKey()
  if (!apiKey) return []

  const encodedQuery = encodeURIComponent(query)

  try {
    const response = await fetchWithTimeout(
      `https://yt-api.p.rapidapi.com/search?query=${encodedQuery}&type=shorts&sort_by=${sortBy}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "yt-api.p.rapidapi.com",
        },
        cache: "no-store",
      },
      8000,
    )

    if (!response.ok) {
      console.error("[youtube] RapidAPI search failed:", response.status, query)
      return []
    }

    const data = await response.json()
    return Array.isArray(data.data) ? data.data : []
  } catch (error) {
    console.error("[youtube] RapidAPI search error:", query, error)
    return []
  }
}

async function searchWithYouTubeApi(query: string): Promise<Record<string, unknown>[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return []

  try {
    const publishedAfter = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString()
    const searchQuery = query.includes("shorts") ? query : `${query} shorts`
    const searchUrl =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&maxResults=25&order=viewCount&publishedAfter=${encodeURIComponent(publishedAfter)}&q=${encodeURIComponent(searchQuery)}&key=${encodeURIComponent(apiKey)}`

    const searchResponse = await fetchWithTimeout(searchUrl, { cache: "no-store" }, 8000)
    if (!searchResponse.ok) {
      console.error("[youtube] YouTube API search failed:", searchResponse.status, query)
      return []
    }

    const searchData = await searchResponse.json()
    const ids = (searchData.items || [])
      .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
      .filter(Boolean)

    if (ids.length === 0) return []

    const videosUrl =
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${encodeURIComponent(ids.join(","))}&key=${encodeURIComponent(apiKey)}`

    const videosResponse = await fetch(videosUrl, { cache: "no-store" })
    if (!videosResponse.ok) return []

    const videosData = await videosResponse.json()

    return (videosData.items || []).map((video: Record<string, unknown>) => {
      const snippet = video.snippet as Record<string, unknown> | undefined
      const statistics = video.statistics as Record<string, string> | undefined
      const thumbnails = snippet?.thumbnails as Record<string, { url?: string }> | undefined

      return {
        videoId: video.id,
        title: snippet?.title,
        channelTitle: snippet?.channelTitle,
        viewCount: statistics?.viewCount,
        likeCount: statistics?.likeCount,
        commentCount: statistics?.commentCount,
        publishedTime: snippet?.publishedAt,
        thumbnail: thumbnails?.medium?.url
          ? [{ url: thumbnails.medium.url }]
          : thumbnails?.default?.url
            ? [{ url: thumbnails.default.url }]
            : [],
      }
    })
  } catch (error) {
    console.error("[youtube] YouTube API search failed:", error)
    return []
  }
}

/** Prefer YouTube Data API — RapidAPI often returns unrelated trending Shorts. */
async function searchVideos(query: string): Promise<Record<string, unknown>[]> {
  const youtubeResults = await searchWithYouTubeApi(query)
  if (youtubeResults.length > 0) return youtubeResults

  return searchShortsByQuery(query, "views")
}

export async function searchVideoOpportunities(input: FetchVideosInput): Promise<VideoOpportunity[]> {
  try {
    return await fetchVideoOpportunitiesInternal(input)
  } catch (error) {
    console.error("[youtube] fetchVideoOpportunities failed:", error)
    return []
  }
}

async function fetchVideoOpportunitiesInternal(input: FetchVideosInput): Promise<VideoOpportunity[]> {
  const userKeyword = input.mode === "niche" ? input.keyword?.trim() : undefined

  const aiProfile = await extractSearchProfileWithAI(
    input.productName,
    input.productDescription,
    userKeyword,
  )

  const fallbackProfile = detectNicheProfile(input.productName, input.productDescription)

  const titleKeywords = [
    ...new Set([
      ...fallbackProfile.titleKeywords.map((k) => k.toLowerCase()),
      ...(aiProfile?.titleKeywords ?? []),
      ...getSignificantWords(`${input.productName} ${input.productDescription}`),
    ]),
  ]

  const queries = [
    ...new Set([
      ...(userKeyword ? [userKeyword, `${userKeyword} shorts`] : []),
      ...(aiProfile?.searchQueries ?? []),
      ...buildSearchQueries(input.productName, input.productDescription, fallbackProfile, userKeyword),
    ]),
  ].slice(0, 6)

  if (queries.length === 0) {
    console.error("[youtube] No search terms derived from product info")
    return []
  }

  console.log("[youtube] Gold Rush search:", {
    source: aiProfile ? "ai+rules" : "rules",
    queries,
    titleKeywords,
  })

  const searchBatches = await Promise.all(queries.map((query) => searchVideos(query)))
  const seenIds = new Set<string>()
  const allRaw: Array<{ raw: Record<string, unknown>; title: string }> = []

  for (const rawVideos of searchBatches) {
    for (const raw of rawVideos) {
      const videoId = String(raw.videoId || "")
      if (!isValidYouTubeVideoId(videoId) || seenIds.has(videoId)) continue
      seenIds.add(videoId)
      allRaw.push({ raw, title: String(raw.title || "") })
    }
  }

  const buildCandidates = (minViews: number, requireTitleMatch: boolean): VideoOpportunity[] => {
    const results: VideoOpportunity[] = []
    const added = new Set<string>()

    for (const { raw, title } of allRaw) {
      if (requireTitleMatch && !isTitleRelevant(title, titleKeywords)) continue

      const relevanceScore = calculateRelevanceScore(title, titleKeywords, queries)
      const mapped = mapRawVideoWithMinViews(raw, relevanceScore, minViews)
      if (!mapped || added.has(mapped.videoId)) continue

      added.add(mapped.videoId)
      results.push(mapped)
    }

    return results
  }

  let candidates =
    buildCandidates(MIN_VIEWS, true) ||
    []

  if (candidates.length < 5) {
    candidates = buildCandidates(MIN_VIEWS, false)
  }

  if (candidates.length < 5) {
    candidates = buildCandidates(25_000, true)
  }

  if (candidates.length === 0) {
    candidates = buildCandidates(25_000, false)
  }

  if (candidates.length === 0) {
    console.warn("[youtube] No relevant videos found for:", queries)
    return []
  }

  candidates.sort((a, b) => {
    const viewDiff = b.viewCount - a.viewCount
    if (viewDiff !== 0) return viewDiff
    return (b.relevanceScore || 0) - (a.relevanceScore || 0)
  })

  const validated = await validateVideos(candidates.slice(0, 40))

  return validated
    .sort((a, b) => {
      const viewDiff = b.viewCount - a.viewCount
      if (viewDiff !== 0) return viewDiff
      return (b.relevanceScore || 0) - (a.relevanceScore || 0)
    })
    .slice(0, 20)
}

