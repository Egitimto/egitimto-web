import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { isSafeHttpUrl } from '@/lib/url-safety'

export default async function EtkinlikDetayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!item) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-dark">{localize(item.title_tr, item.title_en, locale)}</h1>
      {item.location && <p className="mt-2 text-body-text">{item.location}</p>}
      <div className="mt-6 whitespace-pre-line text-body-text">
        {localize(item.content_tr, item.content_en, locale)}
      </div>
      {item.show_apply_button && item.apply_button_url && isSafeHttpUrl(item.apply_button_url) && (
        <a
          href={item.apply_button_url}
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-primary mt-8 inline-block rounded-full px-6 py-3 font-semibold text-white"
        >
          {localize('Başvuru için tıklayın', 'Click to Apply', locale)}
        </a>
      )}
    </article>
  )
}
