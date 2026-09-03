import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

function initials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

export default async function EkibimizPage() {
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('team_categories')
    .select('*, team_members(*)')
    .order('sort_order', { ascending: true })

  const hasAnyMembers = (categories ?? []).some((c) => (c.team_members as unknown[])?.length > 0)

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading title={localize('Ekibimiz', 'Our Team', locale)} />

      {!hasAnyMembers && (
        <EmptyState message={localize('Henüz ekip üyesi eklenmedi.', 'No team members have been added yet.', locale)} />
      )}

      {(categories ?? []).map((category) => {
        const members = ((category.team_members ?? []) as {
          id: string
          full_name: string
          role_tr: string
          role_en: string
          sort_order: number
        }[]).sort((a, b) => a.sort_order - b.sort_order)

        if (members.length === 0) return null

        return (
          <section key={category.id} className="mb-12">
            <h2 className="mb-6 font-display text-xl font-bold text-dark">
              {localize(category.name_tr, category.name_en, locale)}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {members.map((member) => (
                <Card key={member.id} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                    {initials(member.full_name)}
                  </div>
                  <p className="mt-3 font-semibold text-dark">{member.full_name}</p>
                  <p className="text-sm text-body-text">{localize(member.role_tr, member.role_en, locale)}</p>
                </Card>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
