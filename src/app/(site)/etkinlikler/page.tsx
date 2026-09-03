import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { BentoGrid, BentoCard, bentoSpanClass } from '@/components/ui/bento-grid'
import { isSafeHttpUrl } from '@/lib/url-safety'

export default async function EtkinliklerPage() {
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('event_date', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading title={localize('Eğitim ve Etkinlikler', 'Events', locale)} />

      {!events || events.length === 0 ? (
        <EmptyState message={localize('Henüz planlanmış bir etkinlik yok.', 'No events have been scheduled yet.', locale)} />
      ) : (
        <BentoGrid>
          {events.map((item, index) => (
            <BentoCard
              key={item.id}
              className={bentoSpanClass(index)}
              name={localize(item.title_tr, item.title_en, locale)}
              description={item.location ?? localize(item.content_tr, item.content_en, locale)}
              href={`/etkinlikler/${item.slug}`}
              cta={localize('Detayları Gör', 'Read More', locale)}
              background={
                item.cover_image && isSafeHttpUrl(item.cover_image) ? (
                  <Image src={item.cover_image} alt="" fill className="object-cover" />
                ) : undefined
              }
            />
          ))}
        </BentoGrid>
      )}
    </div>
  )
}
