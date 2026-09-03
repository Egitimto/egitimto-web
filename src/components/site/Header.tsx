import Link from 'next/link'
import type { Locale } from '@/lib/supabase/types'
import { localize } from '@/lib/i18n/localize'
import { LocaleSwitcher } from './LocaleSwitcher'
import { NavDropdown } from './NavDropdown'

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

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold text-dark">
          Eğitim Teknoloji ve Oyun Derneği
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Ana menü">
          <NavDropdown label={localize('EğitimTO', 'EğitimTO', locale)} items={egitimtoItems} />
          <NavDropdown label={localize('Duyurular', 'Announcements', locale)} items={duyurularItems} />
          <Link href="/uygulamalarimiz" className="text-sm font-medium text-body-text hover:text-primary">
            {localize('Uygulamalarımız', 'Our Apps', locale)}
          </Link>
          <Link href="/alanlarimiz" className="text-sm font-medium text-body-text hover:text-primary">
            {localize('Alanlarımız', 'Our Focus Areas', locale)}
          </Link>
          <Link href="/destek-ol" className="text-sm font-medium text-body-text hover:text-primary">
            {localize('Destek Ol', 'Support Us', locale)}
          </Link>
          <Link href="/iletisim" className="text-sm font-medium text-body-text hover:text-primary">
            {localize('İletişim', 'Contact', locale)}
          </Link>
        </nav>
        <LocaleSwitcher locale={locale} />
      </div>
    </header>
  )
}
