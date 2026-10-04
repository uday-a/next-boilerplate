'use client'

import * as React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { InstallCommand } from '@/components/blocks/InstallCommand'
import { categoryKey, type CatalogEntry } from '@/lib/ui-catalog/catalog'

export interface UsedInLink {
  label: string
  /** Absent for layouts, the app shell and dynamic routes. */
  href?: string
}

const STATUS_VARIANT = { installed: 'success', 'demo-only': 'warning', available: 'outline' } as const
const STATUS_KEY = { installed: 'installed', 'demo-only': 'demoOnly', available: 'available' } as const
const USED_IN_LIMIT = 8

function DemoSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-2" aria-label={label}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-16 w-full" />
    </div>
  )
}

/**
 * One registry item card: demo slot, used-in links, install command.
 * Port of Nuxt `CatalogCard.vue`. The demo (a lazy component) mounts the
 * first time the card scrolls near the viewport, so heavy demos (leaflet,
 * tiptap, echarts) stay out of the initial page JS.
 */
export function CatalogCard({
  entry,
  demo: Demo,
  usedIn = [],
}: {
  entry: CatalogEntry
  demo?: React.ComponentType
  usedIn?: UsedInLink[]
}) {
  const t = useTranslations()
  const [showAllUsage, setShowAllUsage] = React.useState(false)
  const visibleUsedIn = showAllUsage ? usedIn : usedIn.slice(0, USED_IN_LIMIT)
  const isInstalled = entry.status !== 'available'

  const demoRef = React.useRef<HTMLDivElement>(null)
  const [demoVisible, setDemoVisible] = React.useState(false)
  React.useEffect(() => {
    const el = demoRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([hit]) => {
        if (hit?.isIntersecting) {
          setDemoVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Card id={entry.name} className="scroll-mt-20">
      <CardHeader className="gap-2 space-y-0 p-4 pb-0">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">
            <a href={`#${entry.name}`} className="focus-visible:ring-ring rounded-sm hover:underline focus-visible:ring-2 focus-visible:outline-none">
              {entry.title}
            </a>
          </CardTitle>
          <code className="text-muted-foreground font-mono text-xs">{entry.name}</code>
          <div className="ml-auto flex items-center gap-1.5">
            <Badge variant="secondary">{t(`uiKit.category.${categoryKey(entry.category)}`)}</Badge>
            <Badge variant={STATUS_VARIANT[entry.status]}>{t(`uiKit.status.${STATUS_KEY[entry.status]}`)}</Badge>
          </div>
        </div>
        <CardDescription className="text-sm">{entry.whenToUse ?? entry.description}</CardDescription>
        {entry.whenToUse && entry.description ? (
          <p className="text-muted-foreground line-clamp-2 text-xs">{entry.description}</p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {Demo ? (
          <div ref={demoRef} className="bg-background min-h-24 rounded-lg border p-4" role="group" aria-label={t('uiKit.card.demo')}>
            {demoVisible ? (
              <React.Suspense fallback={<DemoSkeleton label={t('uiKit.card.loadingDemo')} />}>
                <Demo />
              </React.Suspense>
            ) : (
              <DemoSkeleton label={t('uiKit.card.loadingDemo')} />
            )}
          </div>
        ) : null}

        {entry.partOf ? (
          <p className="text-muted-foreground text-xs">
            <a href={`#${entry.partOf}`} className="text-foreground underline-offset-4 hover:underline">
              {t('uiKit.card.partOf')}
            </a>
          </p>
        ) : null}

        {isInstalled ? (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{t('uiKit.card.usedIn')}</p>
            {!usedIn.length ? (
              <p className="text-muted-foreground text-xs">{t('uiKit.card.notUsed')}</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {visibleUsedIn.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="hover:bg-accent focus-visible:ring-ring inline-flex rounded-md border px-2 py-0.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground inline-flex rounded-md border border-dashed px-2 py-0.5 text-xs">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
                {usedIn.length > USED_IN_LIMIT && !showAllUsage ? (
                  <li>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex rounded-md px-2 py-0.5 text-xs tabular-nums focus-visible:ring-2 focus-visible:outline-none"
                      onClick={() => setShowAllUsage(true)}
                    >
                      +{usedIn.length - USED_IN_LIMIT}
                    </button>
                  </li>
                ) : null}
              </ul>
            )}
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            {entry.installCmd ? t('uiKit.card.install') : t('uiKit.card.source')}
          </p>
          {entry.installCmd ? (
            <InstallCommand command={entry.installCmd} />
          ) : (
            <p className="text-muted-foreground text-xs">
              {t('uiKit.card.localBlock')} <code className="font-mono break-all">components/blocks/{entry.file}</code>
            </p>
          )}
        </div>
      </CardContent>

      {entry.docsUrl ? (
        <CardFooter className="p-4 pt-0">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-2">
            <a href={entry.docsUrl} target="_blank" rel="noopener">
              {t('uiKit.card.docs')}
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
