import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { apiHandler, apiError } from '@/lib/api/response'
import { requireAuth } from '@/server/utils/guards'
import { getDb, schema } from '@/server/db'
import { logger } from '@/server/utils/logger'

const slug = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Slug must be kebab-case')

const CreateProject = z.object({
  slug,
  name: z.string().trim().min(1).max(128),
  description: z.string().trim().max(2000).optional(),
})

function demoProjects() {
  return [
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
}

export async function GET() {
  return apiHandler(async () => {
    const session = await requireAuth()
    if (session.demo) return { projects: demoProjects() }

    const db = getDb()
    const rows = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.ownerId, session.user.id))
    return { projects: rows }
  })
}

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireAuth()
    const body = await request.json()
    const parsed = CreateProject.safeParse(body)
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid project payload', { issues: parsed.error.issues })
    }

    if (session.demo) {
      return {
        project: {
          id: 0,
          ownerId: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: null,
          ...parsed.data,
        },
      }
    }

    const db = getDb()
    try {
      const [project] = await db
        .insert(schema.projects)
        .values({
          slug: parsed.data.slug,
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          ownerId: session.user.id,
        })
        .returning()
      logger.info('projects.created', { ownerId: session.user.id, slug: parsed.data.slug })
      return { project }
    } catch (e) {
      if ((e as { code?: string }).code === '23505') {
        throw apiError('VALIDATION_FAILED', `A project with slug '${parsed.data.slug}' already exists`, {
          field: 'slug',
        })
      }
      throw e
    }
  })
}