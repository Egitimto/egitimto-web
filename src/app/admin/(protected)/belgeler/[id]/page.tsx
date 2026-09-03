import { notFound } from 'next/navigation'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { FormField } from '@/components/admin/FormField'
import { upsertDocument } from '../actions'

export default async function AdminBelgeFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  await requireSection('belgeler')
  const { id } = await params
  const { error } = await searchParams
  const isNew = id === 'new'

  const supabase = await createClient()
  const item = isNew ? null : (await supabase.from('documents').select('*').eq('id', id).single()).data

  if (!isNew && !item) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">
        {isNew ? 'Yeni Belge' : 'Belgeyi Düzenle'}
      </h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={upsertDocument} className="space-y-4">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <input type="hidden" name="existing_pdf_url" value={item?.pdf_url ?? ''} />

        <FormField label="Tür" htmlFor="type">
          <select
            id="type"
            name="type"
            defaultValue={item?.type ?? 'beyanname'}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            <option value="beyanname">Beyanname</option>
            <option value="faaliyet_raporu">Faaliyet Raporu</option>
          </select>
        </FormField>
        <FormField label="Başlık" htmlFor="title">
          <input
            id="title"
            name="title"
            defaultValue={item?.title}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Yıl" htmlFor="year">
          <input
            id="year"
            name="year"
            type="number"
            defaultValue={item?.year}
            required
            className="w-32 rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="PDF Dosyası" htmlFor="pdf_url">
          <input id="pdf_url" name="pdf_url" type="file" accept="application/pdf" className="block w-full text-sm" />
          {item?.pdf_url && (
            <a
              href={item.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-primary hover:underline"
            >
              Mevcut dosyayı görüntüle
            </a>
          )}
        </FormField>
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
