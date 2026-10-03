// Pure OTA merge helper (no server imports — safe for unit tests and the
// client bundle). next-intl stays the only t() system; i18now is purely
// the delivery layer (see server/utils/i18now.ts).

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Deep-merge OTA over local (objects recurse, everything else replaced). */
export function mergeMessages(
  local: Record<string, unknown>,
  ota: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...local }
  for (const [key, value] of Object.entries(ota)) {
    const base = out[key]
    out[key] = isPlainObject(base) && isPlainObject(value) ? mergeMessages(base, value) : value
  }
  return out
}
