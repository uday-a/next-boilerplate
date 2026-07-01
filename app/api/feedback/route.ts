import { z } from 'zod'
import { apiHandler, apiError } from '@/lib/api/response'
import { env } from '@/lib/env'
import { requireAuth } from '@/server/utils/guards'
import { sendEmail, feedbackEmail } from '@/server/utils/mailer'

const FeedbackInput = z.object({
  category: z.enum(['bug', 'idea', 'praise']),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(4000),
})

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireAuth()
    const parsed = FeedbackInput.safeParse(await request.json())
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

    return { delivered: Boolean(id) || !env.RESEND_API_KEY, id }
  })
}