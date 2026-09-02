import { describe, it, expect } from 'vitest'
import { localize } from './localize'

describe('localize', () => {
  it('returns the Turkish value when locale is tr', () => {
    expect(localize('Merhaba', 'Hello', 'tr')).toBe('Merhaba')
  })

  it('returns the English value when locale is en', () => {
    expect(localize('Merhaba', 'Hello', 'en')).toBe('Hello')
  })

  it('falls back to Turkish when the English value is empty', () => {
    expect(localize('Merhaba', '', 'en')).toBe('Merhaba')
  })
})
