'use client'

import * as React from 'react'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { InstallCommand } from '@/components/blocks/InstallCommand'

export interface CatalogEntry {
  name: string
  title: string
  description: string
  whenToUse?: string
  category: string
  status: 'installed' | 'demo-only' | 'available'
  installCmd?: string
  file?: string
  docsUrl?: string
  partOf?: string
}

const STATUS_VARIANT = { installed: 'success', 'demo-only': 'warning', available: 'outline' } as const

/**
 * One registry item card: demo slot, used-in links, install command.
 * Simplified port of Nuxt `CatalogCard.vue` — the full 40-demo
 * IntersectionObserver lazy-mount is a follow-up; demos render inline here.
 */
export function CatalogCard({
  entry,
  demo,
  usedIn = [],
}: {
  entry: CatalogEntry
  demo?: React.ReactNode
  usedIn?: { label: string; href?: string }[]
}) {
  const [showAllUsage, setShowAllUsage] = React.useState(false)
  const visibleUsedIn = showAllUsage ? usedIn : usedIn.slice(0, 8)
  const isInstalled = entry.status !== 'available'

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
            <Badge variant="secondary">{entry.category}</Badge>
            <Badge variant={STATUS_VARIANT[entry.status]}>{entry.status}</Badge>
          </div>
        </div>
        <CardDescription className="text-sm">{entry.whenToUse ?? entry.description}</CardDescription>
        {entry.whenToUse && entry.description ? (
          <p className="text-muted-foreground line-clamp-2 text-xs">{entry.description}</p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {demo === undefined ? null : (
          <div className="bg-background min-h-24 rounded-lg border p-4" role="group" aria-label={`${entry.title} demo`}>
            <React.Suspense fallback={<div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-16 w-full" /></div>}>
              {demo}
            </React.Suspense>
          </div>
        )}

        {entry.partOf ? (
          <p className="text-muted-foreground text-xs">
            <a href={`#${entry.partOf}`} className="text-foreground underline-offset-4 hover:underline">
              Part of {entry.partOf}
            </a>
          </p>
        ) : null}

        {isInstalled ? (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Used in</p>
            {!usedIn.length ? (
              <p className="text-muted-foreground text-xs">Not used in this app yet.</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {visibleUsedIn.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a href={link.href} className="hover:bg-accent focus-visible:ring-ring inline-flex rounded-md border px-2 py-0.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none">
                        {link.label}
                      </a>
                    ) : (
                      <span className="text-muted-foreground inline-flex rounded-md border border-dashed px-2 py-0.5 text-xs">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
                {usedIn.length > 8 && !showAllUsage ? (
                  <li>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex rounded-md px-2 py-0.5 text-xs tabular-nums focus-visible:ring-2 focus-visible:outline-none"
                      onClick={() => setShowAllUsage(true)}
                    >
                      +{usedIn.length - 8}
                    </button>
                  </li>
                ) : null}
              </ul>
            )}
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            {entry.installCmd ? 'Install' : 'Source'}
          </p>
          {entry.installCmd ? (
            <InstallCommand command={entry.installCmd} />
          ) : (
            <p className="text-muted-foreground text-xs">
              Local block <code className="font-mono">components/blocks/{entry.file}</code>
            </p>
          )}
        </div>
      </CardContent>

      {entry.docsUrl ? (
        <CardFooter className="p-4 pt-0">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-2">
            <a href={entry.docsUrl} target="_blank" rel="noopener">
              Docs
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
