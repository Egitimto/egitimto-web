import Link from 'next/link'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { FOCUS_AREAS } from '@/content/alanlarimiz'

export default async function AlanlarimizPage() {
  const locale = await getLocale()

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading
        title={localize('Alanlarımız', 'Our Focus Areas', locale)}
        subtitle={localize('Derneğimizin çalıştığı temel alanlar', 'The main areas where our association works', locale)}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {FOCUS_AREAS.map((area) => (
          <Card key={area.title_tr}>
            <h3 className="font-display font-bold text-dark">{localize(area.title_tr, area.title_en, locale)}</h3>
            <p className="mt-2 text-sm text-body-text">{localize(area.description_tr, area.description_en, locale)}</p>
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-body-text">
              {(locale === 'en' ? area.activities_en : area.activities_tr).map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="gradient-primary mt-12 rounded-2xl px-6 py-10 text-center text-white">
        <h2 className="font-display text-xl font-bold">
          {localize('İlgi Alanınıza Göre Bize Katılın!', 'Join Us in Your Area of Interest!', locale)}
        </h2>
        <Link href="/destek-ol" className="mt-4 inline-block rounded-full bg-white px-6 py-2 font-semibold text-primary">
          {localize('Gönüllü Ol', 'Volunteer', locale)}
        </Link>
      </div>
    </div>
  )
}
