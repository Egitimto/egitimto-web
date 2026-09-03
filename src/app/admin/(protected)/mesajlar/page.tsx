import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deleteMessage } from './actions'

export default async function AdminMesajlarPage() {
  await requireSection('mesajlar')
  const supabase = await createClient()
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">Gelen Mesajlar</h1>
      {!messages || messages.length === 0 ? (
        <p className="text-body-text">Henüz mesaj yok.</p>
      ) : (
        <AdminTable>
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="p-3">Tarih</th>
              <th className="p-3">Ad Soyad</th>
              <th className="p-3">E-posta</th>
              <th className="p-3">Konu</th>
              <th className="p-3">Mesaj</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id} className="border-b border-neutral-100 align-top">
                <td className="whitespace-nowrap p-3 text-xs text-neutral-500">
                  {new Date(msg.created_at).toLocaleString('tr-TR')}
                </td>
                <td className="p-3">{msg.full_name}</td>
                <td className="p-3">{msg.email}</td>
                <td className="p-3">{msg.subject}</td>
                <td className="max-w-xs p-3">{msg.message}</td>
                <td className="p-3 text-right">
                  <DeleteButton action={deleteMessage}>
                    <input type="hidden" name="id" value={msg.id} />
                  </DeleteButton>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  )
}
