'use client'

import { ExternalLink, Github, Plug, Plus, Slack, Webhook } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const integrations = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Link repositories and surface PR activity in the workspace.',
    icon: Github,
    connected: true,
    account: 'uday',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications and command shortcuts into a Slack workspace.',
    icon: Slack,
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

export default function IntegrationsSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground text-sm">Connect external services and configure webhooks.</p>
      </header>

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
                <div className="flex items-start justify-between gap-4 py-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-md">
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{integration.name}</p>
                        {integration.connected && (
                          <Badge variant="secondary" className="text-[10px]">
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
                    <Button size="sm">
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
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Webhooks</CardTitle>
            <CardDescription>POST workspace events as JSON to your endpoint.</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="size-4" />
            Add webhook
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            No webhooks configured.
            <a
              href="#"
              className="text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline"
            >
              Read the docs <ExternalLink className="size-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}