const ALLOWED_TAGS = new Set([
  "a",
  "article",
  "blockquote",
  "br",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "ul",
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel", "class"]),
  img: new Set(["src", "alt", "width", "height", "class"]),
  "*": new Set(["class", "id"]),
}

function isAllowedAttr(tag: string, name: string): boolean {
  if (ALLOWED_ATTRS[tag]?.has(name)) return true
  return ALLOWED_ATTRS["*"].has(name)
}

function decodeAttr(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}

function encodeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function sanitizeUrlAttr(value: string, kind: "href" | "src"): string | null {
  const decoded = decodeAttr(value).trim()
  if (!decoded) return null
  const lower = decoded.toLowerCase()
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return null
  }
  if (kind === "href") {
    if (decoded.startsWith("#") || decoded.startsWith("/")) return decoded
    try {
      const url = new URL(decoded)
      if (url.protocol === "https:" || url.protocol === "mailto:") return url.toString()
    } catch {
      return null
    }
    return null
  }
  try {
    const url = new URL(decoded)
    if (url.protocol === "https:") return url.toString()
  } catch {
    return null
  }
  return null
}

function sanitizeOpenTag(raw: string): string {
  const match = raw.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)\/?>$/)
  if (!match) return ""
  const isClose = raw.startsWith("</")
  const tag = match[1].toLowerCase()
  if (!ALLOWED_TAGS.has(tag)) return ""
  if (isClose) return `</${tag}>`

  const attrSource = match[2] ?? ""
  const attrs: string[] = []
  const attrRe = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let attrMatch: RegExpExecArray | null
  while ((attrMatch = attrRe.exec(attrSource))) {
    const name = attrMatch[1].toLowerCase()
    if (name.startsWith("on")) continue
    if (!isAllowedAttr(tag, name)) continue
    const value = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? ""
    if (name === "href" || name === "src") {
      const safe = sanitizeUrlAttr(value, name)
      if (!safe) continue
      const extra = name === "href" ? ` rel="noopener noreferrer"` : ""
      attrs.push(`${name}="${encodeAttr(safe)}"${extra}`)
      continue
    }
    if (name === "target") {
      attrs.push(`target="_blank"`)
      continue
    }
    attrs.push(`${name}="${encodeAttr(value)}"`)
  }

  return `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}>`
}

/** Strip scripts, event handlers, and non-http(s) URLs from generated article HTML. */
export function sanitizeArticleHtml(html: string): string {
  if (!html) return ""

  const withoutDangerous = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/<link[\s\S]*?>/gi, "")
    .replace(/<meta[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")

  return withoutDangerous.replace(/<\/?[a-zA-Z][^>]*>/g, (tag) => sanitizeOpenTag(tag))
}
