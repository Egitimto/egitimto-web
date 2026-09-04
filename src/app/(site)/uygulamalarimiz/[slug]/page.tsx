import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { APPS } from '@/content/apps'

function parseFeatures(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split(':')
      return { title: title.trim(), description: rest.join(':').trim() }
    })
}

export function generateStaticParams() {
  return APPS.map((app) => ({ slug: app.slug }))
}

export default async function UygulamaDetayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()

  const app = APPS.find((item) => item.slug === slug)
  if (!app) notFound()

  const features = parseFeatures(localize(app.features_tr, app.features_en, locale))
  const deleteDataSubject = localize('Kişisel Verilerimin Silinmesi', 'Deletion of My Personal Data', locale)

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-4">
        <Image src={app.icon} alt="" width={80} height={80} className="h-20 w-20 rounded-2xl object-cover" />
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">{localize(app.name_tr, app.name_en, locale)}</h1>
          <p className="mt-1 text-body-text">{localize(app.short_description_tr, app.short_description_en, locale)}</p>
        </div>
      </div>

      {app.websiteUrl && (
        <a
          href={app.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-primary mt-8 flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          {localize('Platforma Git', 'Visit the Platform', locale)}
          <ArrowRight className="h-5 w-5" />
        </a>
      )}

      <div className="mt-8 space-y-3 text-body-text">
        {localize(app.description_tr, app.description_en, locale)
          .split('\n\n')
          .map((paragraph, i) => (
            <p key={i} className="whitespace-pre-line">{paragraph}</p>
          ))}
      </div>

      {features.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-bold text-dark">{localize('Öne Çıkanlar', 'Highlights', locale)}</h2>
          <ul className="mt-4 space-y-3">
            {features.map((feature) => (
              <li key={feature.title}>
                <p className="font-semibold text-dark">{feature.title}</p>
                {feature.description && <p className="text-sm text-body-text">{feature.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        {app.playStoreUrl && (
          <a href={app.playStoreUrl} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                locale === 'en'
                  ? 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'
                  : 'https://play.google.com/intl/tr/badges/static/images/badges/tr_badge_web_generic.png'
              }
              alt="Google Play"
              className="h-14"
            />
          </a>
        )}
        {app.appStoreUrl && (
          <a
            href={app.appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center rounded-xl bg-dark px-5 font-semibold text-white"
          >
            App Store
          </a>
        )}
      </div>

      <div className="mt-8 border-t border-neutral-200 pt-6">
        <p className="text-sm text-body-text">
          {localize(
            'Bu uygulamayla ilgili kişisel verilerinizin silinmesini talep etmek için bizimle iletişime geçebilirsiniz.',
            'To request the deletion of your personal data related to this app, you can contact us.',
            locale
          )}
        </p>
        <Link
          href={`/iletisim?subject=${encodeURIComponent(deleteDataSubject)}`}
          className="mt-3 inline-block rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-dark hover:border-primary hover:text-primary"
        >
          {localize('Verilerimi Sil', 'Delete My Data', locale)}
        </Link>
      </div>
    </article>
  )
}
