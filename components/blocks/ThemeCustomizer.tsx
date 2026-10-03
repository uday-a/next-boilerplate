'use client'

import { Check, Monitor, Moon, Palette, RotateCcw, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { COLOR_THEMES } from '@/lib/color-themes'
import { RADIUS_OPTIONS } from '@/lib/color-themes'
import { useColorTheme } from '@/lib/use-color-theme'
import { cn } from '@/lib/utils'

/**
 * Header "Customize" panel — port of Nuxt `ThemeCustomizer.vue`
 * (itself a port of the uipkge.dev site customiser): primary colour,
 * corner radius and colour mode, with a reset.
 * Icon-pack switching is Nuxt-only (generated icon-pack layer) — skipped here.
 */
export function ThemeCustomizer() {
  const { colorTheme, setColorTheme, radius, setRadius, reset } = useColorTheme()
  const { theme, setTheme } = useTheme()
  const t = useTranslations()

  const MODES = [
    { id: 'light', icon: Sun },
    { id: 'dark', icon: Moon },
    { id: 'system', icon: Monitor },
  ] as const

  function resetAll() {
    reset()
    setTheme('system')
  }

  const optionClass = (on: boolean) =>
    cn(
      'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 rounded-md border text-xs font-medium transition-colors outline-none focus-visible:ring-[3px]',
      on ? 'border-primary bg-secondary text-secondary-foreground' : 'border-border',
    )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-8"
          aria-label={t('header.theme.aria')}
          title={t('header.theme.aria')}
        >
          <Palette className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(calc(100vw-2rem),22rem)] p-4">
        <div className="mb-4 border-b pb-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold">{t('header.theme.title')}</span>
            <span className="text-muted-foreground text-xs">{t('header.theme.saved')}</span>
          </div>
          <div className="text-muted-foreground mt-0.5 truncate text-xs">{t('header.theme.hint')}</div>
        </div>

        <div className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold">{t('header.theme.primary')}</legend>
            <div className="grid grid-cols-3 gap-1.5">
              {COLOR_THEMES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={colorTheme === c.id}
                  className={cn(optionClass(colorTheme === c.id), 'flex items-center gap-2 px-2 py-1.5 text-left', colorTheme !== c.id && 'border-transparent')}
                  onClick={() => setColorTheme(c.id)}
                >
                  <span
                    className="ring-border/60 relative flex size-3.5 shrink-0 items-center justify-center rounded-full ring-1 ring-inset"
                    style={{ background: c.swatch }}
                  >
                    {colorTheme === c.id ? <Check className="size-2.5 text-white" strokeWidth={4} aria-hidden="true" /> : null}
                  </span>
                  <span className="truncate capitalize">{t(`header.theme.names.${c.id}`)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold">{t('header.theme.radius')}</legend>
            <div className="grid grid-cols-5 gap-1.5">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={radius === r}
                  className={cn(optionClass(radius === r), 'px-1 py-1.5')}
                  onClick={() => setRadius(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold">{t('header.theme.mode')}</legend>
            <div className="grid grid-cols-3 gap-1.5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={theme === m.id}
                  className={cn(optionClass(theme === m.id), 'flex items-center justify-center gap-1.5 px-2 py-1.5')}
                  onClick={() => setTheme(m.id)}
                >
                  <m.icon className="size-3.5" aria-hidden="true" />
                  {t(`header.theme.modes.${m.id}`)}
                </button>
              ))}
            </div>
          </fieldset>

          <Button variant="outline" size="sm" className="text-muted-foreground w-full gap-2 text-xs" onClick={resetAll}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {t('header.theme.reset')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
