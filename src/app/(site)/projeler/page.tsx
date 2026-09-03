import { Rocket } from 'lucide-react'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid'

export default async function ProjelerPage() {
  const locale = await getLocale()

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading title={localize('Projeler', 'Projects', locale)} />
      <BentoGrid className="sm:grid-cols-1">
        <BentoCard
          className="col-span-1 row-span-1"
          name={localize('Yakında', 'Coming Soon', locale)}
          description={localize(
            'Projelerimiz yakında burada listelenecek.',
            'Our projects will be listed here soon.',
            locale
          )}
          href="/iletisim"
          cta={localize('Bizimle İletişime Geçin', 'Get in Touch', locale)}
          background={
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-light via-primary to-primary-dark">
              <Rocket className="h-16 w-16 text-white/90" />
            </div>
          }
        />
      </BentoGrid>
    </div>
  )
}
