import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('converts Turkish characters to ASCII and lowercases', () => {
    expect(slugify('İlk Bültenimiz Yayınlandı')).toBe('ilk-bultenimiz-yayinlandi')
  })

  it('replaces non-alphanumeric characters with hyphens', () => {
    expect(slugify('Deneme Etkinlik!')).toBe('deneme-etkinlik')
  })

  it('collapses multiple separators and trims leading/trailing hyphens', () => {
    expect(slugify('  Boşluklu   Başlık  ')).toBe('bosluklu-baslik')
  })
})
