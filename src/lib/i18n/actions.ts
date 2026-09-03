'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LOCALE_COOKIE } from './locale'

function isSafeRelativePath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
}

export async function setLocale(formData: FormData) {
  const locale = formData.get('locale') === 'en' ? 'en' : 'tr'
  const requestedPath = String(formData.get('path') ?? '/')
  const path = isSafeRelativePath(requestedPath) ? requestedPath : '/'

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  redirect(path)
}
