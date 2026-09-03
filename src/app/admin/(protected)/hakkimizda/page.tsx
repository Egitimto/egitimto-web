import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { FormField } from '@/components/admin/FormField'
import { updateAboutContent } from './actions'

export default async function AdminHakkimizdaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  await requireSection('hakkimizda')
  const { error, success } = await searchParams
  const supabase = await createClient()
  const { data: about } = await supabase.from('about_content').select('*').eq('id', 1).single()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">Hakkımızda</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Kaydedildi.</p>}
      <form action={updateAboutContent} className="space-y-4">
        <input type="hidden" name="existing_tuzuk_pdf_url" value={about?.tuzuk_pdf_url ?? ''} />

        <FormField label="Derneğin Kuruluşu (TR)" htmlFor="kurulus_tr">
          <textarea
            id="kurulus_tr"
            name="kurulus_tr"
            defaultValue={about?.kurulus_tr}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Derneğin Kuruluşu (EN)" htmlFor="kurulus_en">
          <textarea
            id="kurulus_en"
            name="kurulus_en"
            defaultValue={about?.kurulus_en}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Amaç ve Misyon (TR)" htmlFor="amac_ilkeler_tr">
          <textarea
            id="amac_ilkeler_tr"
            name="amac_ilkeler_tr"
            defaultValue={about?.amac_ilkeler_tr}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Amaç ve Misyon (EN)" htmlFor="amac_ilkeler_en">
          <textarea
            id="amac_ilkeler_en"
            name="amac_ilkeler_en"
            defaultValue={about?.amac_ilkeler_en}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Vizyon (TR)" htmlFor="vizyon_tr">
          <textarea
            id="vizyon_tr"
            name="vizyon_tr"
            defaultValue={about?.vizyon_tr}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Vizyon (EN)" htmlFor="vizyon_en">
          <textarea
            id="vizyon_en"
            name="vizyon_en"
            defaultValue={about?.vizyon_en}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Değerlerimiz (TR) — her satır 'Başlık: Açıklama' formatında" htmlFor="degerler_tr">
          <textarea
            id="degerler_tr"
            name="degerler_tr"
            defaultValue={about?.degerler_tr}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Değerlerimiz (EN)" htmlFor="degerler_en">
          <textarea
            id="degerler_en"
            name="degerler_en"
            defaultValue={about?.degerler_en}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Tüzük PDF" htmlFor="tuzuk_pdf_url">
          <input
            id="tuzuk_pdf_url"
            name="tuzuk_pdf_url"
            type="file"
            accept="application/pdf"
            className="block w-full text-sm"
          />
          {about?.tuzuk_pdf_url && (
            <a
              href={about.tuzuk_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-primary hover:underline"
            >
              Mevcut dosyayı görüntüle
            </a>
          )}
        </FormField>

        <button type="submit" className="gradient-primary rounded-full px-6 py-2 font-semibold text-white">
          Kaydet
        </button>
      </form>
    </div>
  )
}
