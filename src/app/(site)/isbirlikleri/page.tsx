import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { isSafeHttpUrl } from '@/lib/url-safety'

export default async function IsbirlikleriPage() {
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: partnerships } = await supabase
    .from('partnerships')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading title={localize('İşbirlikleri', 'Partnerships', locale)} />

      {(!partnerships || partnerships.length === 0) ? (
        <EmptyState message={localize('Henüz işbirliği eklenmedi.', 'No partnerships have been added yet.', locale)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {partnerships.map((partnership) => (
            <Card key={partnership.id}>
              {isSafeHttpUrl(partnership.logo_url) && (
                <Image src={partnership.logo_url} alt={partnership.name} width={160} height={80} className="mb-4" />
              )}
              <h3 className="font-display font-bold text-dark">{partnership.name}</h3>
              <p className="mt-2 text-sm text-body-text">
                {localize(partnership.project_description_tr, partnership.project_description_en, locale)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
