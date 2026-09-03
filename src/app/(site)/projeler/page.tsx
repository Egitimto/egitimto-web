import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { ComingSoon } from '@/components/site/ComingSoon'

export default async function ProjelerPage() {
  const locale = await getLocale()
  return (
    <ComingSoon
      title={localize('Projeler', 'Projects', locale)}
      message={localize('Projelerimiz yakında burada listelenecek.', 'Our projects will be listed here soon.', locale)}
    />
  )
}
