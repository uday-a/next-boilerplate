'use client'

import { ChevronDown, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

/**
 * Design-token reference panel. Port of Nuxt `FoundationsPanel.vue` —
 * swatch classes resolve to theme CSS variables, so they follow light/dark.
 * Collapsed by default: search is the page's main job.
 */
export function FoundationsPanel() {
  const t = useTranslations()
  const colourGroups = [
    {
      key: 'neutrals',
      swatches: [
        { token: 'background', class: 'bg-background' },
        { token: 'card', class: 'bg-card' },
        { token: 'muted', class: 'bg-muted' },
        { token: 'accent', class: 'bg-accent' },
        { token: 'border', class: 'bg-border' },
        { token: 'muted-foreground', class: 'bg-muted-foreground' },
        { token: 'foreground', class: 'bg-foreground' },
      ],
    },
    {
      key: 'primary',
      swatches: [
        { token: 'primary', class: 'bg-primary' },
        { token: 'primary-foreground', class: 'bg-primary-foreground' },
        { token: 'ring', class: 'bg-ring' },
      ],
    },
    {
      key: 'status',
      swatches: [
        { token: 'success', class: 'bg-success' },
        { token: 'warning', class: 'bg-warning' },
        { token: 'info', class: 'bg-info' },
        { token: 'destructive', class: 'bg-destructive' },
      ],
    },
    {
      key: 'chart',
      swatches: [
        { token: 'chart-1', class: 'bg-chart-1' },
        { token: 'chart-2', class: 'bg-chart-2' },
        { token: 'chart-3', class: 'bg-chart-3' },
        { token: 'chart-4', class: 'bg-chart-4' },
        { token: 'chart-5', class: 'bg-chart-5' },
      ],
    },
  ]

  const typeRoles = [
    { key: 'h1', classes: 'text-2xl font-semibold tracking-tight', sample: 'Projects' },
    { key: 'cardTitle', classes: 'text-base font-semibold', sample: 'Monthly revenue' },
    { key: 'body', classes: 'text-sm', sample: 'Invoices are sent on the 1st.' },
    { key: 'meta', classes: 'text-xs text-muted-foreground', sample: 'Updated 2 min ago' },
    { key: 'eyebrow', classes: 'text-xs font-medium uppercase tracking-wider text-muted-foreground', sample: 'Active users' },
    { key: 'metric', classes: 'text-2xl font-semibold tracking-tight tabular-nums', sample: '$84,230' },
  ]

  const iconUses = [
    { token: 'size-3.5', class: 'size-3.5', key: 'xs' },
    { token: 'size-4', class: 'size-4', key: 'sm' },
    { token: 'size-5', class: 'size-5', key: 'box' },
    { token: 'size-10', class: 'size-10', key: 'empty' },
  ]

  return (
    <Collapsible>
      <Card>
        <CollapsibleTrigger className="hover:bg-muted/50 focus-visible:ring-ring w-full rounded-[inherit] text-left transition-colors focus-visible:ring-2 focus-visible:outline-none">
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 p-4">
            <div className="space-y-1">
              <CardTitle className="text-base">{t('uiKit.foundations.title')}</CardTitle>
              <CardDescription>{t('uiKit.foundations.description')}</CardDescription>
            </div>
            <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180" aria-hidden="true" />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 p-4 pt-0">
            <section className="space-y-2">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{t('uiKit.foundations.colour')}</h3>
              <p className="text-muted-foreground max-w-3xl text-xs">{t('uiKit.foundations.colourRule')}</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {colourGroups.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <p className="text-xs font-medium">{t(`uiKit.foundations.${group.key}`)}</p>
                    <ul className="flex flex-wrap gap-2">
                      {group.swatches.map((s) => (
                        <li key={s.token} className="flex w-20 flex-col gap-1">
                          <span className={cn('h-8 w-full rounded-md border', s.class)} aria-hidden="true" />
                          <code className="text-muted-foreground font-mono text-xs">{s.token}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{t('uiKit.foundations.type')}</h3>
              <ul className="space-y-2">
                {typeRoles.map((role) => (
                  <li key={role.key} className="flex items-baseline justify-between gap-2">
                    <span className={cn('truncate', role.classes)}>{role.sample}</span>
                    <span className="text-muted-foreground shrink-0 text-xs">{t(`uiKit.foundations.roles.${role.key}`)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{t('uiKit.foundations.icons')}</h3>
              <ul className="space-y-1.5">
                {iconUses.map((i) => (
                  <li key={i.token} className="flex items-center gap-2 text-xs">
                    <span className="flex w-10 shrink-0 justify-center">
                      <Star className={i.class} aria-hidden="true" />
                    </span>
                    <code className="font-mono">{i.token}</code>
                    <span className="text-muted-foreground ml-auto">{t(`uiKit.foundations.iconUses.${i.key}`)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
