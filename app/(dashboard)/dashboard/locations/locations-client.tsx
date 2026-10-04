'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Briefcase, Building2, Clock, Globe2, MapPin, Search, TrendingUp, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { Page, PageBody, PageHeader, PageHeaderHeading } from '@/components/ui/page'
import {
  LeafletCircleMarker,
  LeafletMap,
  LeafletMarker,
  LeafletPolyline,
  LeafletPopup,
  LeafletTooltip,
  type LeafletMapRef,
} from '@/components/ui/leaflet-map'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useChartTheme } from '@/components/ui/charts/useChartTheme'
import { StatTile } from '@/components/blocks/StatTile'
import { MapControls } from '@/components/blocks/MapControls'
import { OfficePopup } from '@/components/blocks/OfficePopup'
import { formatNumber } from '@/lib/utils'
import {
  arcPath,
  customerRadius,
  customerRegions,
  kindBadgeVariant,
  kindDotBg,
  kindDotClass,
  markerSizeClass,
  officeBounds,
  officeLocations,
  timeInZone,
  utcOffsetLabel,
  type OfficeKind,
} from '@/lib/locations'

type Layer = 'offices' | 'customers' | 'both'
type RegionKey = 'americas' | 'emea' | 'apac'

const REGION_OF: Record<string, RegionKey> = {
  'United States': 'americas', Canada: 'americas', Brazil: 'americas',
  'United Kingdom': 'emea', Ireland: 'emea', Germany: 'emea',
  India: 'apac', Singapore: 'apac', Japan: 'apac', Australia: 'apac',
}
const REGION_KEYS: RegionKey[] = ['americas', 'emea', 'apac']
const REGION_BARS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3']
const KINDS: OfficeKind[] = ['hq', 'hub', 'office']
const LAYERS: Layer[] = ['offices', 'customers', 'both']
// Stable identity: LeafletMap re-applies `center` whenever the array changes,
// which would undo fitBounds on every re-render (e.g. the clock tick).
const MAP_CENTER: [number, number] = [-20, 20]
const hq = officeLocations.find((o) => o.kind === 'hq')!
const topCustomers = [...customerRegions].sort((a, b) => b.arr - a.arr).slice(0, 7)
const maxArr = topCustomers[0]?.arr ?? 1
const formatArr = (k: number) => (k >= 1000 ? `$${(k / 1000).toFixed(1)}M` : `$${k}k`)

