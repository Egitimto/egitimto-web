import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PdfDownloadButton } from '@/components/ui/PdfDownloadButton'
import { isSafeHttpUrl } from '@/lib/url-safety'
import type { Document } from '@/lib/supabase/types'

function TextBlock({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-body-text">
      {text.split('\n\n').map((paragraph, i) => (
        <p key={i} className="whitespace-pre-line">{paragraph}</p>
      ))}
    </div>
  )
}

function DocumentList({ documents, emptyMessage }: { documents: Document[]; emptyMessage: string }) {
  if (documents.length === 0) return <EmptyState message={emptyMessage} />
  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li key={doc.id}>
          {isSafeHttpUrl(doc.pdf_url) ? (
            <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {doc.title} ({doc.year})
            </a>
          ) : (
            <span className="text-body-text">{doc.title} ({doc.year})</span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default async function HakkimizdaPage() {
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: about } = await supabase.from('about_content').select('*').eq('id', 1).single()
  const { data: allDocuments } = await supabase
    .from('documents')
    .select('*')
    .order('year', { ascending: false })
    .order('sort_order', { ascending: true })

  const beyannameler = (allDocuments ?? []).filter((d) => d.type === 'beyanname')
  const faaliyetRaporlari = (allDocuments ?? []).filter((d) => d.type === 'faaliyet_raporu')

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading title={localize('Hakkımızda', 'About Us', locale)} />

      <section className="mb-12 grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
        <Image src="/images/about-1.jpg" alt="" width={500} height={350} className="rounded-2xl" />
        <div>
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Derneğin Kuruluşu', 'Foundation of the Association', locale)}
          </h2>
          <div className="mt-3">
            <TextBlock text={localize(about?.kurulus_tr ?? '', about?.kurulus_en ?? '', locale)} />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-xl font-bold text-dark">
          {localize('Amaç ve Misyon', 'Purpose and Mission', locale)}
        </h2>
        <div className="mt-3">
          <TextBlock text={localize(about?.amac_ilkeler_tr ?? '', about?.amac_ilkeler_en ?? '', locale)} />
        </div>
      </section>

      <section className="mb-12 grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
        <div className="order-2 sm:order-1">
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Vizyon', 'Vision', locale)}
          </h2>
          <div className="mt-3">
            <TextBlock text={localize(about?.vizyon_tr ?? '', about?.vizyon_en ?? '', locale)} />
          </div>
        </div>
        <Image src="/images/about-2.jpg" alt="" width={500} height={350} className="order-1 rounded-2xl sm:order-2" />
      </section>

      <section className="mb-12">
        <h2 className="font-display text-xl font-bold text-dark">
          {localize('Değerlerimiz', 'Our Values', locale)}
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {localize(about?.degerler_tr ?? '', about?.degerler_en ?? '', locale)
            .split('\n')
            .filter(Boolean)
            .map((line) => {
              const [title, ...rest] = line.split(':')
              return (
                <li key={title} className="rounded-xl border border-neutral-200 p-4">
                  <p className="font-semibold text-dark">{title}</p>
                  <p className="mt-1 text-sm text-body-text">{rest.join(':').trim()}</p>
                </li>
              )
            })}
        </ul>
      </section>

      <section className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Dernek Tüzüğü', 'Association Charter', locale)}
          </h2>
          <p className="mt-2 text-sm text-body-text">
            {localize(
              'Tüzüğün tam metni PDF olarak yakında burada yer alacak.',
              'The full text of the charter will be available here as a PDF soon.',
              locale
            )}
          </p>
          <div className="mt-3">
            <PdfDownloadButton
              url={about?.tuzuk_pdf_url ?? null}
              label={localize('Tüzüğü İndir', 'Download Charter', locale)}
              unavailableLabel={localize('Yakında', 'Coming Soon', locale)}
            />
          </div>
        </div>
        <Image src="/images/about-3.jpg" alt="" width={500} height={350} className="rounded-2xl" />
      </section>

      <section className="mb-12">
        <h2 className="font-display text-xl font-bold text-dark">
          {localize('Beyannameler', 'Declarations', locale)}
        </h2>
        <div className="mt-3">
          <DocumentList
            documents={beyannameler}
            emptyMessage={localize('Henüz beyanname eklenmedi.', 'No declarations have been added yet.', locale)}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-dark">
          {localize('Faaliyet Raporları', 'Annual Reports', locale)}
        </h2>
        <div className="mt-3">
          <DocumentList
            documents={faaliyetRaporlari}
            emptyMessage={localize('Henüz faaliyet raporu eklenmedi.', 'No annual reports have been added yet.', locale)}
          />
        </div>
      </section>
    </div>
  )
}
