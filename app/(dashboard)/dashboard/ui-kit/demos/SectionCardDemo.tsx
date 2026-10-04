'use client'

import { Badge } from '@/components/ui/badge'
import { SectionCard } from '@/components/ui/section-card'

export default function SectionCardDemo() {
  return (
    <SectionCard title="Account details" description="Your workspace identity">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Plan</span>
        <Badge>Pro</Badge>
      </div>
    </SectionCard>
  )
}
