import { notFound } from 'next/navigation'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { FormField } from '@/components/admin/FormField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { upsertMember } from '../../actions'

export default async function AdminUyeFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; category_id?: string }>
}) {
  await requireSection('ekibimiz')
  const { id } = await params
  const { error, category_id: presetCategoryId } = await searchParams
  const isNew = id === 'new'

  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('team_categories')
    .select('*')
    .order('sort_order', { ascending: true })
  const item = isNew ? null : (await supabase.from('team_members').select('*').eq('id', id).single()).data

  if (!isNew && !item) notFound()

  const socialLinks = (item?.social_links ?? {}) as Record<string, string>

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">{isNew ? 'Yeni Üye' : 'Üyeyi Düzenle'}</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={upsertMember} className="space-y-4">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <input type="hidden" name="existing_photo_url" value={item?.photo_url ?? ''} />

        <FormField label="Kategori" htmlFor="category_id">
          <select
            id="category_id"
            name="category_id"
            defaultValue={item?.category_id ?? presetCategoryId ?? ''}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            <option value="" disabled>
              Seçiniz
            </option>
            {(categories ?? []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_tr}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Ad Soyad" htmlFor="full_name">
          <input
            id="full_name"
            name="full_name"
            defaultValue={item?.full_name}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Görev (TR)" htmlFor="role_tr">
          <input
            id="role_tr"
            name="role_tr"
            defaultValue={item?.role_tr}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Görev (EN)" htmlFor="role_en">
          <input
            id="role_en"
            name="role_en"
            defaultValue={item?.role_en}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="E-posta" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={item?.email ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Instagram URL" htmlFor="instagram">
          <input
            id="instagram"
            name="instagram"
            defaultValue={socialLinks.instagram ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="LinkedIn URL" htmlFor="linkedin">
          <input
            id="linkedin"
            name="linkedin"
            defaultValue={socialLinks.linkedin ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Twitter URL" htmlFor="twitter">
          <input
            id="twitter"
            name="twitter"
            defaultValue={socialLinks.twitter ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <ImageUploadField name="photo_url" label="Fotoğraf" currentUrl={item?.photo_url} />
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
