import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

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

      {(!events || events.length === 0) ? (
        <EmptyState message={localize('Henüz planlanmış bir etkinlik yok.', 'No events have been scheduled yet.', locale)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {events.map((item) => (
            <Link key={item.id} href={`/etkinlikler/${item.slug}`}>
              <Card>
                <h3 className="font-display font-bold text-dark">{localize(item.title_tr, item.title_en, locale)}</h3>
                {item.location && <p className="mt-1 text-sm text-body-text">{item.location}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
