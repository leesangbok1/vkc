type MediaSource =
  | {
      attachments?: unknown
      images?: unknown
      image_urls?: unknown
      media_urls?: unknown
      media?: unknown
      imageUrl?: unknown
      content?: unknown
    }
  | null
  | undefined

const isString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0

const pickStringArray = (candidate: unknown): string[] | null => {
  if (!Array.isArray(candidate)) return null
  const filtered = candidate.filter(isString)
  return filtered.length > 0 ? filtered : null
}

/**
 * Normalizes various attachment/image fields into a simple URL string array.
 * Accepts the mixed payload shapes returned by questions/posts feeds.
 */
export const extractMediaUrls = (source: MediaSource): string[] => {
  if (!source) return []

  const candidates = [
    source.attachments,
    source.images,
    source.image_urls,
    source.media_urls,
    source.media,
  ]

  for (const candidate of candidates) {
    const urls = pickStringArray(candidate)
    if (urls) return urls
  }

  if (isString(source.imageUrl)) {
    return [source.imageUrl]
  }

  if (typeof source.content === 'string' && source.content.length > 0) {
    const markdownMatches = Array.from(
      source.content.matchAll(/!\[[^\]]*]\((https?:\/\/[^\s)]+)\)/gi)
    ).map((match) => match[1])

    const htmlMatches = Array.from(
      source.content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)
    ).map((match) => match[1])

    const combined = [...markdownMatches, ...htmlMatches].filter(isString)
    if (combined.length > 0) {
      return Array.from(new Set(combined))
    }
  }

  return []
}

export default extractMediaUrls