/** Office directory + map + customer footprint. Port of Nuxt `dashboard/locations.vue`. */
export function LocationsClient() {
  const t = useTranslations()
  const locale = useLocale()
  const theme = useChartTheme()
  const [search, setSearch] = useState('')
  const [kindFilter, setKindFilter] = useState<'all' | OfficeKind>('all')
  const [layer, setLayer] = useState<Layer>('offices')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const showOffices = layer !== 'customers'
  const showCustomers = layer !== 'offices'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return officeLocations.filter((office) => {
      if (kindFilter !== 'all' && office.kind !== kindFilter) return false
      if (!q) return true
      return office.city.toLowerCase().includes(q) || office.country.toLowerCase().includes(q)
    })
  }, [search, kindFilter])

  // WHY: the stats follow the same FILTERED list as the map + list --
  // a kind/search slice that leaves the totals on "all offices" lies.
  const stats = useMemo(() => {
    const totalHeadcount = filtered.reduce((sum, o) => sum + o.headcount, 0)
    const regions = REGION_KEYS.map((key, i) => {
      const offices = filtered.filter((o) => REGION_OF[o.country] === key)
      const headcount = offices.reduce((sum, o) => sum + o.headcount, 0)
      return {
        key,
        bar: REGION_BARS[i]!,
        offices: offices.length,
        headcount,
        openRoles: offices.reduce((sum, o) => sum + o.openRoles, 0),
        share: totalHeadcount === 0 ? 0 : Math.round((headcount / totalHeadcount) * 100),
      }
    })
    return {
      totalHeadcount,
      countryCount: new Set(filtered.map((o) => o.country)).size,
      openRoles: filtered.reduce((sum, o) => sum + o.openRoles, 0),
      hiringOffices: filtered.filter((o) => o.openRoles > 0).length,
      // Headcount-weighted year-on-year growth across the filtered offices.
      growth: totalHeadcount === 0 ? 0 : Math.round(filtered.reduce((sum, o) => sum + o.growth * o.headcount, 0) / totalHeadcount),
      kindCounts: {
        hq: filtered.filter((o) => o.kind === 'hq').length,
        hub: filtered.filter((o) => o.kind === 'hub').length,
        office: filtered.filter((o) => o.kind === 'office').length,
      },
      newestOffice: [...filtered].sort((a, b) => b.opened - a.opened)[0],
      // Distinct current offsets (London and Dublin share one), not zone names.
      timezoneCount: new Set(filtered.map((o) => (o.timezone ? utcOffsetLabel(o.timezone) : ''))).size,
      regions,
      largestRegion: [...regions].sort((a, b) => b.headcount - a.headcount)[0]!,
      // Hiring intensity: open roles relative to current headcount.
      hiringRegion: [...regions].sort((a, b) => b.openRoles / (b.headcount || 1) - a.openRoles / (a.headcount || 1))[0]!,
    }
  }, [filtered])

  // Local time per office. Client-only (null during SSR) so hydration
  // matches; ticks once a minute.
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    const first = setTimeout(() => setNow(new Date()), 0)
    const clock = setInterval(() => setNow(new Date()), 60_000)
    return () => {
      clearTimeout(first)
      clearInterval(clock)
    }
  }, [])
  const localTime = (tz?: string) => (now && tz ? timeInZone(tz, now, locale) : null)

  // Camera control: list clicks fly the map and open the marker's popup.
  const mapRef = useRef<LeafletMapRef>(null)

  // Frame every visible office. fitBounds also snaps to whole zoom levels,
  // which avoids the tile seams fractional zooms leave behind.
  const fitToOffices = useCallback(
    (animate = true) => {
      const bounds = officeBounds(filtered)
      if (bounds) mapRef.current?.fitBounds(bounds, { padding: [48, 48], maxZoom: 5, animate })
    },
    [filtered],
  )
  useEffect(() => {
    fitToOffices()
  }, [fitToOffices])

  function resetView() {
    setSelectedId(null)
    mapRef.current?.getMap()?.closePopup()
    fitToOffices()
  }

  function selectOffice(id: string) {
    setSelectedId(id)
    const office = officeLocations.find((o) => o.id === id)
    const map = mapRef.current?.getMap()
    if (!office || !map) return
    mapRef.current?.flyTo({ center: office.lngLat, zoom: Math.max(map.getZoom(), 4), duration: 700 })
    // LeafletMarker doesn't publish its instance; find it by position.
    map.eachLayer((l) => {
      const marker = l as typeof l & { getLatLng?: () => { lat: number; lng: number }; getPopup?: () => unknown }
      const ll = marker.getLatLng?.()
      if (marker.getPopup?.() && ll && ll.lat === office.lngLat[1] && ll.lng === office.lngLat[0]) l.openPopup()
    })
  }

  function onMarkerClick(id: string) {
    setSelectedId(id)
    document.getElementById(`location-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderHeading title={t('nav.items.locations')} description={t('dashboard.locations.description')} />
      </PageHeader>

      <PageBody className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatTile
            label={t('dashboard.locations.stats.offices')}
            value={String(filtered.length)}
            caption={t('dashboard.locations.stats.officesCaption', stats.kindCounts)}
            icon={Building2}
            footer={
              stats.newestOffice ? (
                <span>{t('dashboard.locations.stats.newest', { city: stats.newestOffice.city, year: stats.newestOffice.opened })}</span>
              ) : null
            }
          />
          <StatTile
            label={t('dashboard.locations.stats.countries')}
            value={String(stats.countryCount)}
            caption={t('dashboard.locations.stats.countriesCaption', { n: stats.regions.length })}
            icon={Globe2}
            footer={t('dashboard.locations.stats.timezones', { n: stats.timezoneCount })}
          />
          <StatTile
            label={t('dashboard.locations.stats.headcount')}
            value={formatNumber(stats.totalHeadcount, locale)}
            delta={`+${stats.growth}%`}
            caption={t('dashboard.locations.stats.growthCaption')}
            icon={Users}
          />
          <StatTile
            label={t('dashboard.locations.stats.openRoles')}
            value={String(stats.openRoles)}
            caption={t('dashboard.locations.stats.openRolesCaption', { n: stats.hiringOffices })}
            icon={Briefcase}
          />
        </div>

        {/* List column never drops below 20rem so city names stay whole. */}
        <div className="grid gap-4 lg:grid-cols-[minmax(20rem,1fr)_2fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('dashboard.locations.search.placeholder')}
                  aria-label={t('dashboard.locations.search.placeholder')}
                  prefixIcon={<Search />}
                  allowClear
                  className="flex-1"
                />
                <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as 'all' | OfficeKind)}>
                  <SelectTrigger className="w-full sm:w-32" aria-label={t('dashboard.locations.filter.label')}>
                    <SelectValue placeholder={t('dashboard.locations.filter.label')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('dashboard.locations.filter.all')}</SelectItem>
                    {KINDS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {t(`dashboard.locations.kind.${k}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filtered.length ? (
                <ul className="max-h-[456px] space-y-2 overflow-y-auto pr-1">
                  {filtered.map((office) => (
                    <li key={office.id} id={`location-${office.id}`}>
                      <button
                        type="button"
                        aria-pressed={selectedId === office.id}
                        className={[
                          'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors',
                          selectedId === office.id
                            ? 'border-primary/40 bg-primary/5 ring-primary ring-1'
                            : 'border-border/70 hover:border-border hover:bg-muted/50',
                        ].join(' ')}
                        onClick={() => selectOffice(office.id)}
                      >
                        <span className={`block size-2 shrink-0 rounded-full ${kindDotBg(office.kind)}`} />
                        <span className="min-w-0 flex-1">
                          {/* Wraps instead of truncating: the list column is narrow at lg. */}
                          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                            <span className="text-sm font-medium whitespace-nowrap">{office.city}</span>
                            <Badge variant={kindBadgeVariant(office.kind)} className="shrink-0">
                              {t(`dashboard.locations.kind.${office.kind}`)}
                            </Badge>
                          </span>
                          <span className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 text-xs">
                            {office.country}
                            {localTime(office.timezone) ? (
                              <>
                                <span aria-hidden="true">·</span>
                                <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                                <span className="tabular-nums">{localTime(office.timezone)}</span>
                              </>
                            ) : null}
                          </span>
                        </span>
                        <span className="max-w-[55%] text-right">
                          <span className="block text-sm font-semibold tabular-nums">{formatNumber(office.headcount, locale)}</span>
                          <span className="text-muted-foreground flex flex-wrap justify-end gap-x-1 text-xs tabular-nums">
                            {/* WHY: growth pairs color with a shape so direction never rides on green alone. */}
                            <span className="text-success inline-flex items-center gap-0.5">
                              <TrendingUp className="size-3" aria-hidden="true" />+{office.growth}%
                            </span>
                            <span>· {t('dashboard.locations.openRolesShort', { n: office.openRoles })}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={MapPin}
                  title={t('dashboard.locations.empty.title')}
                  description={t('dashboard.locations.empty.description')}
                />
              )}
            </CardContent>
          </Card>

          {/* Large map: fills its card (no inner frame) */}
          <Card className="relative isolate overflow-hidden p-0">
            <LeafletMap
              ref={mapRef}
              variant="muted"
              center={MAP_CENTER}
              zoom={2}
              minZoom={1}
              scrollWheelZoom
              navigation={false}
              className="h-[560px] w-full"
              onCreated={() => fitToOffices(false)}
            >
              {/* HQ links: thin dashed lines to every office */}
              {showOffices
                ? filtered
                    .filter((o) => o.kind !== 'hq')
                    .map((office) => (
                      <LeafletPolyline
                        key={`link-${office.id}`}
                        lngLatPath={arcPath(hq.lngLat, office.lngLat)}
                        color={theme.textColor}
                        weight={1}
                        opacity={selectedId === office.id ? 0.9 : 0.35}
                        dashArray="3 5"
                      />
                    ))
                : null}
              {/* Customer concentration: circle area tracks ARR */}
              {showCustomers
                ? customerRegions.map((c) => (
                    <LeafletCircleMarker
                      key={c.id}
                      center={c.lngLat}
                      radius={customerRadius(c.arr)}
                      color={theme.colors[1]}
                      fillColor={theme.colors[1]}
                      fillOpacity={0.25}
                      weight={1.5}
                    >
                      <LeafletTooltip direction="top">
                        <span className="text-xs">
                          <span className="font-medium">{c.city}</span> · {t('dashboard.locations.accounts', { n: c.accounts })} · {formatArr(c.arr)} ARR
                        </span>
                      </LeafletTooltip>
                    </LeafletCircleMarker>
                  ))
                : null}
              {(showOffices ? filtered : []).map((office, i) => (
                <LeafletMarker
                  key={office.id}
                  lngLat={office.lngLat}
                  anchor="center"
                  zIndexOffset={selectedId === office.id ? 1000 : 0}
                  opacity={selectedId && selectedId !== office.id ? 0.55 : 1}
                  onClick={() => onMarkerClick(office.id)}
                >
                  {/* WHY: 200ms staggered pop-in; the HQ / selected pulse is
                      gated with motion-safe so reduced-motion gets a static marker. */}
                  <span
                    className="animate-in fade-in-0 zoom-in-50 fill-mode-both relative flex items-center justify-center duration-200"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    {office.kind === 'hq' || selectedId === office.id ? (
                      <span className={`absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping ${kindDotBg(office.kind)}`} aria-hidden="true" />
                    ) : null}
                    <span
                      className={[
                        'outline-background relative block rounded-full ring-4 outline-2 transition-transform duration-200 hover:scale-125',
                        markerSizeClass(office.headcount),
                        kindDotClass(office.kind),
                        selectedId === office.id ? 'scale-125' : '',
                      ].join(' ')}
                    />
                  </span>
                  <LeafletTooltip direction="top" offset={[0, -10]}>
                    <span className="text-xs font-medium">{office.city}</span>
                  </LeafletTooltip>
                  <LeafletPopup offset={[0, -10]} minWidth={240}>
                    <OfficePopup office={office} localTime={localTime(office.timezone)} />
                  </LeafletPopup>
                </LeafletMarker>
              ))}
            </LeafletMap>
            <MapControls
              onZoomIn={() => mapRef.current?.zoomIn()}
              onZoomOut={() => mapRef.current?.zoomOut()}
              onReset={resetView}
            />
            {/* WHY: the canvas map is invisible to screen readers -- this
                sr-only list carries the same office data as text. */}
            <ul className="sr-only">
              {officeLocations.map((office) => (
                <li key={`sr-${office.id}`}>
                  {office.city}, {office.country} — {formatNumber(office.headcount, locale)} people
                </li>
              ))}
            </ul>
            {/* Layer switch */}
            <div className="absolute top-3 left-3 z-[800]">
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={layer}
                onValueChange={(v) => {
                  if (v) setLayer(v as Layer)
                }}
                className="bg-card/90 backdrop-blur-sm"
                aria-label={t('dashboard.locations.layers.label')}
              >
                {LAYERS.map((l) => (
                  <ToggleGroupItem key={l} value={l} className="px-2.5 text-xs">
                    {t(`dashboard.locations.layers.${l}`)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            {/* Legend: kind color + "size = headcount". Wraps instead of
                running under the zoom controls on narrow screens. */}
            <div className="bg-card/90 text-muted-foreground pointer-events-none absolute bottom-3 left-3 z-[800] mr-14 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-2.5 py-1.5 text-xs backdrop-blur-sm">
              {KINDS.map((kind) => (
                <span key={kind} className="flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${kindDotBg(kind)}`} />
                  {t(`dashboard.locations.kind.${kind}`)}
                </span>
              ))}
              <span className="border-l pl-3">{t('dashboard.locations.sizeLegend')}</span>
              {showCustomers ? (
                <span className="flex items-center gap-1.5 border-l pl-3">
                  <span className="border-chart-2 bg-chart-2/25 size-2.5 rounded-full border" />
                  {t('dashboard.locations.layers.customers')}
                </span>
              ) : null}
            </div>
          </Card>
        </div>

        {/* Breakdown: people by region, customers by city */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('dashboard.locations.regions.title')}</CardTitle>
              <CardDescription>{t('dashboard.locations.regions.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.regions.map((r) => (
                <div key={r.key} className="space-y-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                    <span className="font-medium">{t(`dashboard.locations.regions.${r.key}`)}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {t('dashboard.locations.regions.meta', { offices: r.offices, roles: r.openRoles })} ·{' '}
                      <span className="text-foreground font-medium">{r.headcount}</span> ({r.share}%)
                    </span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${r.share}%` }} />
                  </div>
                </div>
              ))}
              <div className="text-muted-foreground grid grid-cols-2 gap-3 border-t pt-3 text-xs">
                <div>
                  <div>{t('dashboard.locations.regions.largest')}</div>
                  <div className="text-foreground text-sm font-medium">
                    {t(`dashboard.locations.regions.${stats.largestRegion.key}`)} · {stats.largestRegion.share}%
                  </div>
                </div>
                <div>
                  <div>{t('dashboard.locations.regions.hiring')}</div>
                  <div className="text-foreground text-sm font-medium">
                    {t(`dashboard.locations.regions.${stats.hiringRegion.key}`)} ·{' '}
                    {t('dashboard.locations.openRolesShort', { n: stats.hiringRegion.openRoles })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('dashboard.locations.customers.title')}</CardTitle>
              <CardDescription>{t('dashboard.locations.customers.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Subgrid: the city column sizes to the longest name (no
                  truncation) while every row's bar still lines up. */}
              <ul className="grid grid-cols-[max-content_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 text-sm">
                {topCustomers.map((c) => (
                  <li key={c.id} className="col-span-3 grid grid-cols-subgrid items-center">
                    <span className="font-medium">{c.city}</span>
                    <span className="bg-muted h-1.5 overflow-hidden rounded-full">
                      <span className="bg-chart-2 block h-full rounded-full" style={{ width: `${Math.round((c.arr / maxArr) * 100)}%` }} />
                    </span>
                    <span className="text-muted-foreground text-xs whitespace-nowrap tabular-nums">
                      <span className="text-foreground font-medium">{formatArr(c.arr)}</span> · {t('dashboard.locations.accounts', { n: c.accounts })}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </Page>
  )
}
