import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PdfDownloadButton } from '@/components/ui/PdfDownloadButton'
import { isSafeHttpUrl } from '@/lib/url-safety'

export default async function TuzukPage() {
  const locale = await getLocale()
  const supabase = await createClient()
  const { data: about } = await supabase.from('about_content').select('tuzuk_pdf_url').eq('id', 1).single()
  const hasTuzuk = !!about?.tuzuk_pdf_url && isSafeHttpUrl(about.tuzuk_pdf_url)

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading title={localize('Dernek Tüzüğü', 'Association Charter', locale)} />
      {hasTuzuk ? (
        <>
          <p className="mb-4 text-body-text">
            {localize(
              'Tüzüğün tam metnini aşağıdan PDF olarak indirebilirsiniz.',
              'You can download the full text of the charter below as a PDF.',
              locale
            )}
          </p>
          <PdfDownloadButton
            url={about?.tuzuk_pdf_url ?? null}
            label={localize('Tüzüğü İndir', 'Download Charter', locale)}
            unavailableLabel={localize('Yakında', 'Coming Soon', locale)}
          />
        </>
      ) : (
        <EmptyState
          message={localize(
            'Tüzüğün tam metni PDF olarak yakında burada yer alacak.',
            'The full text of the charter will be available here as a PDF soon.',
            locale
          )}
        />
      )}
    </div>
  )
}
