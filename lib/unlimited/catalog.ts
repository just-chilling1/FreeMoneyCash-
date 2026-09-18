import seedData from "@/lib/unlimited/seeds.json"

export const UNLIMITED_PAGE_COUNT = 200
export const AFFILIATE_LINK_TOKEN = "[INSERT_AFFILIATE_LINK]"

export type UnlimitedArticle = {
  id: number
  title: string
  niche: string
  earnings: number
  author: string
  bestFor: string
  content: string
}

type SeedArticle = {
  title: string
  niche: string
  earnings: number
  author: string
  bestFor: string
  content?: string
}

const seeds = seedData as {
  featured: Array<SeedArticle & { content: string }>
  additional: SeedArticle[]
}

const EXPANSION_TITLES = [
  (niche: string) => `I Tested the Top ${niche} Offers So You Don't Have To`,
  (niche: string) => `The ${niche} Routine That Fits a Busy Week`,
  (niche: string) => `What Changed When I Stopped Guessing at ${niche}`,
] as const

const AUTHOR_POOL = [
  ...new Set([...seeds.featured, ...seeds.additional].map((article) => article.author)),
]

function earningsFor(id: number) {
  return 165 + ((id * 47) % 390)
}

function authorFor(id: number, avoid: string) {
  const first = AUTHOR_POOL[id % AUTHOR_POOL.length] ?? "Alex K."
  if (first !== avoid) return first
  return AUTHOR_POOL[(id + 1) % AUTHOR_POOL.length] ?? first
}

function buildContent(article: Omit<UnlimitedArticle, "content">): string {
  const firstName = article.author.split(" ")[0] ?? "I"
  const niche = article.niche.toLowerCase()
  const variant = article.id % 3

  const openers = [
    `I kept scrolling past ${niche} offers because they all sounded the same. Then I gave one system a fair test instead of another weekend of research.`,
    `${firstName} here. I am not an expert in ${niche}. I just got tired of paying for things that never matched the promise on the sales page.`,
    `Most ${niche} pages bury the useful part. This one is the version I would have wanted to read first — short, specific, and ready to publish.`,
  ]

  return `${openers[variant]}

The page is built around one result: ${article.title.replace(/\.$/, "")}.

I started with a single offer that fits ${article.bestFor}. No extra products. No rewrite from scratch. I published the story, dropped my link in the spot below, and let the page do the explaining.

What surprised me was how little setup it took. The angle is already written. The proof is already in the story. On a typical day, pages like this are bringing members about $${article.earnings}. Your numbers will depend on the offer and the traffic, but the page itself is finished.

Here is the simple version of what I did:

1. Picked an offer in ${niche} that I would actually recommend.
2. Previewed the page so I knew exactly what a reader would see.
3. Placed my affiliate link once, then shared the live page.

If you promote ${article.bestFor}, you do not need a new draft. You need this page with your link in it.

${AFFILIATE_LINK_TOKEN}

Open the link above when you are ready to see the offer. The rest of this page stays as written — your only job is to make sure the link is yours.

Take a look first. If the story fits the offer, publish it and move on to the next page.`
}

function fromSeed(seed: SeedArticle, id: number): UnlimitedArticle {
  const article = {
    id,
    title: seed.title,
    niche: seed.niche,
    earnings: seed.earnings,
    author: seed.author,
    bestFor: seed.bestFor,
  }

  return {
    ...article,
    content: seed.content ? seed.content.replace(/\r\n/g, "\n") : buildContent(article),
  }
}

function buildCatalog(): UnlimitedArticle[] {
  const base = [...seeds.featured, ...seeds.additional].map((seed, index) => fromSeed(seed, index + 1))
  const articles = [...base]

  for (const makeTitle of EXPANSION_TITLES) {
    for (const source of base) {
      if (articles.length >= UNLIMITED_PAGE_COUNT) break
      const id = articles.length + 1
      const article = {
        id,
        title: makeTitle(source.niche),
        niche: source.niche,
        earnings: earningsFor(id),
        author: authorFor(id, source.author),
        bestFor: source.bestFor,
      }
      articles.push({ ...article, content: buildContent(article) })
    }
  }

  if (articles.length !== UNLIMITED_PAGE_COUNT) {
    throw new Error(`Unlimited catalog expected ${UNLIMITED_PAGE_COUNT} pages, got ${articles.length}`)
  }

  return articles
}

export const UNLIMITED_ARTICLES: UnlimitedArticle[] = buildCatalog()

export const UNLIMITED_NICHES: string[] = [...new Set(UNLIMITED_ARTICLES.map((article) => article.niche))].sort((a, b) =>
  a < b ? -1 : a > b ? 1 : 0,
)

export function insertAffiliateLink(content: string, affiliateLink: string) {
  return content.replaceAll(AFFILIATE_LINK_TOKEN, affiliateLink.trim())
}
