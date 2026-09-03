import { notFound } from 'next/navigation'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { FormField } from '@/components/admin/FormField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { PublishToggle } from '@/components/admin/PublishToggle'
import { upsertEvent } from '../actions'

export default async function AdminEtkinlikFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  await requireSection('etkinlikler')
  const { id } = await params
  const { error } = await searchParams
  const isNew = id === 'new'

  const supabase = await createClient()
  const item = isNew ? null : (await supabase.from('events').select('*').eq('id', id).single()).data

  if (!isNew && !item) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">
        {isNew ? 'Yeni Etkinlik' : 'Etkinliği Düzenle'}
      </h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={upsertEvent} className="space-y-4">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <input type="hidden" name="existing_cover_image" value={item?.cover_image ?? ''} />

        <FormField label="Başlık (TR)" htmlFor="title_tr">
          <input
            id="title_tr"
            name="title_tr"
            defaultValue={item?.title_tr}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Başlık (EN)" htmlFor="title_en">
          <input
            id="title_en"
            name="title_en"
            defaultValue={item?.title_en}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Slug (boş bırakılırsa başlıktan otomatik üretilir)" htmlFor="slug">
          <input
            id="slug"
            name="slug"
            defaultValue={item?.slug}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Tarih" htmlFor="event_date">
          <input
            id="event_date"
            name="event_date"
            type="date"
            defaultValue={item?.event_date ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Konum" htmlFor="location">
          <input
            id="location"
            name="location"
            defaultValue={item?.location ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="İçerik (TR)" htmlFor="content_tr">
          <textarea
            id="content_tr"
            name="content_tr"
            defaultValue={item?.content_tr}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="İçerik (EN)" htmlFor="content_en">
          <textarea
            id="content_en"
            name="content_en"
            defaultValue={item?.content_en}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <ImageUploadField name="cover_image" label="Kapak Görseli" currentUrl={item?.cover_image} />

        <label className="flex items-center gap-2 text-sm text-body-text">
          <input type="checkbox" name="show_apply_button" defaultChecked={item?.show_apply_button ?? false} />
          Başvuru butonu göster
        </label>
        <FormField label="Başvuru URL'si" htmlFor="apply_button_url">
          <input
            id="apply_button_url"
            name="apply_button_url"
            defaultValue={item?.apply_button_url ?? ''}
            placeholder="https://..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>

        <PublishToggle defaultChecked={item?.is_published ?? false} />

        <button type="submit" className="gradient-primary rounded-full px-6 py-2 font-semibold text-white">
          Kaydet
        </button>
      </form>
    </div>
  )
}
