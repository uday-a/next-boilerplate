import { z } from 'zod'
import { apiHandler, apiError } from '@/lib/api/response'
import { env } from '@/lib/env'
import { requireAuth } from '@/server/utils/guards'
import { logger } from '@/server/utils/logger'
import { sendEmail, feedbackEmail } from '@/server/utils/mailer'

const FeedbackInput = z.object({
  category: z.enum(['bug', 'idea', 'praise']),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(120, 'Subject must be 120 characters or fewer'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(4000, 'Message must be 4000 characters or fewer'),
})

// Attachments are screenshots, so images only. Client validates first;
// the server re-checks every file because client checks are bypassable.
const MAX_FILES = 3
const MAX_FILE_BYTES = 5 * 1024 * 1024

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireAuth()
    // Demo sessions are minted by anyone on demand; don't let them relay
    // email through our sender.
    if (session.demo) throw apiError('FORBIDDEN', 'Feedback is disabled in demo mode.')

    let input: Record<string, unknown>
    let files: File[] = []
    if ((request.headers.get('content-type') ?? '').includes('multipart/form-data')) {
      const form = await request.formData()
      input = { category: form.get('category'), subject: form.get('subject'), message: form.get('message') }
      files = form.getAll('files').filter((f): f is File => f instanceof File)
      if (files.length > MAX_FILES) throw apiError('VALIDATION_FAILED', `You can attach up to ${MAX_FILES} images`)
      for (const f of files) {
        if (!f.type.startsWith('image/')) throw apiError('VALIDATION_FAILED', `${f.name} is not an image`)
        if (f.size > MAX_FILE_BYTES) throw apiError('VALIDATION_FAILED', `${f.name} is larger than 5 MB`)
      }
    } else {
      input = await request.json()
    }

    const parsed = FeedbackInput.safeParse(input)
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid feedback payload', { issues: parsed.error.issues })
    }

    const to = env.EMAIL_OPS ?? env.EMAIL_FROM
    const { id } = await sendEmail(
      feedbackEmail({
        to,
        reporter: {
          name: session.user.name ?? session.user.login,
          email: session.user.email ?? `${session.user.login}@github.invalid`,
          login: session.user.login,
        },
        category: parsed.data.category,
        subject: parsed.data.subject,
        message: parsed.data.message,
      }),
    )
    // ponytail: screenshots are validated but not attached — server/utils/mailer
    // has no attachments field yet. Forward them once the mailer supports it.
    if (files.length) logger.info('feedback.attachments', { names: files.map((f) => f.name) })

    return { delivered: Boolean(id) || !env.RESEND_API_KEY, id }
  })
}
