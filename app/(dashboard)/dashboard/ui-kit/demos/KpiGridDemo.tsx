'use client'

import { StatTile } from '@/components/blocks/StatTile'
import { KpiGrid } from '@/components/ui/kpi-grid'

const tiles = [
  { label: 'Total revenue', value: '$84,230', delta: '+12.5%' },
  { label: 'Active users', value: '2,420', delta: '+8.2%' },
  { label: 'Conversion rate', value: '3.24%', delta: '-0.4%', deltaTone: 'negative' as const },
  { label: 'Avg. order value', value: '$64.50', delta: '+2.1%' },
]

export default function KpiGridDemo() {
  return (
    <KpiGrid columns={2}>
      {tiles.map(tile => (
        <StatTile key={tile.label} {...tile} />
      ))}
    </KpiGrid>
  )
}
