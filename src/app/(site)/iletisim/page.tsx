import { getLocale } from '@/lib/i18n/locale'
import { ContactForm } from './ContactForm'
import { CONTACT_INFO } from '@/content/contact-info'
import { localize } from '@/lib/i18n/localize'

export default async function IletisimPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>
}) {
  const locale = await getLocale()
  const { subject } = await searchParams

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 py-16 sm:grid-cols-2">
      <div>
        <h1 className="font-display text-3xl font-bold text-dark">{localize('İletişim', 'Contact', locale)}</h1>
        <p className="mt-4 text-body-text">
          {localize(
            'Bizimle iletişime geçin, sorularınızı yanıtlayalım ve eğitimde birlikte fark yaratalım.',
            'Get in touch with us, let us answer your questions and make a difference in education together.',
            locale
          )}
        </p>
        <dl className="mt-8 space-y-4 text-sm text-body-text">
          <div>
            <dt className="font-semibold text-dark">{localize('Adres', 'Address', locale)}</dt>
            <dd>{CONTACT_INFO.address}</dd>
          </div>
          <div>
            <dt className="font-semibold text-dark">{localize('E-posta', 'Email', locale)}</dt>
            <dd>{CONTACT_INFO.email}</dd>
          </div>
          <div>
            <dt className="font-semibold text-dark">{localize('Çalışma Saatleri', 'Working Hours', locale)}</dt>
            <dd>{localize(CONTACT_INFO.hours.tr, CONTACT_INFO.hours.en, locale)}</dd>
          </div>
        </dl>
      </div>
      <ContactForm locale={locale} defaultSubject={subject} />
    </div>
  )
}
