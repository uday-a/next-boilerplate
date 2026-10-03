/** Shared office dataset for the dashboard map widget and the locations page. */

export type OfficeKind = 'hq' | 'office' | 'hub'

export interface OfficeLocation {
  id: string
  city: string
  country: string
  /** [lng, lat] — Mapbox order, matching the LeafletMap wrapper. */
  lngLat: [number, number]
  kind: OfficeKind
  headcount: number
  /** IANA zone (e.g. `Europe/London`), so offsets follow daylight saving. */
  timezone?: string
  /** Open requisitions at this office. */
  openRoles: number
  /** Headcount growth vs a year ago, in percent. */
  growth: number
  lead: string
  opened: number
}

/** A city where customers are concentrated — the map's second layer. */
export interface CustomerRegion {
  id: string
  city: string
  lngLat: [number, number]
  accounts: number
  /** Annual recurring revenue, in $k. */
  arr: number
}

/** Badge variant per office kind — shared by the dashboard widget and the locations page. */
export function kindBadgeVariant(kind: OfficeKind): 'default' | 'secondary' | 'outline' {
  if (kind === 'hq') return 'default'
  if (kind === 'hub') return 'secondary'
  return 'outline'
}

/** Map dot classes per office kind — HQ reads primary, hubs chart-1, offices neutral. */
export function kindDotClass(kind: OfficeKind): string {
  if (kind === 'hq') return 'bg-primary ring-primary/25'
  if (kind === 'hub') return 'bg-chart-1 ring-chart-1/25'
  return 'bg-muted-foreground ring-muted-foreground/25'
}

/** Background only (no ring) for small list dots. */
export function kindDotBg(kind: OfficeKind): string {
  return kindDotClass(kind).split(' ')[0] ?? ''
}
// Headcounts sum to 1,221 — the dashboard's "Headcount by department" total.
export const officeLocations: OfficeLocation[] = [
  { id: 'sf', city: 'San Francisco', country: 'United States', lngLat: [-122.4194, 37.7749], kind: 'hq', headcount: 312, timezone: 'America/Los_Angeles', openRoles: 18, growth: 14, lead: 'Olivia Bennett', opened: 2019 },
  { id: 'nyc', city: 'New York', country: 'United States', lngLat: [-74.006, 40.7128], kind: 'hub', headcount: 176, timezone: 'America/New_York', openRoles: 11, growth: 22, lead: 'James Carter', opened: 2020 },
  { id: 'austin', city: 'Austin', country: 'United States', lngLat: [-97.7431, 30.2672], kind: 'office', headcount: 32, timezone: 'America/Chicago', openRoles: 6, growth: 60, lead: 'Emma Collins', opened: 2025 },
  { id: 'toronto', city: 'Toronto', country: 'Canada', lngLat: [-79.3832, 43.6532], kind: 'office', headcount: 64, timezone: 'America/Toronto', openRoles: 4, growth: 9, lead: 'Lucas Meyer', opened: 2021 },
  { id: 'sao-paulo', city: 'São Paulo', country: 'Brazil', lngLat: [-46.6333, -23.5558], kind: 'office', headcount: 48, timezone: 'America/Sao_Paulo', openRoles: 3, growth: 12, lead: 'Grace Walker', opened: 2022 },
  { id: 'london', city: 'London', country: 'United Kingdom', lngLat: [-0.1276, 51.5074], kind: 'hub', headcount: 158, timezone: 'Europe/London', openRoles: 9, growth: 17, lead: 'Sophie Turner', opened: 2020 },
  { id: 'dublin', city: 'Dublin', country: 'Ireland', lngLat: [-6.2603, 53.3498], kind: 'office', headcount: 52, timezone: 'Europe/Dublin', openRoles: 5, growth: 31, lead: 'Henry Foster', opened: 2023 },
  { id: 'berlin', city: 'Berlin', country: 'Germany', lngLat: [13.405, 52.52], kind: 'office', headcount: 86, timezone: 'Europe/Berlin', openRoles: 4, growth: 6, lead: 'Daniel Hughes', opened: 2021 },
  { id: 'bangalore', city: 'Bangalore', country: 'India', lngLat: [77.5946, 12.9716], kind: 'office', headcount: 94, timezone: 'Asia/Kolkata', openRoles: 12, growth: 41, lead: 'Chloe Morgan', opened: 2023 },
  { id: 'singapore', city: 'Singapore', country: 'Singapore', lngLat: [103.8198, 1.3521], kind: 'hub', headcount: 118, timezone: 'Asia/Singapore', openRoles: 7, growth: 19, lead: 'Ryan Brooks', opened: 2021 },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', lngLat: [139.6503, 35.6762], kind: 'office', headcount: 42, timezone: 'Asia/Tokyo', openRoles: 3, growth: 8, lead: 'Ella Hayes', opened: 2024 },
  { id: 'sydney', city: 'Sydney', country: 'Australia', lngLat: [151.2093, -33.8688], kind: 'office', headcount: 39, timezone: 'Australia/Sydney', openRoles: 2, growth: 5, lead: 'Jack Wilson', opened: 2022 },
]

