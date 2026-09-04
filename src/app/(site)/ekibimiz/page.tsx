import Image from 'next/image'
import { Mail } from 'lucide-react'
import { FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import type { IconType } from 'react-icons'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { isSafeHttpUrl } from '@/lib/url-safety'

const SOCIAL_ICONS: Record<string, IconType> = {
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  twitter: FaXTwitter,
}

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
          photo_url: string | null
          sort_order: number
          email: string | null
          social_links: unknown
        }[]).sort((a, b) => a.sort_order - b.sort_order)

        if (members.length === 0) return null

        return (
          <section key={category.id} className="mb-12">
            <h2 className="mb-6 font-display text-xl font-bold text-dark">
              {localize(category.name_tr, category.name_en, locale)}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {members.map((member) => {
                const socialLinks = (member.social_links ?? {}) as Record<string, string>
                const socials = Object.entries(socialLinks).filter(
                  ([key, url]) => key !== 'email' && url && isSafeHttpUrl(url)
                )
                return (
                  <Card key={member.id} className="group relative min-h-[320px] overflow-hidden text-center">
                    <div className="flex h-full flex-col items-center">
                      <div className="flex flex-1 items-center justify-center">
                        {member.photo_url && isSafeHttpUrl(member.photo_url) ? (
                          <Image
                            src={member.photo_url}
                            alt={member.full_name}
                            width={144}
                            height={144}
                            className="mx-auto h-36 w-36 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-primary/10 font-display text-3xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                            {initials(member.full_name)}
                          </div>
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="font-semibold text-dark">{member.full_name}</p>
                        <p className="text-sm text-body-text">{localize(member.role_tr, member.role_en, locale)}</p>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-end">
                      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/30 to-white/10 opacity-0 backdrop-blur-lg transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative z-10 flex flex-col items-center gap-2 p-6 pb-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <p className="font-semibold text-primary">{member.full_name}</p>
                        <p className="text-sm text-primary/80">{localize(member.role_tr, member.role_en, locale)}</p>
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            aria-label={member.email}
                            className="flex items-center gap-1.5 text-sm text-primary/90 hover:text-primary"
                          >
                            <Mail className="h-4 w-4" />
                            {member.email}
                          </a>
                        )}
                        {socials.length > 0 && (
                          <div className="mt-1 flex items-center justify-center gap-3">
                            {socials.map(([key, url]) => {
                              const Icon = SOCIAL_ICONS[key]
                              if (!Icon) return null
                              return (
                                <a
                                  key={key}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={key}
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 text-primary/90 transition-colors hover:border-primary hover:text-primary"
                                >
                                  <Icon className="h-4 w-4" />
                                </a>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
