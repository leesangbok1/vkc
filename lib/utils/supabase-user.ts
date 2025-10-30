import type { PostgrestError } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'
import type { SupabaseDbClient } from '@/lib/server/supabase-clients'

const NON_REMOVABLE_FIELDS = new Set(['id', 'email'])
const MAX_ATTEMPTS = 8

type ResilientMutationResult = {
  removedColumns: string[]
  error: null | { code?: string; message?: string; details?: string | null; hint?: string | null }
}

type UsersTable = Database['public']['Tables']['users']
type UserInsertPayload = UsersTable['Insert']
type UserUpdatePayload = UsersTable['Update']

export async function upsertUserWithFallback(
  client: SupabaseDbClient,
  payload: UserInsertPayload,
  options: { onConflict?: keyof Database['public']['Tables']['users']['Row'] } = {}
): Promise<ResilientMutationResult> {
  const attemptPayload: Partial<UserInsertPayload> = { ...payload }
  const removedColumns: string[] = []
  let lastError: ResilientMutationResult['error'] = null

  const usersQuery = client.from('users')

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const { error } = await usersQuery
      .upsert(attemptPayload as UsersTable['Insert'], {
        onConflict: options.onConflict ? String(options.onConflict) : 'id'
      })

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

    const columnKey = missingColumn as keyof UserInsertPayload
    if (!Object.prototype.hasOwnProperty.call(attemptPayload, columnKey)) {
      break
    }
    delete attemptPayload[columnKey]
    removedColumns.push(missingColumn)
  }

  return { removedColumns, error: lastError }
}

export async function updateUserWithFallback(
  client: SupabaseDbClient,
  id: string,
  payload: Partial<UserUpdatePayload>
): Promise<ResilientMutationResult> {
  const attemptPayload: Partial<UserUpdatePayload> = { ...payload }
  const removedColumns: string[] = []
  let lastError: ResilientMutationResult['error'] = null

  if (Object.keys(attemptPayload).length === 0) {
    return { removedColumns, error: null }
  }

  const usersQuery = client.from('users')

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const { error } = await usersQuery
      .update(attemptPayload as UsersTable['Update'])
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

    const columnKey = missingColumn as keyof UserUpdatePayload
    if (!Object.prototype.hasOwnProperty.call(attemptPayload, columnKey)) {
      break
    }
    delete attemptPayload[columnKey]
    removedColumns.push(missingColumn)
  }

  return { removedColumns, error: lastError }
}

function extractMissingColumnName(error: PostgrestError | null) {
  if (!error) return null
  if (error.code !== 'PGRST204') return null

  const match = error.message?.match(/'([^']+)' column/)
  return match?.[1] ?? null
}
