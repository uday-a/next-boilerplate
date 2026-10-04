'use client'

import { ExternalLink, Plug, Plus, Webhook } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import { useTranslations } from 'next-intl'

// lucide-react 1.x dropped brand icons; these are the old Lucide paths.
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function SlackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="3" height="8" x="13" y="2" rx="1.5" />
      <path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5" />
      <rect width="3" height="8" x="8" y="14" rx="1.5" />
      <path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5" />
      <rect width="8" height="3" x="14" y="13" rx="1.5" />
      <path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5" />
      <rect width="8" height="3" x="2" y="8" rx="1.5" />
      <path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5" />
    </svg>
  )
}

const integrations = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Link repositories and surface PR activity in the workspace.',
    icon: GithubIcon,
    connected: true,
    account: 'acme-inc',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications and command shortcuts into a Slack workspace.',
    icon: SlackIcon,
    connected: false,
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    description: 'POST workspace events to a URL you control.',
    icon: Webhook,
    connected: false,
  },
]

export function IntegrationsSettingsClient() {
  const t = useTranslations()
  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading
          title={t('nav.items.integrations')}
          description="Connect external services and configure webhooks."
        />
      </PageHeader>
      <PageBody className="max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available</CardTitle>
            <CardDescription>OAuth apps and event sinks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrations.map((integration, index) => {
              const Icon = integration.icon
              return (
                <div key={integration.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4 py-2">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md">
                        <Icon className="size-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{integration.name}</p>
                          {integration.connected && (
                            <Badge variant="secondary">
                              Connected{integration.account ? ` · ${integration.account}` : ''}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">{integration.description}</p>
                      </div>
                    </div>
                    {integration.connected ? (
                      <Button variant="outline" size="sm">
                        Disconnect
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Plug className="size-4" />
                        Connect
                      </Button>
                    )}
                  </div>
                  {index < integrations.length - 1 && <Separator />}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhooks</CardTitle>
            <CardDescription>POST workspace events as JSON to your endpoint.</CardDescription>
            <CardAction>
              <Button size="sm">
                <Plus className="size-4" />
                Add webhook
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              No webhooks configured.
              <a
                href="#"
                className="text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline"
              >
                Read the docs <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}
