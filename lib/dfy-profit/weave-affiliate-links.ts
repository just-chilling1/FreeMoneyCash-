const CTA_LABEL = "Check Today's Price"

const PLACEHOLDER_HREF_RE = /href=["'](?:#offer|#cta|#affiliate|OFFER_URL|AFFILIATE_URL)["']/gi

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function anchor(href: string, label: string): string {
  return `<a class="affiliate-link" href="${href}" target="_blank" rel="noopener sponsored">${label}</a>`
}

function hasFooterCta(html: string): boolean {
  return /class="article-cta"|class="affiliate-cta"|class="cta-box"/.test(html)
}

/**
 * Weave the user's affiliate link into generated article HTML.
 * Handles Blackbox-style `#offer` placeholders and the older `[LINK]` token.
 * Idempotent: html that already contains an affiliate anchor is returned as-is.
 */
export function weaveAffiliateLinks(html: string, affiliateUrl: string, ctaLabel: string = CTA_LABEL): string {
  const url = affiliateUrl.trim()
  if (!url) return html

  const href = escapeAttribute(url)
  if (html.includes('class="affiliate-link"') || html.includes(`href="${href}"`)) {
    return hasFooterCta(html) ? html : `${html}<p class="article-cta">${anchor(href, ctaLabel)}</p>`
  }

  let body = html
  const hadPlaceholder = PLACEHOLDER_HREF_RE.test(body)
  PLACEHOLDER_HREF_RE.lastIndex = 0

  if (hadPlaceholder) {
    body = body.replace(PLACEHOLDER_HREF_RE, `href="${href}"`)
  }

  if (body.includes("[LINK]")) {
    body = body.split("[LINK]").join(anchor(href, "see the details here"))
  } else if (!hadPlaceholder) {
    const headingEnd = body.indexOf("</h2>")
    const recommendation = `<p>Here is the exact resource referenced above: ${anchor(href, "see the details here")}.</p>`
    body =
      headingEnd === -1
        ? `${recommendation}${body}`
        : `${body.slice(0, headingEnd + 5)}${recommendation}${body.slice(headingEnd + 5)}`
  }

  if (hasFooterCta(body)) return body

  return `${body}<p class="article-cta">${anchor(href, ctaLabel)}</p>`
}
