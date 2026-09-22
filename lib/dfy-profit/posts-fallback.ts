const GENERIC_POSTS = [
  "I spent a long time trying to figure this out on my own and got nowhere. What finally helped was having the steps laid out in order instead of guessing. Wrote up what actually worked, including the parts nobody mentions: [LINK]",
  "The mistake I made for months was jumping between methods every couple of weeks. Sticking with one approach long enough to see results changed everything. Full breakdown here if it helps anyone else: [LINK]",
  "Someone asked me how I finally got this working, so I put the whole thing in writing rather than explaining it ten more times. Honest version, including what did not work: [LINK]",
]

const NICHE_POSTS: Record<string, string[]> = {
  "health & wellness": [
    "I spent months bouncing between tips that never stuck. What finally helped was a clear plan I could keep up with on busy weeks. Wrote it down here: [LINK]",
    "The advice that made the biggest difference was surprisingly simple, and nobody was saying it out loud. Full write-up if it helps: [LINK]",
    "If you have started and stopped more than once, this will probably sound familiar. Here is what I changed: [LINK]",
  ],
  "finance & investing": [
    "I used to overcomplicate every money decision. Simplifying three habits changed more than any fancy strategy. Breakdown here: [LINK]",
    "Most of what I read about this was written to sell something rather than explain anything. Here is the version I wish I had found first: [LINK]",
    "The turning point was picking one approach and giving it time instead of switching every month. Full notes: [LINK]",
  ],
  "fitness & sports": [
    "I kept starting over every few weeks and wondering why nothing stuck. Turned out my schedule only worked on good weeks. Here is what I changed: [LINK]",
    "The advice that helped most was the least exciting: do less, more often. Wrote up how that actually looks week to week: [LINK]",
    "Six weeks in, the numbers finally started moving. Here is what the first six weeks actually felt like, honestly: [LINK]",
  ],
  "digital marketing": [
    "I wasted a lot of time on tactics that looked good on paper and did nothing for results. Here is what actually moved the needle: [LINK]",
    "The part that finally worked was boring and consistent, which is probably why nobody posts about it. Full walkthrough: [LINK]",
    "If your campaigns feel busy but empty, this is the checklist I wish I had earlier: [LINK]",
  ],
  "self-help & personal development": [
    "I collected advice for years and still felt stuck. What changed was applying one system long enough to see results. Wrote it up: [LINK]",
    "Most personal growth content is motivating for a day and useless on Monday morning. Here is the practical version: [LINK]",
    "The habits that stuck were smaller than I expected. Full breakdown here: [LINK]",
  ],
  "beauty & skincare": [
    "I tried a dozen routines and still had the same issues. Simplifying to what actually works made the difference. Notes here: [LINK]",
    "The product advice that helped most was about consistency, not more steps. Wrote up what I kept and what I cut: [LINK]",
    "If your shelf is full and your results are not, this will probably sound familiar: [LINK]",
  ],
  "education & learning": [
    "I used to jump between courses and never finish. One structured path finally made the progress stick. Guide here: [LINK]",
    "The learning tip that saved me the most time was embarrassingly simple. Full write-up: [LINK]",
    "If you have bookmarks full of unfinished lessons, this is what finally worked for me: [LINK]",
  ],
  "business & entrepreneurship": [
    "I spent months busy without moving the real metrics. Focusing on three decisions changed the trajectory. Breakdown: [LINK]",
    "Most founder advice is either too vague or too salesy. Here is the practical version I needed earlier: [LINK]",
    "The systems that helped were boring and repeatable. Full notes here: [LINK]",
  ],
  "travel & lifestyle": [
    "I used to overplan every trip and still miss what mattered. A simpler approach made travel feel better and cost less. Wrote it up: [LINK]",
    "The lifestyle change that stuck was smaller than the ones I kept abandoning. Details here: [LINK]",
    "If your plans look great on paper but fall apart in real life, this might help: [LINK]",
  ],
}

/**
 * Deterministic Facebook post copy for when AI generation is unavailable.
 */
export function buildFallbackPosts(niche: string, promoLink: string, count: number): string[] {
  const pool = NICHE_POSTS[niche.trim().toLowerCase()] ?? GENERIC_POSTS
  const selected: string[] = []

  for (let index = 0; index < count; index += 1) {
    const template = pool[index % pool.length]
    selected.push(template.split("[LINK]").join(promoLink))
  }

  return selected
}
