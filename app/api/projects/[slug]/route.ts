import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { apiHandler, apiError } from '@/lib/api/response'
import { requireAuth } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'
import { logger } from '@/server/utils/logger'

const UpdateProject = z.object({
  name: z.string().trim().min(1).max(128).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
})

const demos = [
  {
    id: 1,
    slug: 'design-engineering',
    name: 'Design Engineering',
    description: 'Frontend platform, design system, UX research.',
    ownerId: 0,
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-04-30'),
  },
  {
    id: 2,
    slug: 'sales-marketing',
    name: 'Sales & Marketing',
    description: 'GTM ops, campaigns, pipeline analytics.',
    ownerId: 0,
    createdAt: new Date('2026-02-04'),
    updatedAt: new Date('2026-05-12'),
  },
  {
    id: 3,
    slug: 'travel',
    name: 'Travel',
    description: 'Trip planning, expense tracking, traveler ops.',
    ownerId: 0,
    createdAt: new Date('2026-03-19'),
    updatedAt: new Date('2026-05-15'),
  },
]

function demoBySlug(slug: string) {
  return demos.find((d) => d.slug === slug)
}

type Params = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireAuth()
    const { slug } = await params

    if (session.demo) {
      const demo = demoBySlug(slug)
      if (!demo) throw apiError('NOT_FOUND', `Project ${slug} does not exist`)
      return { project: demo }
    }

    const db = getDb()
    const [project] = await db
      .select()
      .from(schema.projects)
      .where(and(eq(schema.projects.slug, slug), eq(schema.projects.ownerId, session.user.id)))
      .limit(1)
    if (!project) throw apiError('NOT_FOUND', `Project ${slug} does not exist`)
    return { project }
  })
}

export async function PUT(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireAuth()
    const { slug } = await params
    const body = await request.json()
    const parsed = UpdateProject.safeParse(body)
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid project payload', { issues: parsed.error.issues })
    }

    if (session.demo) {
      const demo = demoBySlug(slug)
      if (!demo) throw apiError('NOT_FOUND', `Project ${slug} does not exist`)
      return { project: { ...demo, ...parsed.data, updatedAt: new Date() } }
    }

    const db = getDb()
    const [project] = await db
      .update(schema.projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(schema.projects.slug, slug), eq(schema.projects.ownerId, session.user.id)))
      .returning()
    if (!project) throw apiError('NOT_FOUND', `Project ${slug} does not exist`)
    logger.info('projects.updated', { ownerId: session.user.id, slug })
    return { project }
  })
}

export async function DELETE(_request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireAuth()
    const { slug } = await params

    if (session.demo) return { deleted: true }

    const db = getDb()
    const [project] = await db
      .delete(schema.projects)
      .where(and(eq(schema.projects.slug, slug), eq(schema.projects.ownerId, session.user.id)))
      .returning({ id: schema.projects.id })
    if (!project) throw apiError('NOT_FOUND', `Project ${slug} does not exist`)
    logger.info('projects.deleted', { ownerId: session.user.id, slug })
    return { deleted: true }
  })
}