import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PdfDownloadButton } from '@/components/ui/PdfDownloadButton'
import { Reveal } from '@/components/ui/Reveal'
import { ValuesBeamDiagram } from '@/components/site/ValuesBeamDiagram'
import { isSafeHttpUrl } from '@/lib/url-safety'
import type { Document } from '@/lib/supabase/types'

function TextBlock({ text, justify = false }: { text: string; justify?: boolean }) {
  return (
    <div className={`space-y-3 text-body-text ${justify ? 'text-justify' : ''}`}>
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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading title={localize('Hakkımızda', 'About Us', locale)} align="left" />

      <Reveal className="mb-12" y={16}>
        <section>
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Derneğin Kuruluşu', 'Foundation of the Association', locale)}
          </h2>
          <div className="mt-3">
            <TextBlock text={localize(about?.kurulus_tr ?? '', about?.kurulus_en ?? '', locale)} justify />
          </div>
        </section>
      </Reveal>

      <Reveal className="mb-12" y={16}>
        <section>
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Dernek Tüzüğü', 'Association Charter', locale)}
          </h2>
          <p className="mt-2 max-w-4xl text-sm text-body-text">
            {about?.tuzuk_pdf_url && isSafeHttpUrl(about.tuzuk_pdf_url)
              ? localize(
                  'Tüzüğün tam metnini aşağıdan PDF olarak indirebilirsiniz.',
                  'You can download the full text of the charter below as a PDF.',
                  locale
                )
              : localize(
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
        </section>
      </Reveal>

      <section className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Amaç ve Misyon', 'Purpose and Mission', locale)}
          </h2>
          <div className="mt-3">
            <TextBlock text={localize(about?.amac_ilkeler_tr ?? '', about?.amac_ilkeler_en ?? '', locale)} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Vizyon', 'Vision', locale)}
          </h2>
          <div className="mt-3">
            <TextBlock text={localize(about?.vizyon_tr ?? '', about?.vizyon_en ?? '', locale)} />
          </div>
        </Reveal>
      </section>

      <Reveal className="mb-12" y={16}>
        <section>
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Değerlerimiz', 'Our Values', locale)}
          </h2>
          <div className="mt-6">
            <ValuesBeamDiagram valuesTr={about?.degerler_tr ?? ''} valuesEn={about?.degerler_en ?? ''} locale={locale} />
          </div>
        </section>
      </Reveal>

      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Beyannameler', 'Declarations', locale)}
          </h2>
          <div className="mt-3">
            <DocumentList
              documents={beyannameler}
              emptyMessage={localize('Henüz beyanname eklenmedi.', 'No declarations have been added yet.', locale)}
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Faaliyet Raporları', 'Annual Reports', locale)}
          </h2>
          <div className="mt-3">
            <DocumentList
              documents={faaliyetRaporlari}
              emptyMessage={localize('Henüz faaliyet raporu eklenmedi.', 'No annual reports have been added yet.', locale)}
            />
          </div>
        </Reveal>
      </section>
    </div>
  )
}
