import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { ComingSoon } from '@/components/site/ComingSoon'

export default async function UygulamalarimizPage() {
  const locale = await getLocale()
  return (
    <ComingSoon
      title={localize('Uygulamalarımız', 'Our Apps', locale)}
      message={localize('Uygulamalarımız yakında burada yer alacak.', 'Our apps will be featured here soon.', locale)}
    />
  )
}
