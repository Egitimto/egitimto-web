'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LOCALE_COOKIE } from './locale'

export async function setLocale(formData: FormData) {
  const locale = formData.get('locale') === 'en' ? 'en' : 'tr'
  const path = String(formData.get('path') ?? '/')

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  redirect(path)
}
