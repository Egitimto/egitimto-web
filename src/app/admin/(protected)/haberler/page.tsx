import Link from 'next/link'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deleteNews } from './actions'

export default async function AdminHaberlerPage() {
  await requireSection('haberler')
  const supabase = await createClient()
  const { data: news } = await supabase.from('news').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark">Haberler</h1>
        <Link
          href="/admin/haberler/new"
          className="gradient-primary rounded-full px-4 py-2 text-sm font-semibold text-white"
        >
          Yeni Haber
        </Link>
      </div>
      <AdminTable>
        <thead>
          <tr className="border-b border-neutral-200 text-left">
            <th className="p-3">Başlık</th>
            <th className="p-3">Durum</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {(news ?? []).map((item) => (
            <tr key={item.id} className="border-b border-neutral-100">
              <td className="p-3">{item.title_tr}</td>
              <td className="p-3">{item.is_published ? 'Yayında' : 'Taslak'}</td>
              <td className="space-x-3 p-3 text-right">
                <Link href={`/admin/haberler/${item.id}`} className="text-sm text-primary hover:underline">
                  Düzenle
                </Link>
                <DeleteButton action={deleteNews}>
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
