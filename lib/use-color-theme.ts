'use client'

import * as React from 'react'
import { COLOR_THEME_DEFAULT, COLOR_THEME_IDS, RADIUS_DEFAULT, RADIUS_OPTIONS } from './color-themes'

const THEME_KEY = 'uipkge-color-theme'
const RADIUS_KEY = 'uipkge-radius'

function readStorage(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function applyToDocument(theme: string, radius: string) {
  const root = document.documentElement
  if (theme === COLOR_THEME_DEFAULT) root.removeAttribute('data-color-theme')
  else root.setAttribute('data-color-theme', theme)
  root.style.setProperty('--radius', `${radius}rem`)
  try {
    document.cookie = `uipkge-theme=${encodeURIComponent(theme)}; path=/; max-age=31536000; samesite=lax`
  } catch {
    // cookie write is best-effort (SSR preview, sandboxed iframe)
  }
}

/**
 * Colour theme + corner radius for the whole app (header theme customiser).
 * Port of Nuxt `useColorTheme` (cookie-backed) adapted to Next.js:
 * next-themes still owns light/dark; this hook owns `data-color-theme`
 * + `--radius` on <html>, persisted in localStorage (+ mirror cookie
 * `uipkge-theme` for SSR first-paint if a server layout ever reads it).
 */
export function useColorTheme() {
  const [colorTheme, setColorTheme] = React.useState<string>(() =>
    readStorage(THEME_KEY, COLOR_THEME_DEFAULT),
  )
  const [radius, setRadius] = React.useState<string>(() => readStorage(RADIUS_KEY, RADIUS_DEFAULT))

  React.useEffect(() => {
    const stored = readStorage(THEME_KEY, COLOR_THEME_DEFAULT)
    if (COLOR_THEME_IDS.has(stored)) setColorTheme(stored)
    const r = readStorage(RADIUS_KEY, RADIUS_DEFAULT)
    if ((RADIUS_OPTIONS as readonly string[]).includes(r)) setRadius(r)
  }, [])

  React.useEffect(() => {
    applyToDocument(
      COLOR_THEME_IDS.has(colorTheme) ? colorTheme : COLOR_THEME_DEFAULT,
      (RADIUS_OPTIONS as readonly string[]).includes(radius) ? radius : RADIUS_DEFAULT,
    )
    try {
      window.localStorage.setItem(THEME_KEY, colorTheme)
      window.localStorage.setItem(RADIUS_KEY, radius)
    } catch {
      // private mode — theme still applies for this session
    }
  }, [colorTheme, radius])

  const reset = React.useCallback(() => {
    setColorTheme(COLOR_THEME_DEFAULT)
    setRadius(RADIUS_DEFAULT)
  }, [])

  return { colorTheme, setColorTheme, radius, setRadius, reset }
}
