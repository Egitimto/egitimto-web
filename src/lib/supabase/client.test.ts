import { describe, it, expect, vi, afterEach } from 'vitest'

describe('createClient (browser)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('creates a Supabase client without throwing when env vars are present', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

    const { createClient } = await import('./client')
    expect(() => createClient()).not.toThrow()
  })
})
