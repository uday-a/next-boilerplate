import { createHash, randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/server/db'

// API key minting + verification. Single verification path — nothing else
// reads the `api_keys` table directly. Same token discipline as magic-link
// tokens: SHA-256 hash persisted, raw value shown once at creation.
// Never log raw keys — log `prefix` or `keyId` instead.
export const API_KEY_PREFIX = 'uipkge_'

export interface MintedApiKey {
  raw: string
  hash: string
  prefix: string
}

/** Mint a fresh key. 32 bytes ≈ 256 bits, base64url-encoded after the `uipkge_` prefix. */
export function mintApiKey(): MintedApiKey {
  const raw = `${API_KEY_PREFIX}${randomBytes(32).toString('base64url')}`
  return { raw, hash: hashApiKey(raw), prefix: raw.slice(0, 12) }
}

/** SHA-256 hex digest. Used to store/lookup keys without keeping the raw. */
export function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export interface VerifiedApiKey {
  userId: number
  keyId: number
  scopes: string[]
}

/**
 * Verify a raw key, optionally requiring one scope. Returns the key
 * identity or null — null covers missing, revoked, expired, and
 * insufficient-scope keys alike so callers can't distinguish them.
 * Touches lastUsedAt on success; the touch never fails verification.
 */
export async function verifyApiKey(raw: string | null | undefined, requiredScope?: string): Promise<VerifiedApiKey | null> {
  if (!raw) return null
  const keyHash = hashApiKey(raw)

  let row: typeof schema.apiKeys.$inferSelect | undefined
  try {
    const db = getDb()
    const rows = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.keyHash, keyHash)).limit(1)
    row = rows[0]
  } catch {
    // DB unreachable — fail closed rather than failing open.
    return null
  }
  if (!row) return null
  if (row.revokedAt) return null
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null

  const scopes = row.scopes.split(' ').filter(Boolean)
  if (requiredScope && !scopes.includes(requiredScope)) return null

  try {
    const db = getDb()
    await db.update(schema.apiKeys).set({ lastUsedAt: new Date() }).where(eq(schema.apiKeys.id, row.id))
  } catch {
    // Usage touch is observability, not auth.
  }

  return { userId: row.userId, keyId: row.id, scopes }
}
