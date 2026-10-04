'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Page, PageBody, PageHeader } from '@/components/ui/page'

// PageHeaderHeading renders the page's h1, so this preview uses a plain
// title to keep one h1 per page. Real pages use PageHeaderHeading.
export default function PageDemo() {
  return (
    <Page className="space-y-4">
      <PageHeader
        actions={
          <Button size="sm">
            <Plus className="size-4" aria-hidden="true" />
            New project
          </Button>
        }
      >
        <p className="text-2xl font-semibold tracking-tight">Projects</p>
        <p className="text-muted-foreground mt-1 text-sm">Every project in this workspace.</p>
      </PageHeader>
      <PageBody className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">PageBody content</PageBody>
    </Page>
  )
}
