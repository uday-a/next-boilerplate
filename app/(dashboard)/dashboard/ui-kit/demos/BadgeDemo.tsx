'use client'

import { Badge } from '@/components/ui/badge'

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Pro</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="outline">v2.4.0</Badge>
      <Badge variant="success">Paid</Badge>
      <Badge variant="warning">Due soon</Badge>
      <Badge variant="info">Beta</Badge>
      <Badge variant="destructive">Failed</Badge>
    </div>
  )
}
