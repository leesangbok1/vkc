const BASE64_PREFIX = 'base64-'
const BASE64URL_BODY_REGEX = /^[A-Za-z0-9_-]+$/
const LEGACY_JSON_PATTERN = /^\s*[{[]/

const toBase64Url = (input: string) => {
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(input, 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '')
    }

    if (typeof globalThis.btoa === 'function') {
      const bytes = new TextEncoder().encode(input)
      let binary = ''

      for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i])
      }

      return globalThis
        .btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '')
    }
  } catch {
    // ignore encoding failures
  }

  return undefined
}

const tryNormalizeBase64Payload = (payload: string) => {
  const sanitized = payload.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')

  if (BASE64URL_BODY_REGEX.test(sanitized)) {
    return sanitized
  }

  return undefined
}

const tryReencodeLegacyJson = (payload: string) => {
  if (!LEGACY_JSON_PATTERN.test(payload.trim())) {
    return undefined
  }

  try {
    const parsed = JSON.parse(payload)
    const encoded = toBase64Url(JSON.stringify(parsed))
    return encoded ? `${BASE64_PREFIX}${encoded}` : undefined
  } catch {
    return undefined
  }
}

export const sanitizeSupabaseCookieValue = (_name: string, value?: string | null) => {
  if (!value) return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined

  const unwrapped =
    trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2
      ? trimmed.slice(1, -1)
      : trimmed

  if (unwrapped.startsWith(BASE64_PREFIX)) {
    const payload = unwrapped.slice(BASE64_PREFIX.length)
    if (!payload) return undefined

    if (BASE64URL_BODY_REGEX.test(payload)) {
      return unwrapped
    }

    const normalizedPayload = tryNormalizeBase64Payload(payload)
    if (normalizedPayload) {
      return `${BASE64_PREFIX}${normalizedPayload}`
    }

    const reencoded = tryReencodeLegacyJson(payload)
    if (reencoded) {
      return reencoded
    }

    const legacyPayload = payload.trim()
    if (legacyPayload && legacyPayload.includes(':')) {
      return legacyPayload
    }

    return undefined
  }

  const reencoded = tryReencodeLegacyJson(unwrapped)
  if (reencoded) {
    return reencoded
  }

  return unwrapped
}
