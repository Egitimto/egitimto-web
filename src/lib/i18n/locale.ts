import { cookies } from 'next/headers'
import type { Locale } from '@/lib/supabase/types'

export const LOCALE_COOKIE = 'egitimto_locale'
export const DEFAULT_LOCALE: Locale = 'tr'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE)?.value
  return value === 'en' ? 'en' : DEFAULT_LOCALE
}
