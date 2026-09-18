const MAX_STEM_LENGTH = 60

function defaultSuffix(): string {
  return Math.random().toString(36).slice(2, 8)
}

/**
 * Build a URL slug for a generated article.
 * `pages.slug` is UNIQUE, so a random suffix keeps repeat runs of the same
 * title from colliding.
 */
export function buildArticleSlug(title: string, randomSuffix: () => string = defaultSuffix): string {
  const stem = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_STEM_LENGTH)
    .replace(/-+$/g, "")

  return `${stem || "authority-article"}-${randomSuffix()}`
}
