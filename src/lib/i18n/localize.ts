import type { Locale } from '@/lib/supabase/types'

export function localize(tr: string, en: string, locale: Locale): string {
  return locale === 'en' && en.trim().length > 0 ? en : tr
}
