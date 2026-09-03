import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { isSafeHttpUrl } from '@/lib/url-safety'

export default async function HaberlerPage() {
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: news } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading title={localize('Haberler', 'News', locale)} />

      {(!news || news.length === 0) ? (
        <EmptyState message={localize('Henüz yayınlanmış bir haber yok.', 'No news has been published yet.', locale)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {news.map((item) => (
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
                <h3 className="font-display font-bold text-dark">{localize(item.title_tr, item.title_en, locale)}</h3>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
