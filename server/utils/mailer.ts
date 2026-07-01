import { env, hasResend } from '@/lib/env'
import { logger } from './logger'

export interface Email {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: { name: string; value: string }[]
}

type ResendClient = {
  emails: { send(payload: object): Promise<{ data?: { id: string }; error?: { message: string } }> }
}

let resendPromise: Promise<ResendClient | null> | null = null

function getResend(): Promise<ResendClient | null> {
  if (!hasResend) return Promise.resolve(null)
  if (!resendPromise) {
    resendPromise = import('resend').then(
      ({ Resend }) => new Resend(env.RESEND_API_KEY!) as unknown as ResendClient,
    )
  }
  return resendPromise
}

export async function sendEmail(email: Email): Promise<{ id: string | null }> {
  const from = env.EMAIL_FROM

  if (!hasResend) {
    console.log(
      `[mailer DRY RUN — set RESEND_API_KEY to send]\nFrom: ${from}\nTo: ${Array.isArray(email.to) ? email.to.join(', ') : email.to}\nSubject: ${email.subject}\n\n${(email.text ?? email.html).slice(0, 200)}…`,
    )
    return { id: null }
  }

  const resend = await getResend()
  if (!resend) return { id: null }

  const res = await resend.emails.send({
    from,
    to: email.to,
    subject: email.subject,
    html: email.html,
    ...(email.text ? { text: email.text } : {}),
    ...(email.replyTo ? { reply_to: email.replyTo } : {}),
    ...(email.tags ? { tags: email.tags } : {}),
  })

  if (res.error) {
    logger.error('mailer.send_failed', {
      subject: email.subject,
      to: Array.isArray(email.to) ? email.to.join(',') : email.to,
      error: res.error.message,
    })
    throw new Error(`Resend send failed: ${res.error.message}`)
  }

  logger.info('mailer.sent', {
    id: res.data?.id ?? 'unknown',
    subject: email.subject,
    to: Array.isArray(email.to) ? email.to.join(',') : email.to,
  })

  return { id: res.data?.id ?? null }
}

const APP_NAME = 'Acme'

function shell(title: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;color:#0a0a0a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f6f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #e5e5e7;border-radius:12px;padding:32px;max-width:100%;">
          <tr><td>
            <div style="font-size:14px;font-weight:600;letter-spacing:0.08em;color:#6b7280;text-transform:uppercase;margin-bottom:24px;">${APP_NAME}</div>
            ${body}
          </td></tr>
        </table>
        <div style="margin-top:16px;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} ${APP_NAME}</div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function welcomeEmail(args: { name: string; email: string; siteUrl: string }): Email {
  const text = `Hi ${args.name},\n\nWelcome to ${APP_NAME}. Your account is ready.\n\nDashboard: ${args.siteUrl}/dashboard`
  const html = shell(
    `Welcome to ${APP_NAME}`,
    `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;line-height:1.3;">Welcome to ${APP_NAME}, ${args.name}.</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Your account is ready. Click below to head to your dashboard.</p>
    <p style="margin:24px 0;"><a href="${args.siteUrl}/dashboard" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;">Open dashboard →</a></p>
  `,
  )
  return { to: args.email, subject: `Welcome to ${APP_NAME}`, html, text, tags: [{ name: 'kind', value: 'welcome' }] }
}

export function magicLinkEmail(args: { email: string; link: string; expiresInMin: number }): Email {
  const text = `Sign in to ${APP_NAME}\n\nClick the link to sign in: ${args.link}\n\nThe link expires in ${args.expiresInMin} minutes.`
  const html = shell(
    `Sign in to ${APP_NAME}`,
    `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;line-height:1.3;">Sign in to ${APP_NAME}</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Click the button below to sign in. The link expires in ${args.expiresInMin} minutes and can only be used once.</p>
    <p style="margin:24px 0;"><a href="${args.link}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;">Sign in →</a></p>
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">Or copy and paste this URL:<br /><span style="word-break:break-all;color:#374151;">${args.link}</span></p>
  `,
  )
  return { to: args.email, subject: `Sign in to ${APP_NAME}`, html, text, tags: [{ name: 'kind', value: 'magic-link' }] }
}

export function feedbackEmail(args: {
  to: string
  reporter: { name: string; email: string; login: string }
  category: string
  subject: string
  message: string
}): Email {
  const text = `New feedback from ${args.reporter.name}\n\nCategory: ${args.category}\nSubject: ${args.subject}\n\n${args.message}`
  const html = shell(
    'Feedback',
    `
    <div style="font-size:12px;font-weight:600;letter-spacing:0.06em;color:#7c3aed;text-transform:uppercase;margin-bottom:8px;">Feedback · ${args.category}</div>
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;line-height:1.3;">${args.subject}</h1>
    <div style="margin:0 0 24px;font-size:13px;color:#6b7280;">From ${args.reporter.name} (${args.reporter.login})</div>
    <div style="font-size:15px;line-height:1.6;color:#0a0a0a;white-space:pre-wrap;">${escapeHtml(args.message)}</div>
  `,
  )
  return {
    to: args.to,
    subject: `[Feedback · ${args.category}] ${args.subject}`,
    html,
    text,
    replyTo: args.reporter.email,
    tags: [
      { name: 'kind', value: 'feedback' },
      { name: 'category', value: args.category },
    ],
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}