export const customerRegions: CustomerRegion[] = [
  { id: 'c-sf', city: 'San Francisco', lngLat: [-122.4194, 37.7749], accounts: 64, arr: 3120 },
  { id: 'c-la', city: 'Los Angeles', lngLat: [-118.2437, 34.0522], accounts: 31, arr: 1240 },
  { id: 'c-sea', city: 'Seattle', lngLat: [-122.3321, 47.6062], accounts: 22, arr: 980 },
  { id: 'c-chi', city: 'Chicago', lngLat: [-87.6298, 41.8781], accounts: 27, arr: 1110 },
  { id: 'c-nyc', city: 'New York', lngLat: [-74.006, 40.7128], accounts: 58, arr: 2860 },
  { id: 'c-mex', city: 'Mexico City', lngLat: [-99.1332, 19.4326], accounts: 12, arr: 310 },
  { id: 'c-sao', city: 'São Paulo', lngLat: [-46.6333, -23.5558], accounts: 18, arr: 540 },
  { id: 'c-lon', city: 'London', lngLat: [-0.1276, 51.5074], accounts: 46, arr: 2210 },
  { id: 'c-par', city: 'Paris', lngLat: [2.3522, 48.8566], accounts: 21, arr: 870 },
  { id: 'c-ams', city: 'Amsterdam', lngLat: [4.9041, 52.3676], accounts: 17, arr: 690 },
  { id: 'c-ber', city: 'Berlin', lngLat: [13.405, 52.52], accounts: 19, arr: 720 },
  { id: 'c-dxb', city: 'Dubai', lngLat: [55.2708, 25.2048], accounts: 9, arr: 410 },
  { id: 'c-blr', city: 'Bangalore', lngLat: [77.5946, 12.9716], accounts: 24, arr: 480 },
  { id: 'c-sin', city: 'Singapore', lngLat: [103.8198, 1.3521], accounts: 29, arr: 1320 },
  { id: 'c-tyo', city: 'Tokyo', lngLat: [139.6503, 35.6762], accounts: 16, arr: 760 },
  { id: 'c-syd', city: 'Sydney', lngLat: [151.2093, -33.8688], accounts: 14, arr: 520 },
]

/** Circle radius (px) for a customer region, by ARR — sqrt so area tracks revenue. */
export function customerRadius(arr: number): number {
  return Math.round(4 + Math.sqrt(arr) / 3)
}

/** Marker dot size by headcount, so a 340-person HQ reads bigger than a 60-person office. */
export function markerSizeClass(headcount: number): string {
  if (headcount >= 300) return 'size-5'
  if (headcount >= 150) return 'size-4'
  if (headcount >= 80) return 'size-3.5'
  return 'size-3'
}

/** [[west, south], [east, north]] in [lng, lat] around the given offices — feeds LeafletMap.fitBounds. */
export function officeBounds(list: OfficeLocation[]): [[number, number], [number, number]] | null {
  if (!list.length) return null
  const lngs = list.map(o => o.lngLat[0])
  const lats = list.map(o => o.lngLat[1])
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]]
}

/**
 * Curved path between two [lng, lat] points: a quadratic Bézier whose control
 * point sits off the midpoint, perpendicular to the chord. Always bows
 * northward so HQ links read as one family of arcs.
 */
export function arcPath(from: [number, number], to: [number, number], bend = 0.2, segments = 32): [number, number][] {
  const [x1, y1] = from
  const [x2, y2] = to
  const dx = x2 - x1
  const dy = y2 - y1
  // Perpendicular to the chord; flip so it points north (positive lat).
  let px = -dy
  let py = dx
  if (py < 0) {
    px = -px
    py = -py
  }
  const cx = (x1 + x2) / 2 + px * bend
  const cy = (y1 + y2) / 2 + py * bend
  return Array.from({ length: segments + 1 }, (_, i) => {
    const t = i / segments
    const u = 1 - t
    return [u * u * x1 + 2 * u * t * cx + t * t * x2, u * u * y1 + 2 * u * t * cy + t * t * y2] as [number, number]
  })
}

/** Current UTC offset for an IANA zone, e.g. `UTC-7` or `UTC+5:30`. */
export function utcOffsetLabel(timeZone: string, at: Date = new Date(), locale = 'en-US'): string {
  const part = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'shortOffset' })
    .formatToParts(at)
    .find(p => p.type === 'timeZoneName')?.value ?? 'GMT'
  return part === 'GMT' ? 'UTC+0' : part.replace('GMT', 'UTC')
}

/** 24-hour wall-clock time in an IANA zone, e.g. `08:23`. */
export function timeInZone(timeZone: string, at: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(at)
}
