'use client'

import { Check, ChevronDown, Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { locales, setLocaleCookie, type Locale } from '@/lib/i18n'

/**
 * Header control: switch UI language. Persists the choice in the
 * `uipkge-locale` cookie (JS-readable, 1yr, same mechanism as SvelteKit),
 * then `router.refresh()` so server components re-render with the new
 * dictionary. Port of Nuxt `LocaleSwitcher.vue` / SvelteKit
 * `LocaleSwitcher.svelte` — sits next to `ThemeCustomizer` in the dashboard
 * header (Nuxt has it in the header only, so no login-page copy).
 */
export function LocaleSwitcher() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const current = locales.find((o) => o.code === locale)?.name ?? locale

  function switchTo(code: Locale) {
    if (code === locale) return
    setLocaleCookie(code)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-8 max-w-40 gap-1.5 px-2.5 text-xs font-medium"
          aria-label={t('header.language.label')}
          title={t('header.language.label')}
        >
          <Globe className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{current}</span>
          <ChevronDown className="size-3 shrink-0" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
          {t('header.language.label')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((o) => (
          <DropdownMenuItem key={o.code} onSelect={() => switchTo(o.code)}>
            {o.name}
            {o.code === locale ? <Check className="ml-auto size-4" aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
