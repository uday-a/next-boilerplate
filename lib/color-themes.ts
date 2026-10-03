// Header theme customiser presets — the same set as the uipkge.dev site
// (apps/astro-site/src/lib/color-themes.ts). Token values live in
// assets/css/color-themes.css, applied as <html data-color-theme="id">.
// 'default' clears the attribute (plain neutral tokens).

export interface ColorThemeMeta {
  id: string
  label: string
  /** Swatch dot colour in the picker (light-mode brand colour). */
  swatch: string
}

export const COLOR_THEME_DEFAULT = 'default'

export const COLOR_THEMES: ColorThemeMeta[] = [
  { id: 'default', label: 'Default', swatch: '#171717' },
  { id: 'blue', label: 'Blue', swatch: '#1A73E8' },
  { id: 'indigo', label: 'Indigo', swatch: '#3F51B5' },
  { id: 'violet', label: 'Violet', swatch: '#7C3AED' },
  { id: 'purple', label: 'Purple', swatch: '#9C27B0' },
  { id: 'rose', label: 'Rose', swatch: '#E11D48' },
  { id: 'orange', label: 'Orange', swatch: '#EA580C' },
  { id: 'amber', label: 'Amber', swatch: '#D97706' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
  { id: 'teal', label: 'Teal', swatch: '#0D9488' },
  { id: 'cyan', label: 'Cyan', swatch: '#0891B2' },
  { id: 'sky', label: 'Sky', swatch: '#0284C7' },
  { id: 'slate', label: 'Slate', swatch: '#475569' },
]

export const COLOR_THEME_IDS = new Set(COLOR_THEMES.map(t => t.id))

export const RADIUS_DEFAULT = '0.3'
export const RADIUS_OPTIONS = ['0', '0.25', '0.3', '0.5', '0.75'] as const
