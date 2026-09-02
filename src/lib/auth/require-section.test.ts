import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./get-current-role', () => ({
  getCurrentRole: vi.fn().mockResolvedValue('moderator'),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

import { redirect } from 'next/navigation'
import { requireSection } from './require-section'

describe('requireSection', () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear()
  })

  it('redirects to /admin when the role cannot access the section', async () => {
    await requireSection('ekibimiz')
    expect(redirect).toHaveBeenCalledWith('/admin')
  })

  it('does not redirect and returns the role when access is allowed', async () => {
    const role = await requireSection('haberler')
    expect(redirect).not.toHaveBeenCalled()
    expect(role).toBe('moderator')
  })
})
