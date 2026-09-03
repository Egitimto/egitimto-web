import Link from 'next/link'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { FeaturedToggleButton } from '@/components/admin/FeaturedToggleButton'
import { deleteEvent, toggleFeaturedEvent } from './actions'

export default async function AdminEtkinliklerPage() {
  await requireSection('etkinlikler')
  const supabase = await createClient()
  const { data: events } = await supabase.from('events').select('*').order('event_date', { ascending: false })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark">Eğitim ve Etkinlikler</h1>
        <Link
          href="/admin/etkinlikler/new"
          className="gradient-primary rounded-full px-4 py-2 text-sm font-semibold text-white"
        >
          Yeni Etkinlik
        </Link>
      </div>
      <AdminTable>
        <thead>
          <tr className="border-b border-neutral-200 text-left">
            <th className="p-3">Başlık</th>
            <th className="p-3">Tarih</th>
            <th className="p-3">Durum</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {(events ?? []).map((item) => (
            <tr key={item.id} className="border-b border-neutral-100">
              <td className="p-3">{item.title_tr}</td>
              <td className="p-3">{item.event_date ?? '—'}</td>
              <td className="p-3">
                {item.is_published ? 'Yayında' : 'Taslak'}
                {item.is_featured && <span className="ml-2 text-xs font-semibold text-primary">★ Öne Çıkan</span>}
              </td>
              <td className="space-x-3 p-3 text-right">
                <Link href={`/admin/etkinlikler/${item.id}`} className="text-sm text-primary hover:underline">
                  Düzenle
                </Link>
                <FeaturedToggleButton action={toggleFeaturedEvent} isFeatured={item.is_featured}>
                  <input type="hidden" name="id" value={item.id} />
                </FeaturedToggleButton>
                <DeleteButton action={deleteEvent}>
                  <input type="hidden" name="id" value={item.id} />
                </DeleteButton>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  )
}
