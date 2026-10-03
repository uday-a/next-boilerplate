import { describe, expect, it } from 'vitest'
import { mergeMessages } from './i18now-merge'

describe('mergeMessages', () => {
  it('lets OTA override local leaf strings', () => {
    expect(mergeMessages({ a: 'local', b: 'keep' }, { a: 'ota' })).toEqual({ a: 'ota', b: 'keep' })
  })

  it('recurses into nested objects instead of replacing them', () => {
    expect(mergeMessages({ nav: { home: 'Home', about: 'About' } }, { nav: { home: 'Inicio' } })).toEqual({
      nav: { home: 'Inicio', about: 'About' },
    })
  })

  it('replaces arrays wholesale (no index merging)', () => {
    expect(mergeMessages({ list: [1, 2] }, { list: [3] })).toEqual({ list: [3] })
  })

  it('adds OTA-only keys', () => {
    expect(mergeMessages({}, { fresh: { key: 'nuevo' } })).toEqual({ fresh: { key: 'nuevo' } })
  })
})
