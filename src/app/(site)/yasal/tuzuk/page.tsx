import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function TuzukPage() {
  const locale = await getLocale()
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading title={localize('Dernek Tüzüğü', 'Association Charter', locale)} />
      <EmptyState
        message={localize(
          'Tüzüğün tam metni PDF olarak yakında burada yer alacak.',
          'The full text of the charter will be available here as a PDF soon.',
          locale
        )}
      />
    </div>
  )
}
