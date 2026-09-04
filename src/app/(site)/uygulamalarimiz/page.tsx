import Image from 'next/image'
import Link from 'next/link'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { APPS } from '@/content/apps'

export default async function UygulamalarimizPage() {
  const locale = await getLocale()

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading
        title={localize('Uygulamalarımız', 'Our Apps', locale)}
        subtitle={localize(
          'Derneğimizin geliştirdiği uygulamaları keşfedin.',
          'Discover the apps developed by our association.',
          locale
        )}
      />

      {APPS.length === 0 ? (
        <EmptyState
          message={localize('Uygulamalarımız yakında burada yer alacak.', 'Our apps will be featured here soon.', locale)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {APPS.map((app) => (
            <Link key={app.slug} href={`/uygulamalarimiz/${app.slug}`}>
              <Card className="flex h-full flex-col items-center gap-6 text-center transition-shadow hover:shadow-md">
                <Image
                  src={app.icon}
                  alt=""
                  width={112}
                  height={112}
                  className="h-28 w-28 shrink-0 rounded-3xl object-cover shadow-sm"
                />
                <div>
                  <h3 className="font-display text-xl font-bold text-dark">{localize(app.name_tr, app.name_en, locale)}</h3>
                  <p className="mt-2 text-base text-body-text">
                    {localize(app.short_description_tr, app.short_description_en, locale)}
                  </p>
                  <span className="gradient-primary mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white">
                    {localize('Detayları Gör', 'View Details', locale)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
