import { notFound } from 'next/navigation'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { FormField } from '@/components/admin/FormField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { upsertPartnership } from '../actions'

export default async function AdminIsbirlikFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  await requireSection('isbirlikleri')
  const { id } = await params
  const { error } = await searchParams
  const isNew = id === 'new'

  const supabase = await createClient()
  const item = isNew ? null : (await supabase.from('partnerships').select('*').eq('id', id).single()).data

  if (!isNew && !item) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">
        {isNew ? 'Yeni İşbirliği' : 'İşbirliğini Düzenle'}
      </h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={upsertPartnership} className="space-y-4">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <input type="hidden" name="existing_logo_url" value={item?.logo_url ?? ''} />

        <FormField label="İsim" htmlFor="name">
          <input
            id="name"
            name="name"
            defaultValue={item?.name}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Proje Açıklaması (TR)" htmlFor="project_description_tr">
          <textarea
            id="project_description_tr"
            name="project_description_tr"
            defaultValue={item?.project_description_tr}
            rows={4}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Proje Açıklaması (EN)" htmlFor="project_description_en">
          <textarea
            id="project_description_en"
            name="project_description_en"
            defaultValue={item?.project_description_en}
            rows={4}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <ImageUploadField name="logo_url" label="Logo" currentUrl={item?.logo_url} />
        <FormField label="Sıra" htmlFor="sort_order">
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={item?.sort_order ?? 0}
            className="w-24 rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>

        <button type="submit" className="gradient-primary rounded-full px-6 py-2 font-semibold text-white">
          Kaydet
        </button>
      </form>
    </div>
  )
}
