'use client'

import { ThemeSwitch } from '@/components/ui/theme-switch'

// Static previews: a no-op onValueChange keeps clicks from changing the app theme
// (the Vue demo binds a fixed model-value with no listener).
const noop = () => {}

export default function ThemeSwitchDemo() {
  return (
    <div className="space-y-4">
      <ThemeSwitch value="light" onValueChange={noop} variant="cards" />
      <div className="flex flex-wrap items-center gap-4">
        <ThemeSwitch value="dark" onValueChange={noop} variant="icons" />
        <ThemeSwitch value="system" onValueChange={noop} variant="pill" />
      </div>
    </div>
  )
}
