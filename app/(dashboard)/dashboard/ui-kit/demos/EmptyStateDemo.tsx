'use client'

import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

export default function EmptyStateDemo() {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No projects yet"
      description="Create a project to start tracking deploys and usage."
      headingTag="h4"
      className="py-4"
    >
      <Button size="sm" className="mt-4">New project</Button>
    </EmptyState>
  )
}
