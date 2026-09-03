import type { Role } from '@/lib/supabase/types'

export type AdminSection =
  | 'haberler'
  | 'etkinlikler'
  | 'ekibimiz'
  | 'isbirlikleri'
  | 'hakkimizda'
  | 'belgeler'
  | 'mesajlar'

const MODERATOR_SECTIONS: AdminSection[] = ['haberler', 'etkinlikler']

export function canAccessSection(role: Role | null, section: AdminSection): boolean {
  if (role === 'admin') return true
  if (role === 'moderator') return MODERATOR_SECTIONS.includes(section)
  return false
}
