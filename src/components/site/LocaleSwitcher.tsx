'use client'

import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/supabase/types'
import { setLocale } from '@/lib/i18n/actions'

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-2 text-sm">
      {(['tr', 'en'] as const).map((target) => (
        <form key={target} action={setLocale}>
          <input type="hidden" name="locale" value={target} />
          <input type="hidden" name="path" value={pathname} />
          <button
            type="submit"
            className={
              locale === target
                ? 'font-semibold text-primary'
                : 'text-neutral-400 hover:text-body-text'
            }
            aria-current={locale === target}
          >
            {target === 'tr' ? 'TR' : 'EN'}
          </button>
        </form>
      ))}
    </div>
  )
}
