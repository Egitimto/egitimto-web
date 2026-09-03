import Link from 'next/link'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { createCategory, deleteCategory, deleteMember } from './actions'

export default async function AdminEkibimizPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  await requireSection('ekibimiz')
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('team_categories')
    .select('*, team_members(*)')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">Ekibimiz</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {(categories ?? []).map((category) => (
        <section key={category.id} className="mb-8 rounded-xl border border-neutral-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display font-bold text-dark">{category.name_tr}</h2>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/ekibimiz/uye/new?category_id=${category.id}`}
                className="text-sm text-primary hover:underline"
              >
                + Üye Ekle
              </Link>
              <DeleteButton action={deleteCategory} label="Kategoriyi Sil">
                <input type="hidden" name="id" value={category.id} />
              </DeleteButton>
            </div>
          </div>
          <ul className="space-y-2">
            {((category.team_members ?? []) as { id: string; full_name: string; role_tr: string }[]).map(
              (member) => (
                <li key={member.id} className="flex items-center justify-between text-sm">
                  <span>
                    {member.full_name} — {member.role_tr}
                  </span>
                  <span className="space-x-3">
                    <Link href={`/admin/ekibimiz/uye/${member.id}`} className="text-primary hover:underline">
                      Düzenle
                    </Link>
                    <DeleteButton action={deleteMember}>
                      <input type="hidden" name="id" value={member.id} />
                    </DeleteButton>
                  </span>
                </li>
              )
            )}
          </ul>
        </section>
      ))}

      <section className="rounded-xl border border-dashed border-neutral-300 p-4">
        <h2 className="mb-3 font-display font-bold text-dark">Yeni Kategori</h2>
        <form action={createCategory} className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="name_tr" className="block text-sm font-medium text-body-text">
              Adı (TR)
            </label>
            <input id="name_tr" name="name_tr" required className="mt-1 rounded-lg border border-neutral-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="name_en" className="block text-sm font-medium text-body-text">
              Adı (EN)
            </label>
            <input id="name_en" name="name_en" required className="mt-1 rounded-lg border border-neutral-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="sort_order" className="block text-sm font-medium text-body-text">
              Sıra
            </label>
            <input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={0}
              className="mt-1 w-20 rounded-lg border border-neutral-300 px-3 py-2"
            />
          </div>
          <button type="submit" className="gradient-primary rounded-full px-4 py-2 text-sm font-semibold text-white">
            Ekle
          </button>
        </form>
      </section>
    </div>
  )
}
