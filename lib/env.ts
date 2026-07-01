import { z } from 'zod'
import { resolveDemoMode } from './demo-mode'

const Env = z.object({
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters (e.g. `openssl rand -base64 32`)'),

  GITHUB_CLIENT_ID: z.string().min(1).optional(),
  GITHUB_CLIENT_SECRET: z.string().min(1).optional(),

  DATABASE_URL: z.string().url().optional(),

  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),

  INITIAL_ADMIN_LOGINS: z.string().optional(),

  I18NOW_PROJECT_ID: z.string().optional(),
  I18NOW_API_KEY: z.string().optional(),

  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
  AXIOM_ORG_ID: z.string().optional(),

  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default('https://us.i.posthog.com'),

  RESEND_API_KEY: z.string().startsWith('re_').optional(),
  EMAIL_FROM: z.string().email().default('onboarding@resend.dev'),
  EMAIL_OPS: z.string().email().optional(),

  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_SERVER: z.enum(['sandbox', 'production']).default('production'),
  POLAR_PRO_PRODUCT_ID: z.string().optional(),
  POLAR_TEAM_PRODUCT_ID: z.string().optional(),
  POLAR_ENTERPRISE_PRODUCT_ID: z.string().optional(),

  DEMO_MODE: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_DEMO_MODE: z.enum(['true', 'false']).optional(),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const parsed = Env.safeParse(process.env)
if (!parsed.success) {
  console.error('\n❌ Invalid environment variables:\n')
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`)
  }
  console.error()
  throw new Error('Invalid environment. Fix the values above (see .env.example) and restart.')
}

export const env = parsed.data

export const hasGithubOAuth = Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)

export const hasAxiom = Boolean(env.AXIOM_TOKEN && env.AXIOM_DATASET)
if (env.AXIOM_TOKEN && !env.AXIOM_DATASET) {
  throw new Error('AXIOM_TOKEN is set but AXIOM_DATASET is not. Set both, or unset both.')
}
if (env.AXIOM_DATASET && !env.AXIOM_TOKEN) {
  throw new Error('AXIOM_DATASET is set but AXIOM_TOKEN is not. Set both, or unset both.')
}

export const hasSentry = Boolean(env.NEXT_PUBLIC_SENTRY_DSN)
export const hasPostHog = Boolean(env.NEXT_PUBLIC_POSTHOG_KEY)
export const hasResend = Boolean(env.RESEND_API_KEY)

export const hasPolar = Boolean(env.POLAR_ACCESS_TOKEN && env.POLAR_WEBHOOK_SECRET)
if (env.POLAR_ACCESS_TOKEN && !env.POLAR_WEBHOOK_SECRET) {
  throw new Error('POLAR_ACCESS_TOKEN is set but POLAR_WEBHOOK_SECRET is not. Set both, or unset both.')
}
if (env.POLAR_WEBHOOK_SECRET && !env.POLAR_ACCESS_TOKEN) {
  throw new Error('POLAR_WEBHOOK_SECRET is set but POLAR_ACCESS_TOKEN is not. Set both, or unset both.')
}

export const isDemoMode = resolveDemoMode()