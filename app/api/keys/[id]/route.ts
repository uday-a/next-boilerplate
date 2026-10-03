import { eq } from 'drizzle-orm'
import { apiHandler, apiError } from '@/lib/api/response'
import { requireAuth } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'
import { recordAudit } from '@/server/utils/audit'
import { isSampleKeyId } from '@/server/utils/api-keys'
import { logger } from '@/server/utils/logger'

// DELETE /api/keys/:id — revoke a key (sets revokedAt; the row stays for
// audit history). Ownership is checked before existence is revealed: a key
// owned by someone else 404s exactly like a missing key.
type Params = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireAuth()
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!rawId || !Number.isInteger(id) || id === 0) {
      throw apiError('VALIDATION_FAILED', 'Invalid API key id', { field: 'id' })
    }

    // Demo sample rows are fake successes (nothing persisted to revoke).
    if (session.demo && isSampleKeyId(id)) return { revoked: id }

    // Demo sessions own no real keys, so every other id is a 404.
    if (session.demo) throw apiError('NOT_FOUND', `API key ${id} not found`)

    const db = getDb()
    const rows = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.id, id)).limit(1)
    const row = rows[0]
    if (!row || row.userId !== session.user.id) {
      throw apiError('NOT_FOUND', `API key ${id} not found`)
    }

    await db.update(schema.apiKeys).set({ revokedAt: new Date() }).where(eq(schema.apiKeys.id, id))

    await recordAudit({
      userId: session.user.id,
      action: 'api_keys.revoke',
      entity: 'api_key',
      entityId: id,
      metadata: { name: row.name, prefix: row.prefix },
    })
    logger.info('api_keys.revoked', { id, prefix: row.prefix })

    return { revoked: id }
  })
}
