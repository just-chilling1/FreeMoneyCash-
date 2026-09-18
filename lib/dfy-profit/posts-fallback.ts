const GENERIC_POSTS = [
  "I spent a long time trying to figure this out on my own and got nowhere. What finally helped was having the steps laid out in order instead of guessing. Wrote up what actually worked, including the parts nobody mentions: [LINK]",
  "The mistake I made for months was jumping between methods every couple of weeks. Sticking with one approach long enough to see results changed everything. Full breakdown here if it helps anyone else: [LINK]",
  "Someone asked me how I finally got this working, so I put the whole thing in writing rather than explaining it ten more times. Honest version, including what did not work: [LINK]",
]

const NICHE_POSTS: Record<string, string[]> = {
  "weight loss": [
    "I was stuck at the same weight for the better part of a year. What broke the plateau was not a new diet, it was fixing the two things I kept getting wrong. Wrote it all down here: [LINK]",
    "Nobody tells you that the first three weeks feel like nothing is happening. That is exactly when most people quit. Here is what the timeline actually looks like and how to get through it: [LINK]",
    "Every plan I tried failed for the same reason, and it took me embarrassingly long to spot it. If you have started and stopped more than once, this will probably sound familiar: [LINK]",
  ],
  "make money online": [
    "I wasted a lot of time on this before anything clicked. The turning point was picking one approach and giving it eight weeks instead of two. Wrote up the whole process, mistakes included: [LINK]",
    "Most of what I read about this was written to sell something rather than explain anything. Here is the version I wish I had found first, with no income promises: [LINK]",
    "The part that finally worked was boring and repetitive, which is probably why nobody posts about it. Full walkthrough here: [LINK]",
  ],
  "health & fitness": [
    "I kept starting over every few weeks and wondering why nothing stuck. Turned out my schedule only worked on good weeks. Here is what I changed: [LINK]",
    "The advice that helped most was the least exciting: do less, more often. Wrote up how that actually looks week to week: [LINK]",
    "Six weeks in, the numbers finally started moving. Here is what the first six weeks actually felt like, honestly: [LINK]",
  ],
}

/**
 * Deterministic Facebook post copy for when AI generation is unavailable.
 * Seeded from the Instant Income copy, kept local so route handlers do not
 * import a client component.
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
