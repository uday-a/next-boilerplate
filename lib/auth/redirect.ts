export const DEFAULT_AUTH_REDIRECT = '/dashboard'

export function safeRedirectPath(value: string | null | undefined, fallback = DEFAULT_AUTH_REDIRECT) {
  const candidate = value?.trim()
  if (!candidate) return fallback
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) return fallback

  try {
    const url = new URL(candidate, 'https://uipkge.local')
    if (url.origin !== 'https://uipkge.local') return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
