import { describe, it, expect } from 'vitest'
import { canAccessSection } from './roles'

describe('canAccessSection', () => {
  it('allows admin to access every section', () => {
    expect(canAccessSection('admin', 'ekibimiz')).toBe(true)
    expect(canAccessSection('admin', 'haberler')).toBe(true)
  })

  it('allows moderator to access only haberler and etkinlikler', () => {
    expect(canAccessSection('moderator', 'haberler')).toBe(true)
    expect(canAccessSection('moderator', 'etkinlikler')).toBe(true)
    expect(canAccessSection('moderator', 'ekibimiz')).toBe(false)
    expect(canAccessSection('moderator', 'isbirlikleri')).toBe(false)
    expect(canAccessSection('moderator', 'hakkimizda')).toBe(false)
  })

  it('denies access when role is null', () => {
    expect(canAccessSection(null, 'haberler')).toBe(false)
  })
})
