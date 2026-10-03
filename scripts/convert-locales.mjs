/**
 * One-off converter: Nuxt vue-i18n dictionaries -> next-intl ICU dictionaries.
 *
 * - Copies `en.json` / `es.json` from the Nuxt reference locales dir
 *   (default: sibling checkout `../nuxt-boilerplate/i18n/locales`) into
 *   `messages/` for next-intl.
 * - Converts vue-i18n pipe plurals (`"a | b | {n} c"`) to ICU plurals
 *   (`"{n, plural, =0 {a} =1 {b} other {# c}}"`) for every pipe key.
 * - Unescapes vue-i18n `{'@'}` linked-message syntax to plain `@`
 *   (stock ICU needs no escaping).
 * - Verifies zero remaining ` | ` plural pipes afterwards.
 *
 * Run: `node scripts/convert-locales.mjs [path/to/nuxt-boilerplate/i18n/locales]`
 * Idempotent: re-running overwrites messages/en.json + messages/es.json.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const nuxtLocales = process.argv[2]
  ? resolve(process.argv[2])
  : join(root, '..', 'nuxt-boilerplate', 'i18n', 'locales')
if (!existsSync(join(nuxtLocales, 'en.json'))) {
  console.error(`No en.json in ${nuxtLocales}`)
  console.error('Usage: node scripts/convert-locales.mjs [path/to/nuxt-boilerplate/i18n/locales]')
  process.exit(1)
}

function convertValue(value) {
  if (typeof value !== 'string') return { value, converted: false }
  let out = value
  // vue-i18n `{'@'}` -> plain `@` (ICU has no linked-message syntax).
  out = out.replaceAll("{'@'}", '@')
  // Pipe plural: exactly two ` | ` separators, third segment holds {var}.
  const parts = out.split(' | ')
  if (parts.length === 3) {
    const varMatch = parts[2].match(/\{(\w+)\}/)
    if (varMatch) {
      const varName = varMatch[1]
      const other = parts[2].replaceAll(`{${varName}}`, '#')
      out = `{${varName}, plural, =0 {${parts[0]}} =1 {${parts[1]}} other {${other}}}`
      return { value: out, converted: true }
    }
  }
  return { value: out, converted: out !== value }
}

function convertTree(node, convertedKeys, path = '') {
  if (typeof node === 'string') {
    const { value, converted } = convertValue(node)
    if (converted && path.includes(' | '))
      throw new Error(`unexpected pipe in key path ${path}`)
    if (converted && value.includes(' | ')) {
      // Only the 6 known plural keys should have converted; anything else
      // with a surviving pipe is a literal that needs manual review.
      convertedKeys.push(path)
    } else if (value.includes('{n, plural') || value.includes('{count, plural')) {
      convertedKeys.push(path)
    }
    return value
  }
  if (Array.isArray(node)) return node.map((v, i) => convertTree(v, convertedKeys, `${path}[${i}]`))
  if (node && typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node).map(([k, v]) => [k, convertTree(v, convertedKeys, path ? `${path}.${k}` : k)]),
    )
  }
  return node
}

const converted = {}
for (const locale of ['en', 'es']) {
  const src = JSON.parse(readFileSync(join(nuxtLocales, `${locale}.json`), 'utf8'))
  const keys = []
  const out = convertTree(src, keys)
  const text = `${JSON.stringify(out, null, 2)}\n`
  if (text.includes(' | ')) {
    const lines = text.split('\n').filter((l) => l.includes(' | '))
    throw new Error(`remaining " | " pipes in ${locale}.json:\n${lines.join('\n')}`)
  }
  if (text.includes("{'@'}")) throw new Error(`remaining {'@'} escapes in ${locale}.json`)
  mkdirSync(join(root, 'messages'), { recursive: true })
  writeFileSync(join(root, 'messages', `${locale}.json`), text)
  converted[locale] = keys
  console.log(`messages/${locale}.json: ${keys.length} ICU plurals`)
  for (const k of keys) console.log(`  - ${k}`)
}
