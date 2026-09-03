import Link from 'next/link'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deletePartnership } from './actions'

export default async function AdminIsbirlikleriPage() {
  await requireSection('isbirlikleri')
  const supabase = await createClient()
  const { data: partnerships } = await supabase
    .from('partnerships')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark">İşbirlikleri</h1>
        <Link
          href="/admin/isbirlikleri/new"
          className="gradient-primary rounded-full px-4 py-2 text-sm font-semibold text-white"
        >
          Yeni İşbirliği
        </Link>
      </div>
      <AdminTable>
        <thead>
          <tr className="border-b border-neutral-200 text-left">
            <th className="p-3">İsim</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {(partnerships ?? []).map((item) => (
            <tr key={item.id} className="border-b border-neutral-100">
              <td className="p-3">{item.name}</td>
              <td className="space-x-3 p-3 text-right">
                <Link href={`/admin/isbirlikleri/${item.id}`} className="text-sm text-primary hover:underline">
                  Düzenle
                </Link>
                <DeleteButton action={deletePartnership}>
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
