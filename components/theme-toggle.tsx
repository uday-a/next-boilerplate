'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/use-theme'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="border-border bg-card inline-flex items-center gap-0.5 rounded-md border p-0.5">
      {(
        [
          ['light', Sun, 'Light'],
          ['dark', Moon, 'Dark'],
          ['system', Monitor, 'System'],
        ] as const
      ).map(([value, Icon, label]) => (
        <Button
          key={value}
          type="button"
          variant={theme === value ? 'default' : 'ghost'}
          size="icon-sm"
          aria-label={label}
          onClick={() => setTheme(value)}
        >
          <Icon className="size-4" aria-hidden="true" />
        </Button>
      ))}
    </div>
  )
}