/**
 * Custom-designed thumbnails for training videos, keyed by Vimeo video id.
 * Drop files in /public/thumbnails and map them here. Until then, getVideoThumbnail
 * falls back to the Vimeo poster (vumbnail).
 */
export const VIDEO_THUMBNAILS: Record<string, string> = {
  // Example:
  // "1134298307": "/thumbnails/thumb-d01-watch-this-first.webp",
}

/** Extract numeric Vimeo id from a player or share URL (or bare id). */
export function getVimeoId(videoUrlOrId: string): string | null {
  if (/^\d+$/.test(videoUrlOrId)) return videoUrlOrId

  try {
    const u = new URL(videoUrlOrId)
    const parts = u.pathname.split("/").filter(Boolean)
    const candidate = parts[0] === "video" ? parts[1] : parts.find((p) => /^\d+$/.test(p))
    return candidate && /^\d+$/.test(candidate) ? candidate : null
  } catch {
    return null
  }
}

/** Prefer custom art; fall back to Vimeo poster via vumbnail. */
export function getVideoThumbnail(videoUrlOrId: string): string | null {
  const id = getVimeoId(videoUrlOrId)
  if (!id) return null
  return VIDEO_THUMBNAILS[id] ?? `https://vumbnail.com/${id}.jpg`
}
