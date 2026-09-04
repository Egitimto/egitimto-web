'use client'

import { useActionState } from 'react'
import { submitContactForm } from './actions'
import { localize } from '@/lib/i18n/localize'
import type { Locale } from '@/lib/supabase/types'

const SUBJECTS: { tr: string; en: string }[] = [
  { tr: 'Genel Bilgi', en: 'General Information' },
  { tr: 'Projeler', en: 'Projects' },
  { tr: 'Eğitim Programları', en: 'Educational Programs' },
  { tr: 'Gönüllülük', en: 'Volunteer Cooperation' },
  { tr: 'İşbirliği', en: 'Partnership' },
  { tr: 'Kişisel Verilerimin Silinmesi', en: 'Deletion of My Personal Data' },
  { tr: 'Diğer', en: 'Other' },
]

export function ContactForm({ locale, defaultSubject }: { locale: Locale; defaultSubject?: string }) {
  const [state, formAction, pending] = useActionState(submitContactForm, { success: false })

  return (
    <form action={formAction} className="space-y-4">
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 0, height: 0, overflow: 'hidden' }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-body-text">
          {localize('Adınız Soyadınız', 'Your Full Name', locale)}
        </label>
        <input id="fullName" name="fullName" required maxLength={200} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-body-text">
          {localize('E-posta Adresi', 'Email Address', locale)}
        </label>
        <input id="email" name="email" type="email" required maxLength={254} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-body-text">
          {localize('Konu', 'Subject', locale)}
        </label>
        <select
          id="subject"
          name="subject"
          required
          defaultValue={defaultSubject}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
        >
          {SUBJECTS.map((subject) => (
            <option key={subject.tr} value={locale === 'en' ? subject.en : subject.tr}>
              {localize(subject.tr, subject.en, locale)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-body-text">
          {localize('Mesajınız', 'Your Message', locale)}
        </label>
        <textarea id="message" name="message" required rows={5} maxLength={5000} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
      </div>
      <label className="flex items-start gap-2 text-sm text-body-text">
        <input type="checkbox" required className="mt-1" />
        {localize(
          "KVKK ve Gizlilik Politikası'nı okudum ve kabul ediyorum.",
          'I have read and accept the KVKK (Turkish Data Protection Law) and Privacy Policy.',
          locale
        )}
      </label>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {localize(
            'Mesajınız için teşekkür ederiz, en kısa sürede size dönüş yapacağız.',
            'Thank you for your message, we will get back to you as soon as possible.',
            locale
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="gradient-primary w-full rounded-full px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {pending
          ? localize('Gönderiliyor...', 'Sending...', locale)
          : localize('Gönder', 'Send', locale)}
      </button>
    </form>
  )
}
