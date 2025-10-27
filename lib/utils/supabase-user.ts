import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

const NON_REMOVABLE_FIELDS = new Set(['id', 'email'])
const MAX_ATTEMPTS = 8

type ResilientMutationResult = {
  removedColumns: string[]
  error: null | { code?: string; message?: string; details?: string | null; hint?: string | null }
}

export async function upsertUserWithFallback(
  client: SupabaseClient<Database>,
  payload: Record<string, unknown>,
  options: { onConflict?: string } = {}
): Promise<ResilientMutationResult> {
  const attemptPayload: Record<string, unknown> = { ...payload }
  const removedColumns: string[] = []
  let lastError: ResilientMutationResult['error'] = null

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const { error } = await client
      .from('users')
      .upsert(attemptPayload as any, { onConflict: options.onConflict ?? 'id' })

    if (!error) {
      return { removedColumns, error: null }
    }

    lastError = error
    const missingColumn = extractMissingColumnName(error)
    if (
      !missingColumn ||
      !(missingColumn in attemptPayload) ||
      NON_REMOVABLE_FIELDS.has(missingColumn)
    ) {
      break
    }

    delete attemptPayload[missingColumn]
    removedColumns.push(missingColumn)
  }

  return { removedColumns, error: lastError }
}

export async function updateUserWithFallback(
  client: SupabaseClient<Database>,
  id: string,
  payload: Record<string, unknown>
): Promise<ResilientMutationResult> {
  const attemptPayload: Record<string, unknown> = { ...payload }
  const removedColumns: string[] = []
  let lastError: ResilientMutationResult['error'] = null

  if (Object.keys(attemptPayload).length === 0) {
    return { removedColumns, error: null }
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const { error } = await client
      .from('users')
      .update(attemptPayload as any)
      .eq('id', id)

    if (!error) {
      return { removedColumns, error: null }
    }

    lastError = error
    const missingColumn = extractMissingColumnName(error)
    if (
      !missingColumn ||
      !(missingColumn in attemptPayload) ||
      NON_REMOVABLE_FIELDS.has(missingColumn)
    ) {
      break
    }

    delete attemptPayload[missingColumn]
    removedColumns.push(missingColumn)
  }

  return { removedColumns, error: lastError }
}

function extractMissingColumnName(error: { code?: string; message?: string } | null) {
  if (!error) return null
  if (error.code !== 'PGRST204') return null

  const match = error.message?.match(/'([^']+)' column/)
  return match?.[1] ?? null
}
