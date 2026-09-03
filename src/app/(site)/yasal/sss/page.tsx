import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SSS_CATEGORIES } from '@/content/legal'

export default async function SssPage() {
  const locale = await getLocale()
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading title={localize('Sıkça Sorulan Sorular', 'FAQ', locale)} />
      <div className="space-y-10">
        {SSS_CATEGORIES.map((category) => (
          <section key={category.title_tr}>
            <h2 className="font-display text-lg font-bold text-dark">
              {localize(category.title_tr, category.title_en, locale)}
            </h2>
            <div className="mt-4 space-y-4">
              {category.items.map((item) => (
                <div key={item.question_tr}>
                  <p className="font-semibold text-dark">{localize(item.question_tr, item.question_en, locale)}</p>
                  <p className="mt-1 text-sm text-body-text">{localize(item.answer_tr, item.answer_en, locale)}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
