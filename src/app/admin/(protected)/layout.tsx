import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentRole } from '@/lib/auth/get-current-role'
import { canAccessSection, type AdminSection } from '@/lib/auth/roles'
import { signOut } from '../actions'

const NAV_ITEMS: { href: string; label: string; section: AdminSection }[] = [
  { href: '/admin/haberler', label: 'Haberler', section: 'haberler' },
  { href: '/admin/etkinlikler', label: 'Eğitim ve Etkinlikler', section: 'etkinlikler' },
  { href: '/admin/ekibimiz', label: 'Ekibimiz', section: 'ekibimiz' },
  { href: '/admin/isbirlikleri', label: 'İşbirlikleri', section: 'isbirlikleri' },
  { href: '/admin/hakkimizda', label: 'Hakkımızda', section: 'hakkimizda' },
  { href: '/admin/belgeler', label: 'Belgeler', section: 'belgeler' },
  { href: '/admin/mesajlar', label: 'Gelen Mesajlar', section: 'mesajlar' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentRole()

  if (!role) {
    redirect('/admin/login')
  }

  const visibleItems = NAV_ITEMS.filter((item) => canAccessSection(role, item.section))

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-neutral-200 bg-white p-4">
        <h1 className="mb-4 font-display text-lg font-bold text-dark">Yönetim Paneli</h1>
        <nav className="space-y-1" aria-label="Yönetim paneli menüsü">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-body-text hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-6">
          <button type="submit" className="text-sm text-neutral-500 hover:text-dark">
            Çıkış Yap
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
