import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ETIK_SECTIONS } from '@/content/legal'

export default async function EtikIlkelerPage() {
  const locale = await getLocale()
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading title={localize('Etik İlkeler', 'Ethical Principles', locale)} />
      <div className="space-y-8">
        {ETIK_SECTIONS.map((section) => (
          <section key={section.title_tr}>
            <h2 className="font-display text-lg font-bold text-dark">
              {localize(section.title_tr, section.title_en, locale)}
            </h2>
            <p className="mt-2 whitespace-pre-line text-body-text">
              {localize(section.body_tr, section.body_en, locale)}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}
