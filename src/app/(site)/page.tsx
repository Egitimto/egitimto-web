import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { isSafeHttpUrl } from '@/lib/url-safety'

const STATS = [
  { value: '500+', tr: 'Öğrenci', en: 'Students' },
  { value: '25+', tr: 'Projeler', en: 'Projects' },
  { value: '15+', tr: 'Şehir', en: 'Cities' },
]

const WHAT_WE_DO = [
  {
    href: '/uygulamalarimiz',
    tr: { title: 'Uygulamalarımız', description: 'Projelerimizi takip etmek için uygulamalarımıza göz atın.' },
    en: { title: 'Our Apps', description: 'Check out our apps to follow our projects.' },
  },
  {
    href: '/destek-ol',
    tr: { title: 'Destek Ol', description: 'Projelerimize destek olun, toplumsal değişime katkı sağlayın.' },
    en: { title: 'Support Us', description: 'Support our projects and contribute to social change.' },
  },
  {
    href: '/iletisim',
    tr: { title: 'İletişim', description: 'Bize ulaşın, sorularınızı sorun.' },
    en: { title: 'Contact', description: 'Contact us, ask your questions.' },
  },
]

const FOCUS_AREAS = [
  { tr: 'Eğitim & Teknoloji', en: 'Education & Technology' },
  { tr: 'Oyun & Öğrenme', en: 'Gaming & Learning' },
  { tr: 'Dijital Okuryazarlık', en: 'Digital Literacy' },
  { tr: 'Gençlik & Gönüllülük', en: 'Youth & Volunteering' },
]

export default async function Home() {
  const locale = await getLocale()
  const supabase = await createClient()
  const { data: latestNews } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(3)

  return (
    <>
      <section className="gradient-cream px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full bg-white px-4 py-1 text-sm font-medium text-primary">
            🎓 {localize('Eğitim Teknoloji ve Oyun Derneği', 'Education, Technology and Gaming Association', locale)}
          </span>
          <h1 className="font-display text-4xl font-bold text-dark sm:text-5xl">
            {localize('Eğitimde Fırsat Eşitliği İçin Birlikte', 'Together for Equal Opportunities in Education', locale)}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-body-text">
            {localize(
              'Eğitim, teknoloji ve oyun alanlarında toplumsal fayda sağlamak için çalışan bir sivil toplum kuruluşu.',
              'A civil society organization working to provide social benefit in the fields of education, technology and gaming.',
              locale
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/hakkimizda" className="gradient-primary rounded-full px-6 py-3 font-semibold text-white">
              {localize('Projelerimizi İncele', 'Explore Our Projects', locale)}
            </Link>
            <Link href="/destek-ol" className="rounded-full border border-primary px-6 py-3 font-semibold text-primary">
              {localize('Destek Ol', 'Support Us', locale)}
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <div key={stat.tr}>
                <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-body-text">{localize(stat.tr, stat.en, locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          title={localize('Neler Yapıyoruz?', 'What Do We Do?', locale)}
          subtitle={localize(
            'Eğitim, teknoloji ve oyun alanlarındaki faaliyetlerimizle toplumsal değişime katkı sağlıyoruz',
            'We contribute to social change through our activities in education, technology and gaming',
            locale
          )}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {WHAT_WE_DO.map((item) => {
            const content = locale === 'en' ? item.en : item.tr
            return (
              <Card key={item.href}>
                <h3 className="font-display text-lg font-bold text-dark">{content.title}</h3>
                <p className="mt-2 text-sm text-body-text">{content.description}</p>
                <Link href={item.href} className="mt-4 inline-block text-sm font-semibold text-primary">
                  {localize('Devamını Gör →', 'Learn More →', locale)}
                </Link>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading title={localize('Son Haberler', 'Latest News', locale)} />
        {!latestNews || latestNews.length === 0 ? (
          <EmptyState
            message={localize(
              'Henüz yayınlanmış bir haber yok, yakında burada olacak.',
              'No news has been published yet — check back soon.',
              locale
            )}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {latestNews.map((item) => (
              <Link key={item.id} href={`/haberler/${item.slug}`}>
                <Card>
                  {item.cover_image && isSafeHttpUrl(item.cover_image) && (
                    <Image
                      src={item.cover_image}
                      alt=""
                      width={400}
                      height={220}
                      className="mb-4 h-40 w-full rounded-xl object-cover"
                    />
                  )}
                  <h3 className="font-display font-bold text-dark">
                    {localize(item.title_tr, item.title_en, locale)}
                  </h3>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="gradient-cream px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 sm:grid-cols-2">
          <Image src="/images/hero.jpg" alt="" width={600} height={400} className="rounded-2xl" />
          <div>
            <h2 className="font-display text-2xl font-bold text-dark">
              {localize('Biz Kimiz?', 'Who Are We?', locale)}
            </h2>
            <p className="mt-4 text-body-text">
              {localize(
                'Eğitim Teknoloji ve Oyun Derneği, eğitimde yenilikçi yaklaşımları destekleyen bir sivil toplum kuruluşudur. Eğitim ve teknoloji alanında çalışan uzmanlar, akademisyenler ve gönüllüler tarafından kurulmuştur.',
                'Education, Technology and Gaming Association is a civil society organization that supports innovative approaches in education. Founded by experts, academics and volunteers working in the field of education and technology.',
                locale
              )}
            </p>
            <Link href="/hakkimizda" className="mt-4 inline-block font-semibold text-primary">
              {localize('Daha Fazla Bilgi →', 'More Information →', locale)}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading title={localize('Faaliyet Alanlarımız', 'Our Areas of Activity', locale)} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FOCUS_AREAS.map((area) => (
            <Card key={area.tr} className="text-center">
              <p className="font-medium text-dark">{localize(area.tr, area.en, locale)}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/alanlarimiz" className="font-semibold text-primary">
            {localize('Tüm Alanlar →', 'All Areas →', locale)}
          </Link>
        </div>
      </section>

      <section className="gradient-primary px-6 py-16 text-center text-white">
        <h2 className="font-display text-2xl font-bold">
          {localize('Siz de Bize Katılın!', 'Join Us Too!', locale)}
        </h2>
        <Link href="/destek-ol" className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-primary">
          {localize('Destek Ol', 'Support Us', locale)}
        </Link>
      </section>
    </>
  )
}
