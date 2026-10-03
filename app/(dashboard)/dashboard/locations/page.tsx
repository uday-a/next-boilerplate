'use client'

import { useMemo, useState } from 'react'
import { Briefcase, Building2, Globe2, MapPin, Search, TrendingUp, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DemoDataBanner } from '@/components/blocks/DemoDataBanner'
import { StatTile } from '@/components/blocks/StatTile'
import { EmptyState } from '@/components/ui/empty-state'
import { KpiGrid } from '@/components/ui/kpi-grid'
import { formatNumber } from '@/lib/utils'
import {
  customerRegions,
  kindBadgeVariant,
  kindDotBg,
  officeLocations,
  timeInZone,
  utcOffsetLabel,
  type OfficeKind,
} from '@/lib/locations'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'

/**
 * Office directory + customer footprint. Port of Nuxt `dashboard/locations.vue`.
 * TODO: swap the static grid for the LeafletMap wrapper (curved HQ arcs,
 * zoom/reset controls, office popups) once a React map layer lands —
 * the shared `lib/locations` dataset already carries lngLat/bounds/arcs.
 */
export default function LocationsPage() {
  const t = useTranslations()
  const locale = useLocale()
  const [search, setSearch] = useState('')
  const [kindFilter, setKindFilter] = useState<'all' | OfficeKind>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return officeLocations.filter((office) => {
      if (kindFilter !== 'all' && office.kind !== kindFilter) return false
      if (!q) return true
      return office.city.toLowerCase().includes(q) || office.country.toLowerCase().includes(q)
    })
  }, [search, kindFilter])

  // WHY: the stats follow the same FILTERED list as the list --
  // a kind/search slice that leaves the totals on "all offices" lies.
  const totalHeadcount = useMemo(() => filtered.reduce((s, o) => s + o.headcount, 0), [filtered])
  const countryCount = useMemo(() => new Set(filtered.map((o) => o.country)).size, [filtered])
  const openRoles = useMemo(() => filtered.reduce((s, o) => s + o.openRoles, 0), [filtered])
  const timezoneCount = useMemo(
    () => new Set(filtered.map((o) => (o.timezone ? utcOffsetLabel(o.timezone, new Date(), locale) : ''))).size,
    [filtered, locale],
  )
  const now = useMemo(() => new Date(), [])

// Canonical kind labels (Nuxt `dashboard.locations.kind`).
function kindLabel(kind: OfficeKind): string {
  return t(`dashboard.locations.kind.${kind}`)
}

function formatAccounts(n: number) {
  return t('dashboard.locations.accounts', { n })
}

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading
          title={t('dashboard.locations.title')}
          description={t('dashboard.locations.description')}
        />
      </PageHeader>
      <PageBody className="space-y-4">
        <DemoDataBanner />

        <KpiGrid>
          <StatTile label={t('dashboard.locations.stats.offices')} value={String(filtered.length)} caption={`${countryCount} countries`} icon={Building2} />
          <StatTile label={t('dashboard.locations.stats.headcount')} value={formatNumber(totalHeadcount, locale)} caption="Across all offices" icon={Users} />
          <StatTile label={t('dashboard.locations.stats.openRoles')} value={String(openRoles)} caption="Hiring now" icon={Briefcase} />
          <StatTile label="Time zones" value={String(timezoneCount)} caption="Distinct UTC offsets" icon={Globe2} />
        </KpiGrid>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder={t('dashboard.locations.search.placeholder')}
              aria-label="Search offices"
              className="pl-8"
            />
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={kindFilter}
            onValueChange={(v) => { if (v) setKindFilter(v as 'all' | OfficeKind) }}
            aria-label="Filter by office kind"
          >
            <ToggleGroupItem value="all" className="px-3 text-xs">{t('dashboard.locations.filter.all')}</ToggleGroupItem>
            <ToggleGroupItem value="hq" className="px-3 text-xs">{t('dashboard.locations.kind.hq')}</ToggleGroupItem>
            <ToggleGroupItem value="hub" className="px-3 text-xs">{t('dashboard.locations.kind.hub')}</ToggleGroupItem>
            <ToggleGroupItem value="office" className="px-3 text-xs">{t('dashboard.locations.kind.office')}</ToggleGroupItem>
          </ToggleGroup>
          <p className="text-muted-foreground text-xs tabular-nums" aria-live="polite">
            {filtered.length} of {officeLocations.length}
          </p>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={MapPin}
                title={t('dashboard.locations.empty.title')}
                description={t('dashboard.locations.empty.description')}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((office) => (
              <Card key={office.id}>
                <CardHeader className="p-4 pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`size-2 shrink-0 rounded-full ${kindDotBg(office.kind)}`} aria-hidden="true" />
                        <CardTitle className="truncate text-base" title={office.city}>{office.city}</CardTitle>
                      </div>
                      <CardDescription>
                        {office.country}
                        {office.timezone ? (
                          <span className="tabular-nums">
                            {' '}· {timeInZone(office.timezone, now, locale)} ({utcOffsetLabel(office.timezone, now, locale)})
                          </span>
                        ) : null}
                      </CardDescription>
                    </div>
                    <Badge variant={kindBadgeVariant(office.kind)} className="shrink-0">
                      {kindLabel(office.kind)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 p-4">
                  <div className="bg-muted/50 grid grid-cols-3 divide-x rounded-md">
                    <div className="px-2 py-1.5">
                      <div className="text-muted-foreground text-xs">{t('dashboard.locations.popup.people')}</div>
                      <div className="text-sm font-semibold tabular-nums">{formatNumber(office.headcount, locale)}</div>
                      <div className="text-success text-xs tabular-nums">
                        {/* WHY: growth pairs color with a shape
                            so direction never rides on green alone. */}
                        <span className="text-success inline-flex items-center gap-0.5">
                          <TrendingUp className="size-3" aria-hidden="true" />
                          +{office.growth}%
                        </span>
                      </div>
                    </div>
                    <div className="px-2 py-1.5">
                      <div className="text-muted-foreground text-xs">{t('dashboard.locations.popup.roles')}</div>
                      <div className="text-sm font-semibold tabular-nums">{office.openRoles}</div>
                      <div className="text-muted-foreground text-xs">{t('dashboard.locations.popup.hiring')}</div>
                    </div>
                    <div className="px-2 py-1.5">
                      <div className="text-muted-foreground text-xs">{t('dashboard.locations.popup.since')}</div>
                      <div className="text-sm font-semibold tabular-nums">{office.opened}</div>
                      <div className="text-muted-foreground truncate text-xs" title={office.lead}>{office.lead}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-base">{t('dashboard.locations.customers.title')}</CardTitle>
            <CardDescription>{t('dashboard.locations.customers.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {[...customerRegions]
              .sort((a, b) => b.arr - a.arr)
              .slice(0, 7)
              .map((r) => {
                const max = 3120
                return (
                  <div key={r.id} className="flex items-center gap-3 text-sm">
                    <span className="w-28 shrink-0 truncate text-xs font-medium" title={r.city}>{r.city}</span>
                    <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                      <div className="bg-chart-1 h-full rounded-full" style={{ width: `${Math.round((r.arr / max) * 100)}%` }} />
                    </div>
                    <span className="text-muted-foreground w-32 shrink-0 whitespace-nowrap text-right text-xs tabular-nums">
                      ${r.arr >= 1000 ? `${(r.arr / 1000).toFixed(1)}M` : `${r.arr}k`} · {formatAccounts(r.accounts)}
                    </span>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}
