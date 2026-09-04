import Image from 'next/image'
import Link from 'next/link'
import type { Locale } from '@/lib/supabase/types'
import { localize } from '@/lib/i18n/localize'
import { LocaleSwitcher } from './LocaleSwitcher'
import { NavDropdown } from './NavDropdown'
import { MobileNav } from './MobileNav'

export function Header({ locale }: { locale: Locale }) {
  const egitimtoItems = [
    { href: '/hakkimizda', label: localize('Hakkımızda', 'About Us', locale) },
    { href: '/ekibimiz', label: localize('Ekibimiz', 'Our Team', locale) },
    { href: '/isbirlikleri', label: localize('İşbirlikleri', 'Partnerships', locale) },
  ]
  const duyurularItems = [
    { href: '/haberler', label: localize('Haberler', 'News', locale) },
    { href: '/etkinlikler', label: localize('Eğitim ve Etkinlikler', 'Events', locale) },
    { href: '/projeler', label: localize('Projeler', 'Projects', locale) },
  ]
  const simpleItems = [
    { href: '/uygulamalarimiz', label: localize('Uygulamalarımız', 'Our Apps', locale) },
    { href: '/alanlarimiz', label: localize('Alanlarımız', 'Our Focus Areas', locale) },
    { href: '/destek-ol', label: localize('Destek Ol', 'Support Us', locale) },
    { href: '/iletisim', label: localize('İletişim', 'Contact', locale) },
  ]

  return (
    <header className="gradient-primary relative">
      <div className="flex w-full items-center justify-between px-6 py-3 sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <Image src="/images/kurumlogo.png" alt="" width={62} height={62} className="object-contain" />
          </span>
          <span className="font-display text-2xl font-bold text-white">Eğitim Teknoloji ve Oyun Derneği</span>
        </Link>
        <div className="flex items-center gap-4 lg:gap-8">
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Ana menü">
            <NavDropdown label={localize('EğitimTO', 'EğitimTO', locale)} items={egitimtoItems} />
            <NavDropdown label={localize('Duyurular', 'Announcements', locale)} items={duyurularItems} />
            {simpleItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-base font-medium text-white/90 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <LocaleSwitcher locale={locale} />
          <MobileNav
            egitimtoLabel={localize('EğitimTO', 'EğitimTO', locale)}
            egitimtoItems={egitimtoItems}
            duyurularLabel={localize('Duyurular', 'Announcements', locale)}
            duyurularItems={duyurularItems}
            simpleItems={simpleItems}
          />
        </div>
      </div>
    </header>
  )
}
