import { cn } from '@/lib/utils'

/** 2×2 tile mark from uipkge.dev — scales into sidebar tiles and headers. */
export function UipkgeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-full', className)} aria-hidden="true">
      <rect x="0.5" y="0.5" width="31" height="31" rx="7" className="fill-card stroke-border" strokeWidth="1" />
      <rect x="6" y="6" width="8" height="8" rx="1.6" className="fill-foreground" />
      <rect x="18" y="6" width="8" height="8" rx="1.6" className="fill-primary" />
      <rect x="6" y="18" width="8" height="8" rx="1.6" className="fill-muted-foreground/35" />
      <rect x="18" y="18" width="8" height="8" rx="1.6" className="fill-foreground" />
    </svg>
  )
}

export function UipkgeWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center text-sm font-bold tracking-tight', className)}>
      UIPKGE
    </span>
  )
}