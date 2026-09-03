import Link from 'next/link'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deleteDocument } from './actions'

export default async function AdminBelgelerPage() {
  await requireSection('belgeler')
  const supabase = await createClient()
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('year', { ascending: false })
    .order('sort_order', { ascending: true })

  const typeLabel = (type: string) => (type === 'beyanname' ? 'Beyanname' : 'Faaliyet Raporu')

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark">Belgeler</h1>
        <Link
          href="/admin/belgeler/new"
          className="gradient-primary rounded-full px-4 py-2 text-sm font-semibold text-white"
        >
          Yeni Belge
        </Link>
      </div>
      <AdminTable>
        <thead>
          <tr className="border-b border-neutral-200 text-left">
            <th className="p-3">Başlık</th>
            <th className="p-3">Tür</th>
            <th className="p-3">Yıl</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {(documents ?? []).map((item) => (
            <tr key={item.id} className="border-b border-neutral-100">
              <td className="p-3">{item.title}</td>
              <td className="p-3">{typeLabel(item.type)}</td>
              <td className="p-3">{item.year}</td>
              <td className="space-x-3 p-3 text-right">
                <Link href={`/admin/belgeler/${item.id}`} className="text-sm text-primary hover:underline">
                  Düzenle
                </Link>
                <DeleteButton action={deleteDocument}>
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
