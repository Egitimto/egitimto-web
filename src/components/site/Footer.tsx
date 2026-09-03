import Link from 'next/link'
import type { Locale } from '@/lib/supabase/types'
import { localize } from '@/lib/i18n/localize'
import { CONTACT_INFO } from '@/content/contact-info'

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="mt-auto bg-dark text-neutral-300">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm text-neutral-400">
          {localize(
            `www.egitimto.org, Eğitim Teknoloji ve Oyun Derneği'nin resmi internet sitesidir. Dernek Kütük No: ${CONTACT_INFO.registryNumber}`,
            `www.egitimto.org is the official website of the Education, Technology and Gaming Association. Association Registry No: ${CONTACT_INFO.registryNumber}`,
            locale
          )}
        </p>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 font-display font-semibold text-white">
              {localize('Yasal', 'Legal', locale)}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/yasal/tuzuk">{localize('Dernek Tüzüğü', 'Association Charter', locale)}</Link></li>
              <li><Link href="/yasal/kvkk">{localize('KVKK ve Gizlilik Politikası', 'Privacy Policy', locale)}</Link></li>
              <li><Link href="/yasal/etik-ilkeler">{localize('Etik İlkeler', 'Ethical Principles', locale)}</Link></li>
              <li><Link href="/yasal/sss">{localize('SSS', 'FAQ', locale)}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-display font-semibold text-white">
              {localize('İletişim', 'Contact', locale)}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>{CONTACT_INFO.address}</li>
              <li>{CONTACT_INFO.email}</li>
              <li>{localize('Dernek Kütük No', 'Registry No', locale)}: {CONTACT_INFO.registryNumber}</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-display font-semibold text-white">
              {localize('Sosyal Medya', 'Social Media', locale)}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href={CONTACT_INFO.socials.instagram}>Instagram</a></li>
              <li><a href={CONTACT_INFO.socials.linkedin}>LinkedIn</a></li>
              <li><a href={CONTACT_INFO.socials.facebook}>Facebook</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-xs text-neutral-500">
          © {new Date().getFullYear()} Eğitim Teknoloji ve Oyun Derneği
        </p>
      </div>
    </footer>
  )
}
