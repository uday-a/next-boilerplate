'use client'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const repos = ['acme/web-app', 'acme/api-gateway', 'acme/billing-service']

export default function CollapsibleDemo() {
  return (
    <Collapsible>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">3 repositories connected</p>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">Toggle</Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2 space-y-2">
        {repos.map(repo => (
          <div key={repo} className="rounded-md border px-3 py-2 font-mono text-xs">{repo}</div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
