import { eq } from 'drizzle-orm'
import { apiHandler } from '@/lib/api/response'
import { requireAuth } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'
import { planForProductId } from '@/server/utils/polar'

export async function GET() {
  return apiHandler(async () => {
    const session = await requireAuth()
    if (session.demo) return { subscription: null }

    const db = getDb()
    const [row] = await db
      .select({
        status: schema.subscriptions.status,
        productId: schema.subscriptions.productId,
        currentPeriodEnd: schema.subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: schema.subscriptions.cancelAtPeriodEnd,
        canceledAt: schema.subscriptions.canceledAt,
      })
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, session.user.id))
      .limit(1)

    if (!row) return { subscription: null }

    return {
      subscription: {
        ...row,
        plan: planForProductId(row.productId),
      },
    }
  })
}