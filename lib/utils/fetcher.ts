export type SafeFetchOptions = RequestInit & {
  parseJson?: boolean
}

export type SafeFetchResult<T = unknown> = {
  ok: boolean
  status: number
  data: T | null
  error?: string
  raw?: Response
}

/**
 * 공통 JSON fetch 유틸
 * - 예외를 던지지 않고 상태/메시지를 반환
 * - JSON 파싱 실패 시 data를 null로 유지하고 error에 메시지를 담음
 */
export async function safeJsonFetch<T = unknown>(
  input: RequestInfo,
  init: SafeFetchOptions = {}
): Promise<SafeFetchResult<T>> {
  const { parseJson = true, ...fetchOptions } = init

  try {
    const res = await fetch(input, fetchOptions)
    let data: T | null = null
    let errorMessage: string | undefined

    if (parseJson) {
      try {
        const json = await res.json()
        if (res.ok) {
          data = json as T
        } else {
          data = Array.isArray(json) || typeof json === 'object' ? (json as T) : null
          errorMessage =
            (json && typeof (json as any).error === 'string' ? (json as any).error : undefined) ||
            res.statusText ||
            'Request failed'
        }
      } catch (parseError) {
        errorMessage =
          res.ok && parseJson
            ? undefined
            : errorMessage ||
              (parseError instanceof Error ? parseError.message : 'Failed to parse response')
      }
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
      error: errorMessage,
      raw: res,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : 'Network request failed',
    }
  }
}
