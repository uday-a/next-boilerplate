import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { apiHandler, apiError } from '@/lib/api/response'
import { requireAuth } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'
import { recordAudit } from '@/server/utils/audit'
import { mintApiKey } from '@/server/utils/api-keys'
import { requireRateLimit } from '@/server/utils/rate-limit'
import { logger } from '@/server/utils/logger'

const CreateKey = z.object({
  name: z.string().trim().min(1, 'Name is required').max(64, 'Name must be 64 characters or fewer'),
  scopes: z.array(z.enum(['read', 'write'])).min(1).max(4).default(['read']),
  expiresInDays: z.number().int().positive().max(365).optional(),
})

export async function GET() {
  return apiHandler(async () => {
    const session = await requireAuth()
    // Demo session has no DB rows; show the empty state (matches Nuxt).
    if (session.demo) return { keys: [] }

    const db = getDb()
    // Explicit column list — keyHash is selected nowhere, so it can never
    // leak into the list response.
    const keys = await db
      .select({
        id: schema.apiKeys.id,
        name: schema.apiKeys.name,
        prefix: schema.apiKeys.prefix,
        scopes: schema.apiKeys.scopes,
        lastUsedAt: schema.apiKeys.lastUsedAt,
        expiresAt: schema.apiKeys.expiresAt,
        revokedAt: schema.apiKeys.revokedAt,
        createdAt: schema.apiKeys.createdAt,
      })
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.userId, session.user.id))
      .orderBy(desc(schema.apiKeys.createdAt))
    return { keys }
  })
}

export async function POST(request: Request) {
  return apiHandler(async () => {
    requireRateLimit(request, { key: 'api:keys' })
    const session = await requireAuth()
    const parsed = CreateKey.safeParse(await request.json())
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid API key payload', { issues: parsed.error.issues })
    }

    const minted = mintApiKey()
    const scopes = [...new Set(parsed.data.scopes)].join(' ')
    const expiresAt = parsed.data.expiresInDays ? new Date(Date.now() + parsed.data.expiresInDays * 86400000) : null

    if (session.demo) {
      return {
        key: {
          id: 0,
          name: parsed.data.name,
          prefix: minted.prefix,
          scopes,
          lastUsedAt: null,
          expiresAt,
          revokedAt: null,
          createdAt: new Date(),
        },
        rawKey: minted.raw,
      }
    }

    const db = getDb()
    const [row] = await db
      .insert(schema.apiKeys)
      .values({
        userId: session.user.id,
        name: parsed.data.name,
        keyHash: minted.hash,
        prefix: minted.prefix,
        scopes,
        expiresAt,
      })
      .returning()
    if (!row) throw apiError('INTERNAL', 'Could not create API key')

    // Never log the raw key — prefix is enough for support lookups.
    logger.info('api_keys.created', { userId: session.user.id, prefix: minted.prefix })
    await recordAudit({
      userId: session.user.id,
      action: 'api_keys.create',
      entity: 'api_key',
      entityId: row.id,
      metadata: { name: row.name, prefix: minted.prefix },
    })

    const { id, name, prefix, createdAt, lastUsedAt, revokedAt } = row
    return {
      key: { id, name, prefix, scopes: row.scopes, lastUsedAt, expiresAt: row.expiresAt, revokedAt, createdAt },
      rawKey: minted.raw,
    }
  })
}
