'use client'

import { Briefcase, CalendarDays, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { kindBadgeVariant, kindDotBg, utcOffsetLabel, type OfficeLocation } from '@/lib/locations'
import { useLocale, useTranslations } from 'next-intl'

/**
 * Popup card for an office marker. Port of Nuxt `OfficePopup.vue`.
 * Uses divs, not <p>: Leaflet's stylesheet gives `.leaflet-popup-content p`
 * 17px margins, which breaks the layout.
 * Used by the dashboard "Customers by region" map.
 */
export function OfficePopup({ office, localTime }: { office: OfficeLocation; localTime?: string | null }) {
  const locale = useLocale()
  const t = useTranslations()
  const initials = office.lead.split(' ').map((n) => n[0]).join('')

  return (
    <div className="w-60">
      <div className="flex items-start justify-between gap-3 pr-5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`size-2 shrink-0 rounded-full ${kindDotBg(office.kind)}`} aria-hidden="true" />
            <span className="truncate text-sm font-semibold">{office.city}</span>
          </div>
          <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
            <span className="truncate">{office.country}</span>
            {localTime ? (
              <>
                <span aria-hidden="true">·</span>
                <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">{localTime}</span>
              </>
            ) : null}
          </div>
        </div>
        <Badge variant={kindBadgeVariant(office.kind)} className="shrink-0">
          {t(`dashboard.locations.kind.${office.kind}`)}
        </Badge>
      </div>

      <div className="bg-muted/50 mt-3 grid grid-cols-3 divide-x rounded-md border">
        <div className="px-2 py-1.5">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <Users className="size-3.5" aria-hidden="true" />
            {t('dashboard.locations.popup.people')}
          </div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums">{office.headcount}</div>
          <div className="text-success text-xs tabular-nums">+{office.growth}%</div>
        </div>
        <div className="px-2 py-1.5">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <Briefcase className="size-3.5" aria-hidden="true" />
            {t('dashboard.locations.popup.roles')}
          </div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums">{office.openRoles}</div>
          <div className="text-muted-foreground text-xs">{t('dashboard.locations.popup.hiring')}</div>
        </div>
        <div className="px-2 py-1.5">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {t('dashboard.locations.popup.since')}
          </div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums">{office.opened}</div>
          <div className="text-muted-foreground text-xs">{office.timezone ? utcOffsetLabel(office.timezone, new Date(), locale) : ''}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
          {initials}
        </span>
        <div className="min-w-0 text-xs">
          <div className="truncate font-medium" title={office.lead}>{office.lead}</div>
          <div className="text-muted-foreground">{t('dashboard.locations.popup.lead')}</div>
        </div>
      </div>
    </div>
  )
}
