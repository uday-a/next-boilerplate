'use client'

import { LeafletMap, LeafletMarker, LeafletPopup } from '@/components/ui/leaflet-map'

const offices: { city: string; lngLat: [number, number] }[] = [
  { city: 'New York', lngLat: [-74.006, 40.7128] },
  { city: 'London', lngLat: [-0.1276, 51.5072] },
  { city: 'Berlin', lngLat: [13.405, 52.52] },
]
// Module-level so the map's [center, zoom] effect doesn't re-run every render.
const center: [number, number] = [-30, 45]
const popupOffset: [number, number] = [0, -10]

export default function LeafletMapDemo() {
  return (
    <LeafletMap
      variant="muted"
      center={center}
      zoom={1.6}
      minZoom={1.4}
      scrollWheelZoom={false}
      navigation={false}
      className="h-56 w-full overflow-hidden rounded-lg border"
    >
      {offices.map(office => (
        <LeafletMarker key={office.city} lngLat={office.lngLat} anchor="center">
          <span className="bg-primary ring-primary/20 block size-3.5 rounded-full ring-4" />
          <LeafletPopup offset={popupOffset}>
            <p className="text-foreground text-sm font-semibold">{office.city}</p>
          </LeafletPopup>
        </LeafletMarker>
      ))}
    </LeafletMap>
  )
}
