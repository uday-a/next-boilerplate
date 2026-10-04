'use client'

import { Badge } from '@/components/ui/badge'
import { DataList, DataListItem } from '@/components/ui/data-list'

export default function DataListDemo() {
  return (
    <DataList>
      <DataListItem>
        <span className="text-muted-foreground text-sm">Status</span>
        <Badge variant="success">Active</Badge>
      </DataListItem>
      <DataListItem>
        <span className="text-muted-foreground text-sm">Region</span>
        <span className="font-mono text-sm">us-east-1</span>
      </DataListItem>
      <DataListItem>
        <span className="text-muted-foreground text-sm">Plan</span>
        <Badge>Pro</Badge>
      </DataListItem>
      <DataListItem>
        <span className="text-muted-foreground text-sm">Seats</span>
        <span className="text-sm tabular-nums">8 of 25</span>
      </DataListItem>
    </DataList>
  )
}
