import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  CreditCard,
  Gauge,
  Plug,
  ShieldCheck,
  User,
  UserCircle,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = { title: 'Settings' }

const sections = [
  {
    slug: 'general',
    icon: User,
    title: 'General',
    description: 'Workspace name, timezone, default locale, brand colours.',
    meta: 'You · 4 fields',
  },
  {
    slug: 'account',
    icon: UserCircle,
    title: 'Account',
    description: 'Profile, email, password, account deletion.',
    meta: 'Your personal info',
  },
  {
    slug: 'security',
    icon: ShieldCheck,
    title: 'Security',
    description: 'Sessions, two-factor auth, API tokens.',
    meta: '1 active session',
  },
  {
    slug: 'notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Email and in-app delivery preferences.',
    meta: 'Email · in-app',
  },
  {
    slug: 'integrations',
    icon: Plug,
    title: 'Integrations',
    description: 'Connected OAuth apps and webhooks.',
    meta: '0 connected',
  },
  {
    slug: 'team',
    icon: Users,
    title: 'Team',
    description: 'Members, roles, invitations, and SSO configuration.',
    meta: '8 members · 2 pending invites',
  },
  {
    slug: 'billing',
    icon: CreditCard,
    title: 'Billing',
    description: 'Current plan, payment method, invoices, usage caps.',
    meta: 'Pro · $148.40 this cycle',
  },
  {
    slug: 'limits',
    icon: Gauge,
    title: 'Limits',
    description: 'API quotas, rate limits, storage allowances per workspace.',
    meta: '47% of monthly quota',
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Workspace configuration. Changes apply to all members.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.slug} href={`/settings/${section.slug}`} className="group block">
              <Card className="hover:border-foreground/20 h-full transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                      <Icon className="size-5" />
                    </div>
                    <ArrowRight className="text-muted-foreground group-hover:text-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <CardTitle className="pt-3 text-base">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-[10px]">
                    {section.meta}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}