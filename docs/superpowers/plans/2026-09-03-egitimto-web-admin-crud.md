# egitimto.org Web Sitesi — Faz 1 / Bölüm C: Admin İçerik Yönetimi (CRUD) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Haberler, Etkinlikler, Ekibimiz, İşbirlikleri, Hakkımızda, Belgeler ve Gelen Mesajlar için admin panelde tam CRUD (oluştur/düzenle/sil) ekranları kurmak — bu planın sonunda kod bilmeyen personel tüm public içeriği admin panelden yönetebilecek.

**Architecture:** Her bölüm için aynı üçlü dosya deseni (liste `page.tsx`, mutasyonlar `actions.ts`, form `[id]/page.tsx`) — Server Action'lar `createClient()` (server) ile yazar, `revalidatePath` ile hem admin hem public sayfayı tazeler. Dosya yükleme (fotoğraf/logo/kapak/PDF) ortak bir `uploadToStorage` yardımcı fonksiyonuyla mevcut Storage bucket'larına yapılır. Hata gösterimi mevcut login sayfası deseniyle tutarlı: `?error=` query param + redirect (ekstra client state yönetimi yok).

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase (`@supabase/ssr`), Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-09-03-egitimto-web-admin-crud-design.md`

## Global Constraints

- RBAC (spec §2): `AdminSection`'a `'belgeler'` ve `'mesajlar'` eklenir; `MODERATOR_SECTIONS` değişmez — bu iki bölüm yalnızca `admin` rolüne açık
- Ortak desen (spec §3): her bölüm `page.tsx` (liste) + `actions.ts` (mutasyonlar) + `[id]/page.tsx` (form, `id='new'` oluşturma için)
- TR/EN alanlar formda alt alta gösterilir, yan yana değil (spec §3 kararı)
- Dosya yükleme (spec §5): mevcut bucket'lar (`team-photos`, `partnership-logos`, `news-events-covers`, `document-files`) kullanılır, ayrı API route yok, hepsi Server Action içinde
- İçerik editörü: düz `textarea` (spec §1 kararı, WYSIWYG yok)
- Slug: başlıktan otomatik üretilir (`slugify`), form alanı düzenlenebilir kalır (spec §1 kararı)
- Sıralama: basit sayısal "Sıra" alanı (spec §1 kararı, sürükle-bırak yok)
- Gelen Mesajlar: yalnızca listele + sil, durum takibi yok (spec §1/§6.6 kararı)
- **Doğrulama verimliliği (kullanıcı talebi):** Her görev yalnızca `npm run build` ile doğrulanır ve commit edilir — tam manuel gezinme (dev server + tıklama/curl testi) yalnızca son görevde (Task 9), bir kez, tüm bölümleri kapsayacak şekilde yapılır. Ara görevlerde tekrar tekrar dev server açıp kapatılmaz.

---

### Task 1: RBAC Genişletmesi + Ortak Admin Bileşenleri

**Files:**
- Modify: `src/lib/auth/roles.ts`
- Modify: `src/lib/auth/roles.test.ts`
- Modify: `src/app/admin/(protected)/layout.tsx`
- Create: `src/lib/storage-upload.ts`
- Create: `src/components/admin/AdminTable.tsx`
- Create: `src/components/admin/FormField.tsx`
- Create: `src/components/admin/ImageUploadField.tsx`
- Create: `src/components/admin/DeleteButton.tsx`
- Create: `src/components/admin/PublishToggle.tsx`

**Interfaces:**
- Consumes: `createClient()` server (Bölüm A), `AdminSection`/`canAccessSection` (Bölüm A, genişletilecek)
- Produces: `AdminSection` artık `'belgeler' | 'mesajlar'` içerir; `uploadToStorage(supabase, bucket, file): Promise<string | null>`; `<AdminTable>`, `<FormField label htmlFor>`, `<ImageUploadField name label currentUrl?>`, `<DeleteButton action label?>`, `<PublishToggle defaultChecked?>`. Task 3-8'deki tüm CRUD ekranları bunları kullanır.

- [ ] **Step 1: `AdminSection` tipini genişlet**

`src/lib/auth/roles.ts` dosyasının tamamını şununla değiştir:

```ts
import type { Role } from '@/lib/supabase/types'

export type AdminSection =
  | 'haberler'
  | 'etkinlikler'
  | 'ekibimiz'
  | 'isbirlikleri'
  | 'hakkimizda'
  | 'belgeler'
  | 'mesajlar'

const MODERATOR_SECTIONS: AdminSection[] = ['haberler', 'etkinlikler']

export function canAccessSection(role: Role | null, section: AdminSection): boolean {
  if (role === 'admin') return true
  if (role === 'moderator') return MODERATOR_SECTIONS.includes(section)
  return false
}
```

- [ ] **Step 2: Testleri güncelle**

`src/lib/auth/roles.test.ts` dosyasının tamamını şununla değiştir:

```ts
import { describe, it, expect } from 'vitest'
import { canAccessSection } from './roles'

describe('canAccessSection', () => {
  it('allows admin to access every section', () => {
    expect(canAccessSection('admin', 'ekibimiz')).toBe(true)
    expect(canAccessSection('admin', 'haberler')).toBe(true)
    expect(canAccessSection('admin', 'belgeler')).toBe(true)
    expect(canAccessSection('admin', 'mesajlar')).toBe(true)
  })

  it('allows moderator to access only haberler and etkinlikler', () => {
    expect(canAccessSection('moderator', 'haberler')).toBe(true)
    expect(canAccessSection('moderator', 'etkinlikler')).toBe(true)
    expect(canAccessSection('moderator', 'ekibimiz')).toBe(false)
    expect(canAccessSection('moderator', 'isbirlikleri')).toBe(false)
    expect(canAccessSection('moderator', 'hakkimizda')).toBe(false)
    expect(canAccessSection('moderator', 'belgeler')).toBe(false)
    expect(canAccessSection('moderator', 'mesajlar')).toBe(false)
  })

  it('denies access when role is null', () => {
    expect(canAccessSection(null, 'haberler')).toBe(false)
  })
})
```

Run: `npm run test`
Expected: PASS (tüm testler, yeni assertion'lar dahil)

- [ ] **Step 3: Admin nav menüsüne 2 yeni bölüm ekle**

`src/app/admin/(protected)/layout.tsx` içindeki `NAV_ITEMS` sabitini şununla değiştir:

```ts
const NAV_ITEMS: { href: string; label: string; section: AdminSection }[] = [
  { href: '/admin/haberler', label: 'Haberler', section: 'haberler' },
  { href: '/admin/etkinlikler', label: 'Eğitim ve Etkinlikler', section: 'etkinlikler' },
  { href: '/admin/ekibimiz', label: 'Ekibimiz', section: 'ekibimiz' },
  { href: '/admin/isbirlikleri', label: 'İşbirlikleri', section: 'isbirlikleri' },
  { href: '/admin/hakkimizda', label: 'Hakkımızda', section: 'hakkimizda' },
  { href: '/admin/belgeler', label: 'Belgeler', section: 'belgeler' },
  { href: '/admin/mesajlar', label: 'Gelen Mesajlar', section: 'mesajlar' },
]
```

- [ ] **Step 4: Storage yükleme yardımcı fonksiyonunu yaz**

`src/lib/storage-upload.ts`:

```ts
import type { createClient } from './supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function uploadToStorage(
  supabase: SupabaseServerClient,
  bucket: string,
  file: File
): Promise<string | null> {
  if (!file || file.size === 0) return null

  const path = `${crypto.randomUUID()}-${file.name}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) return null

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
```

- [ ] **Step 5: Ortak admin bileşenlerini yaz**

`src/components/admin/AdminTable.tsx`:

```tsx
export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}
```

`src/components/admin/FormField.tsx`:

```tsx
export function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-body-text">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  )
}
```

`src/components/admin/ImageUploadField.tsx`:

```tsx
import Image from 'next/image'

export function ImageUploadField({
  name,
  label,
  currentUrl,
}: {
  name: string
  label: string
  currentUrl?: string | null
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-body-text">
        {label}
      </label>
      {currentUrl && (
        <Image
          src={currentUrl}
          alt=""
          width={120}
          height={120}
          className="mt-2 rounded-lg object-cover"
          unoptimized
        />
      )}
      <input id={name} name={name} type="file" accept="image/*" className="mt-2 block w-full text-sm" />
    </div>
  )
}
```

`src/components/admin/DeleteButton.tsx`:

```tsx
'use client'

export function DeleteButton({
  action,
  children,
  label = 'Sil',
}: {
  action: (formData: FormData) => void | Promise<void>
  children?: React.ReactNode
  label?: string
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
          e.preventDefault()
        }
      }}
      className="inline"
    >
      {children}
      <button type="submit" className="text-sm text-red-600 hover:underline">
        {label}
      </button>
    </form>
  )
}
```

`src/components/admin/PublishToggle.tsx`:

```tsx
export function PublishToggle({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-body-text">
      <input type="checkbox" name="is_published" defaultChecked={defaultChecked} />
      Yayınla
    </label>
  )
}
```

- [ ] **Step 6: Build ile doğrula**

Run: `npm run build`
Expected: Hatasız derlenir.

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth/roles.ts src/lib/auth/roles.test.ts "src/app/admin/(protected)/layout.tsx" src/lib/storage-upload.ts src/components/admin
git commit -m "RBAC'ı Belgeler/Gelen Mesajlar için genişlet, ortak admin bileşenlerini ekle"
```

---

### Task 2: `slugify` Yardımcı Fonksiyonu

**Files:**
- Create: `src/lib/slugify.ts`
- Create: `src/lib/slugify.test.ts`

**Interfaces:**
- Produces: `slugify(text: string): string`. Task 3'teki Haberler/Etkinlikler `actions.ts` bunu kullanır.

- [ ] **Step 1: Başarısız olan testi yaz**

`src/lib/slugify.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('converts Turkish characters to ASCII and lowercases', () => {
    expect(slugify('İlk Bültenimiz Yayınlandı')).toBe('ilk-bultenimiz-yayinlandi')
  })

  it('replaces non-alphanumeric characters with hyphens', () => {
    expect(slugify('Deneme Etkinlik!')).toBe('deneme-etkinlik')
  })

  it('collapses multiple separators and trims leading/trailing hyphens', () => {
    expect(slugify('  Boşluklu   Başlık  ')).toBe('bosluklu-baslik')
  })
})
```

Run: `npm run test`
Expected: FAIL — `./slugify` henüz mevcut değil.

- [ ] **Step 2: `slugify` fonksiyonunu yaz**

`src/lib/slugify.ts`:

```ts
const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: 'c', Ç: 'c',
  ğ: 'g', Ğ: 'g',
  ı: 'i', İ: 'i',
  ö: 'o', Ö: 'o',
  ş: 's', Ş: 's',
  ü: 'u', Ü: 'u',
}

export function slugify(text: string): string {
  return text
    .split('')
    .map((ch) => TURKISH_CHAR_MAP[ch] ?? ch)
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 3: Testi çalıştırıp geçtiğini doğrula**

Run: `npm run test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/slugify.ts src/lib/slugify.test.ts
git commit -m "slugify yardımcı fonksiyonunu ekle"
```

---

### Task 3: Haberler ve Etkinlikler CRUD

**Files:**
- Create: `src/app/admin/(protected)/haberler/page.tsx`
- Create: `src/app/admin/(protected)/haberler/actions.ts`
- Create: `src/app/admin/(protected)/haberler/[id]/page.tsx`
- Create: `src/app/admin/(protected)/etkinlikler/page.tsx`
- Create: `src/app/admin/(protected)/etkinlikler/actions.ts`
- Create: `src/app/admin/(protected)/etkinlikler/[id]/page.tsx`

**Interfaces:**
- Consumes: `requireSection` (Bölüm A), `uploadToStorage`, `slugify`, `AdminTable`/`FormField`/`ImageUploadField`/`DeleteButton`/`PublishToggle` (Task 1-2)
- Produces: `/admin/haberler`, `/admin/haberler/[id]`, `/admin/etkinlikler`, `/admin/etkinlikler/[id]` route'ları; `upsertNews`/`deleteNews`/`upsertEvent`/`deleteEvent` Server Action'ları.

- [ ] **Step 1: Haberler Server Action'larını yaz**

`src/app/admin/(protected)/haberler/actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage-upload'
import { slugify } from '@/lib/slugify'

export async function upsertNews(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const titleTr = String(formData.get('title_tr') ?? '').trim()
  const titleEn = String(formData.get('title_en') ?? '').trim()
  const contentTr = String(formData.get('content_tr') ?? '')
  const contentEn = String(formData.get('content_en') ?? '')
  let slug = String(formData.get('slug') ?? '').trim()
  const isPublished = formData.get('is_published') === 'on'
  const showApplyButton = formData.get('show_apply_button') === 'on'
  const applyButtonUrl = String(formData.get('apply_button_url') ?? '').trim() || null

  if (!titleTr || !titleEn) {
    redirect(`/admin/haberler/${id || 'new'}?error=${encodeURIComponent('Başlık alanları zorunludur.')}`)
  }

  if (!slug) slug = slugify(titleTr)

  const supabase = await createClient()

  const coverFile = formData.get('cover_image') as File | null
  const uploadedCover = coverFile ? await uploadToStorage(supabase, 'news-events-covers', coverFile) : null
  const existingCover = String(formData.get('existing_cover_image') ?? '') || null
  const coverImage = uploadedCover ?? existingCover

  const payload = {
    title_tr: titleTr,
    title_en: titleEn,
    content_tr: contentTr,
    content_en: contentEn,
    slug,
    is_published: isPublished,
    show_apply_button: showApplyButton,
    apply_button_url: showApplyButton ? applyButtonUrl : null,
    cover_image: coverImage,
  }

  const query = id
    ? supabase.from('news').update(payload).eq('id', id)
    : supabase.from('news').insert(payload)

  const { error } = await query

  if (error) {
    redirect(`/admin/haberler/${id || 'new'}?error=${encodeURIComponent('Kayıt sırasında bir hata oluştu: ' + error.message)}`)
  }

  revalidatePath('/admin/haberler')
  revalidatePath('/haberler')
  redirect('/admin/haberler')
}

export async function deleteNews(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('news').delete().eq('id', id)
  revalidatePath('/admin/haberler')
  revalidatePath('/haberler')
}
```

- [ ] **Step 2: Haberler liste sayfasını yaz**

`src/app/admin/(protected)/haberler/page.tsx`:

```tsx
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
```

- [ ] **Step 3: Haber oluştur/düzenle formunu yaz**

`src/app/admin/(protected)/haberler/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { FormField } from '@/components/admin/FormField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { PublishToggle } from '@/components/admin/PublishToggle'
import { upsertNews } from '../actions'

export default async function AdminHaberFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  await requireSection('haberler')
  const { id } = await params
  const { error } = await searchParams
  const isNew = id === 'new'

  const supabase = await createClient()
  const item = isNew ? null : (await supabase.from('news').select('*').eq('id', id).single()).data

  if (!isNew && !item) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">
        {isNew ? 'Yeni Haber' : 'Haberi Düzenle'}
      </h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={upsertNews} className="space-y-4">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <input type="hidden" name="existing_cover_image" value={item?.cover_image ?? ''} />

        <FormField label="Başlık (TR)" htmlFor="title_tr">
          <input
            id="title_tr"
            name="title_tr"
            defaultValue={item?.title_tr}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Başlık (EN)" htmlFor="title_en">
          <input
            id="title_en"
            name="title_en"
            defaultValue={item?.title_en}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Slug (boş bırakılırsa başlıktan otomatik üretilir)" htmlFor="slug">
          <input
            id="slug"
            name="slug"
            defaultValue={item?.slug}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="İçerik (TR)" htmlFor="content_tr">
          <textarea
            id="content_tr"
            name="content_tr"
            defaultValue={item?.content_tr}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="İçerik (EN)" htmlFor="content_en">
          <textarea
            id="content_en"
            name="content_en"
            defaultValue={item?.content_en}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <ImageUploadField name="cover_image" label="Kapak Görseli" currentUrl={item?.cover_image} />

        <label className="flex items-center gap-2 text-sm text-body-text">
          <input type="checkbox" name="show_apply_button" defaultChecked={item?.show_apply_button ?? false} />
          Başvuru butonu göster
        </label>
        <FormField label="Başvuru URL'si" htmlFor="apply_button_url">
          <input
            id="apply_button_url"
            name="apply_button_url"
            defaultValue={item?.apply_button_url ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>

        <PublishToggle defaultChecked={item?.is_published ?? false} />

        <button type="submit" className="gradient-primary rounded-full px-6 py-2 font-semibold text-white">
          Kaydet
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Etkinlikler Server Action'larını yaz**

`src/app/admin/(protected)/etkinlikler/actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage-upload'
import { slugify } from '@/lib/slugify'

export async function upsertEvent(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const titleTr = String(formData.get('title_tr') ?? '').trim()
  const titleEn = String(formData.get('title_en') ?? '').trim()
  const contentTr = String(formData.get('content_tr') ?? '')
  const contentEn = String(formData.get('content_en') ?? '')
  let slug = String(formData.get('slug') ?? '').trim()
  const isPublished = formData.get('is_published') === 'on'
  const showApplyButton = formData.get('show_apply_button') === 'on'
  const applyButtonUrl = String(formData.get('apply_button_url') ?? '').trim() || null
  const eventDate = String(formData.get('event_date') ?? '').trim() || null
  const location = String(formData.get('location') ?? '').trim() || null

  if (!titleTr || !titleEn) {
    redirect(`/admin/etkinlikler/${id || 'new'}?error=${encodeURIComponent('Başlık alanları zorunludur.')}`)
  }

  if (!slug) slug = slugify(titleTr)

  const supabase = await createClient()

  const coverFile = formData.get('cover_image') as File | null
  const uploadedCover = coverFile ? await uploadToStorage(supabase, 'news-events-covers', coverFile) : null
  const existingCover = String(formData.get('existing_cover_image') ?? '') || null
  const coverImage = uploadedCover ?? existingCover

  const payload = {
    title_tr: titleTr,
    title_en: titleEn,
    content_tr: contentTr,
    content_en: contentEn,
    slug,
    is_published: isPublished,
    show_apply_button: showApplyButton,
    apply_button_url: showApplyButton ? applyButtonUrl : null,
    cover_image: coverImage,
    event_date: eventDate,
    location,
  }

  const query = id
    ? supabase.from('events').update(payload).eq('id', id)
    : supabase.from('events').insert(payload)

  const { error } = await query

  if (error) {
    redirect(`/admin/etkinlikler/${id || 'new'}?error=${encodeURIComponent('Kayıt sırasında bir hata oluştu: ' + error.message)}`)
  }

  revalidatePath('/admin/etkinlikler')
  revalidatePath('/etkinlikler')
  redirect('/admin/etkinlikler')
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('events').delete().eq('id', id)
  revalidatePath('/admin/etkinlikler')
  revalidatePath('/etkinlikler')
}
```

- [ ] **Step 5: Etkinlikler liste sayfasını yaz**

`src/app/admin/(protected)/etkinlikler/page.tsx`:

```tsx
import Link from 'next/link'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deleteEvent } from './actions'

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
              <td className="p-3">{item.is_published ? 'Yayında' : 'Taslak'}</td>
              <td className="space-x-3 p-3 text-right">
                <Link href={`/admin/etkinlikler/${item.id}`} className="text-sm text-primary hover:underline">
                  Düzenle
                </Link>
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
```

- [ ] **Step 6: Etkinlik oluştur/düzenle formunu yaz**

`src/app/admin/(protected)/etkinlikler/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { FormField } from '@/components/admin/FormField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { PublishToggle } from '@/components/admin/PublishToggle'
import { upsertEvent } from '../actions'

export default async function AdminEtkinlikFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  await requireSection('etkinlikler')
  const { id } = await params
  const { error } = await searchParams
  const isNew = id === 'new'

  const supabase = await createClient()
  const item = isNew ? null : (await supabase.from('events').select('*').eq('id', id).single()).data

  if (!isNew && !item) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">
        {isNew ? 'Yeni Etkinlik' : 'Etkinliği Düzenle'}
      </h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={upsertEvent} className="space-y-4">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <input type="hidden" name="existing_cover_image" value={item?.cover_image ?? ''} />

        <FormField label="Başlık (TR)" htmlFor="title_tr">
          <input
            id="title_tr"
            name="title_tr"
            defaultValue={item?.title_tr}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Başlık (EN)" htmlFor="title_en">
          <input
            id="title_en"
            name="title_en"
            defaultValue={item?.title_en}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Slug (boş bırakılırsa başlıktan otomatik üretilir)" htmlFor="slug">
          <input
            id="slug"
            name="slug"
            defaultValue={item?.slug}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Tarih" htmlFor="event_date">
          <input
            id="event_date"
            name="event_date"
            type="date"
            defaultValue={item?.event_date ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Konum" htmlFor="location">
          <input
            id="location"
            name="location"
            defaultValue={item?.location ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="İçerik (TR)" htmlFor="content_tr">
          <textarea
            id="content_tr"
            name="content_tr"
            defaultValue={item?.content_tr}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="İçerik (EN)" htmlFor="content_en">
          <textarea
            id="content_en"
            name="content_en"
            defaultValue={item?.content_en}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <ImageUploadField name="cover_image" label="Kapak Görseli" currentUrl={item?.cover_image} />

        <label className="flex items-center gap-2 text-sm text-body-text">
          <input type="checkbox" name="show_apply_button" defaultChecked={item?.show_apply_button ?? false} />
          Başvuru butonu göster
        </label>
        <FormField label="Başvuru URL'si" htmlFor="apply_button_url">
          <input
            id="apply_button_url"
            name="apply_button_url"
            defaultValue={item?.apply_button_url ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>

        <PublishToggle defaultChecked={item?.is_published ?? false} />

        <button type="submit" className="gradient-primary rounded-full px-6 py-2 font-semibold text-white">
          Kaydet
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 7: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 8: Commit**

```bash
git add "src/app/admin/(protected)/haberler" "src/app/admin/(protected)/etkinlikler"
git commit -m "Haberler ve Etkinlikler için admin CRUD ekranlarını ekle"
```

---

### Task 4: Ekibimiz CRUD (Kategoriler + Üyeler)

**Files:**
- Create: `src/app/admin/(protected)/ekibimiz/page.tsx`
- Create: `src/app/admin/(protected)/ekibimiz/actions.ts`
- Create: `src/app/admin/(protected)/ekibimiz/uye/[id]/page.tsx`

**Interfaces:**
- Consumes: `requireSection`, `uploadToStorage`, `FormField`/`ImageUploadField`/`DeleteButton` (Task 1)
- Produces: `/admin/ekibimiz`, `/admin/ekibimiz/uye/[id]` route'ları; `createCategory`/`deleteCategory`/`upsertMember`/`deleteMember` Server Action'ları.

- [ ] **Step 1: Server Action'ları yaz**

`src/app/admin/(protected)/ekibimiz/actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage-upload'

export async function createCategory(formData: FormData) {
  const nameTr = String(formData.get('name_tr') ?? '').trim()
  const nameEn = String(formData.get('name_en') ?? '').trim()
  const sortOrder = Number(formData.get('sort_order') ?? 0)

  if (!nameTr || !nameEn) {
    redirect(`/admin/ekibimiz?error=${encodeURIComponent('Kategori adları zorunludur.')}`)
  }

  const supabase = await createClient()
  await supabase.from('team_categories').insert({ name_tr: nameTr, name_en: nameEn, sort_order: sortOrder })
  revalidatePath('/admin/ekibimiz')
  revalidatePath('/ekibimiz')
  redirect('/admin/ekibimiz')
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('team_categories').delete().eq('id', id)
  revalidatePath('/admin/ekibimiz')
  revalidatePath('/ekibimiz')
}

export async function upsertMember(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const categoryId = String(formData.get('category_id') ?? '')
  const fullName = String(formData.get('full_name') ?? '').trim()
  const roleTr = String(formData.get('role_tr') ?? '').trim()
  const roleEn = String(formData.get('role_en') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim() || null
  const sortOrder = Number(formData.get('sort_order') ?? 0)
  const instagram = String(formData.get('instagram') ?? '').trim()
  const linkedin = String(formData.get('linkedin') ?? '').trim()
  const twitter = String(formData.get('twitter') ?? '').trim()

  if (!categoryId || !fullName || !roleTr || !roleEn) {
    redirect(`/admin/ekibimiz/uye/${id || 'new'}?error=${encodeURIComponent('Zorunlu alanları doldurun.')}`)
  }

  const supabase = await createClient()

  const photoFile = formData.get('photo_url') as File | null
  const uploadedPhoto = photoFile ? await uploadToStorage(supabase, 'team-photos', photoFile) : null
  const existingPhoto = String(formData.get('existing_photo_url') ?? '') || null
  const photoUrl = uploadedPhoto ?? existingPhoto

  const socialLinks: Record<string, string> = {}
  if (instagram) socialLinks.instagram = instagram
  if (linkedin) socialLinks.linkedin = linkedin
  if (twitter) socialLinks.twitter = twitter
  if (email) socialLinks.email = email

  const payload = {
    category_id: categoryId,
    full_name: fullName,
    role_tr: roleTr,
    role_en: roleEn,
    email,
    photo_url: photoUrl,
    sort_order: sortOrder,
    social_links: socialLinks,
  }

  const query = id
    ? supabase.from('team_members').update(payload).eq('id', id)
    : supabase.from('team_members').insert(payload)

  const { error } = await query

  if (error) {
    redirect(`/admin/ekibimiz/uye/${id || 'new'}?error=${encodeURIComponent('Kayıt sırasında bir hata oluştu: ' + error.message)}`)
  }

  revalidatePath('/admin/ekibimiz')
  revalidatePath('/ekibimiz')
  redirect('/admin/ekibimiz')
}

export async function deleteMember(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('team_members').delete().eq('id', id)
  revalidatePath('/admin/ekibimiz')
  revalidatePath('/ekibimiz')
}
```

- [ ] **Step 2: Liste sayfasını yaz (kategoriler + üyeler + yeni kategori formu)**

`src/app/admin/(protected)/ekibimiz/page.tsx`:

```tsx
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
```

- [ ] **Step 3: Üye oluştur/düzenle formunu yaz**

`src/app/admin/(protected)/ekibimiz/uye/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { FormField } from '@/components/admin/FormField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { upsertMember } from '../../actions'

export default async function AdminUyeFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; category_id?: string }>
}) {
  await requireSection('ekibimiz')
  const { id } = await params
  const { error, category_id: presetCategoryId } = await searchParams
  const isNew = id === 'new'

  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('team_categories')
    .select('*')
    .order('sort_order', { ascending: true })
  const item = isNew ? null : (await supabase.from('team_members').select('*').eq('id', id).single()).data

  if (!isNew && !item) notFound()

  const socialLinks = (item?.social_links ?? {}) as Record<string, string>

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">{isNew ? 'Yeni Üye' : 'Üyeyi Düzenle'}</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={upsertMember} className="space-y-4">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <input type="hidden" name="existing_photo_url" value={item?.photo_url ?? ''} />

        <FormField label="Kategori" htmlFor="category_id">
          <select
            id="category_id"
            name="category_id"
            defaultValue={item?.category_id ?? presetCategoryId ?? ''}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            <option value="" disabled>
              Seçiniz
            </option>
            {(categories ?? []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_tr}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Ad Soyad" htmlFor="full_name">
          <input
            id="full_name"
            name="full_name"
            defaultValue={item?.full_name}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Görev (TR)" htmlFor="role_tr">
          <input
            id="role_tr"
            name="role_tr"
            defaultValue={item?.role_tr}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Görev (EN)" htmlFor="role_en">
          <input
            id="role_en"
            name="role_en"
            defaultValue={item?.role_en}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="E-posta" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={item?.email ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Instagram URL" htmlFor="instagram">
          <input
            id="instagram"
            name="instagram"
            defaultValue={socialLinks.instagram ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="LinkedIn URL" htmlFor="linkedin">
          <input
            id="linkedin"
            name="linkedin"
            defaultValue={socialLinks.linkedin ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Twitter URL" htmlFor="twitter">
          <input
            id="twitter"
            name="twitter"
            defaultValue={socialLinks.twitter ?? ''}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <ImageUploadField name="photo_url" label="Fotoğraf" currentUrl={item?.photo_url} />
        <FormField label="Sıra" htmlFor="sort_order">
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={item?.sort_order ?? 0}
            className="w-24 rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>

        <button type="submit" className="gradient-primary rounded-full px-6 py-2 font-semibold text-white">
          Kaydet
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(protected)/ekibimiz"
git commit -m "Ekibimiz için admin CRUD ekranlarını (kategoriler + üyeler) ekle"
```

---

### Task 5: İşbirlikleri CRUD

**Files:**
- Create: `src/app/admin/(protected)/isbirlikleri/page.tsx`
- Create: `src/app/admin/(protected)/isbirlikleri/actions.ts`
- Create: `src/app/admin/(protected)/isbirlikleri/[id]/page.tsx`

**Interfaces:**
- Consumes: `requireSection`, `uploadToStorage`, `AdminTable`/`FormField`/`ImageUploadField`/`DeleteButton` (Task 1)
- Produces: `/admin/isbirlikleri`, `/admin/isbirlikleri/[id]` route'ları; `upsertPartnership`/`deletePartnership` Server Action'ları.

- [ ] **Step 1: Server Action'ları yaz**

`src/app/admin/(protected)/isbirlikleri/actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage-upload'

export async function upsertPartnership(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const descriptionTr = String(formData.get('project_description_tr') ?? '')
  const descriptionEn = String(formData.get('project_description_en') ?? '')
  const sortOrder = Number(formData.get('sort_order') ?? 0)

  if (!name) {
    redirect(`/admin/isbirlikleri/${id || 'new'}?error=${encodeURIComponent('İsim zorunludur.')}`)
  }

  const supabase = await createClient()

  const logoFile = formData.get('logo_url') as File | null
  const uploadedLogo = logoFile ? await uploadToStorage(supabase, 'partnership-logos', logoFile) : null
  const existingLogo = String(formData.get('existing_logo_url') ?? '') || null
  const logoUrl = uploadedLogo ?? existingLogo

  if (!logoUrl) {
    redirect(`/admin/isbirlikleri/${id || 'new'}?error=${encodeURIComponent('Logo zorunludur.')}`)
  }

  const payload = {
    name,
    project_description_tr: descriptionTr,
    project_description_en: descriptionEn,
    sort_order: sortOrder,
    logo_url: logoUrl,
  }

  const query = id
    ? supabase.from('partnerships').update(payload).eq('id', id)
    : supabase.from('partnerships').insert(payload)

  const { error } = await query

  if (error) {
    redirect(`/admin/isbirlikleri/${id || 'new'}?error=${encodeURIComponent('Kayıt sırasında bir hata oluştu: ' + error.message)}`)
  }

  revalidatePath('/admin/isbirlikleri')
  revalidatePath('/isbirlikleri')
  redirect('/admin/isbirlikleri')
}

export async function deletePartnership(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('partnerships').delete().eq('id', id)
  revalidatePath('/admin/isbirlikleri')
  revalidatePath('/isbirlikleri')
}
```

- [ ] **Step 2: Liste sayfasını yaz**

`src/app/admin/(protected)/isbirlikleri/page.tsx`:

```tsx
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
```

- [ ] **Step 3: Oluştur/düzenle formunu yaz**

`src/app/admin/(protected)/isbirlikleri/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { FormField } from '@/components/admin/FormField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { upsertPartnership } from '../actions'

export default async function AdminIsbirlikFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  await requireSection('isbirlikleri')
  const { id } = await params
  const { error } = await searchParams
  const isNew = id === 'new'

  const supabase = await createClient()
  const item = isNew ? null : (await supabase.from('partnerships').select('*').eq('id', id).single()).data

  if (!isNew && !item) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">
        {isNew ? 'Yeni İşbirliği' : 'İşbirliğini Düzenle'}
      </h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={upsertPartnership} className="space-y-4">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <input type="hidden" name="existing_logo_url" value={item?.logo_url ?? ''} />

        <FormField label="İsim" htmlFor="name">
          <input
            id="name"
            name="name"
            defaultValue={item?.name}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Proje Açıklaması (TR)" htmlFor="project_description_tr">
          <textarea
            id="project_description_tr"
            name="project_description_tr"
            defaultValue={item?.project_description_tr}
            rows={4}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Proje Açıklaması (EN)" htmlFor="project_description_en">
          <textarea
            id="project_description_en"
            name="project_description_en"
            defaultValue={item?.project_description_en}
            rows={4}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <ImageUploadField name="logo_url" label="Logo" currentUrl={item?.logo_url} />
        <FormField label="Sıra" htmlFor="sort_order">
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={item?.sort_order ?? 0}
            className="w-24 rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>

        <button type="submit" className="gradient-primary rounded-full px-6 py-2 font-semibold text-white">
          Kaydet
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(protected)/isbirlikleri"
git commit -m "İşbirlikleri için admin CRUD ekranlarını ekle"
```

---

### Task 6: Belgeler CRUD

**Files:**
- Create: `src/app/admin/(protected)/belgeler/page.tsx`
- Create: `src/app/admin/(protected)/belgeler/actions.ts`
- Create: `src/app/admin/(protected)/belgeler/[id]/page.tsx`

**Interfaces:**
- Consumes: `requireSection`, `uploadToStorage`, `AdminTable`/`FormField`/`DeleteButton` (Task 1)
- Produces: `/admin/belgeler`, `/admin/belgeler/[id]` route'ları; `upsertDocument`/`deleteDocument` Server Action'ları.

- [ ] **Step 1: Server Action'ları yaz**

`src/app/admin/(protected)/belgeler/actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage-upload'

export async function upsertDocument(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const type = String(formData.get('type') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const year = Number(formData.get('year') ?? 0)
  const sortOrder = Number(formData.get('sort_order') ?? 0)

  if (!title || (type !== 'beyanname' && type !== 'faaliyet_raporu') || !year) {
    redirect(`/admin/belgeler/${id || 'new'}?error=${encodeURIComponent('Tüm zorunlu alanları doldurun.')}`)
  }

  const supabase = await createClient()

  const pdfFile = formData.get('pdf_url') as File | null
  const uploadedPdf = pdfFile ? await uploadToStorage(supabase, 'document-files', pdfFile) : null
  const existingPdf = String(formData.get('existing_pdf_url') ?? '') || null
  const pdfUrl = uploadedPdf ?? existingPdf

  if (!pdfUrl) {
    redirect(`/admin/belgeler/${id || 'new'}?error=${encodeURIComponent('PDF dosyası zorunludur.')}`)
  }

  const payload = { type, title, year, sort_order: sortOrder, pdf_url: pdfUrl }

  const query = id
    ? supabase.from('documents').update(payload).eq('id', id)
    : supabase.from('documents').insert(payload)

  const { error } = await query

  if (error) {
    redirect(`/admin/belgeler/${id || 'new'}?error=${encodeURIComponent('Kayıt sırasında bir hata oluştu: ' + error.message)}`)
  }

  revalidatePath('/admin/belgeler')
  revalidatePath('/hakkimizda')
  redirect('/admin/belgeler')
}

export async function deleteDocument(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('documents').delete().eq('id', id)
  revalidatePath('/admin/belgeler')
  revalidatePath('/hakkimizda')
}
```

- [ ] **Step 2: Liste sayfasını yaz**

`src/app/admin/(protected)/belgeler/page.tsx`:

```tsx
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
```

- [ ] **Step 3: Oluştur/düzenle formunu yaz**

`src/app/admin/(protected)/belgeler/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { FormField } from '@/components/admin/FormField'
import { upsertDocument } from '../actions'

export default async function AdminBelgeFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  await requireSection('belgeler')
  const { id } = await params
  const { error } = await searchParams
  const isNew = id === 'new'

  const supabase = await createClient()
  const item = isNew ? null : (await supabase.from('documents').select('*').eq('id', id).single()).data

  if (!isNew && !item) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">
        {isNew ? 'Yeni Belge' : 'Belgeyi Düzenle'}
      </h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={upsertDocument} className="space-y-4">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <input type="hidden" name="existing_pdf_url" value={item?.pdf_url ?? ''} />

        <FormField label="Tür" htmlFor="type">
          <select
            id="type"
            name="type"
            defaultValue={item?.type ?? 'beyanname'}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          >
            <option value="beyanname">Beyanname</option>
            <option value="faaliyet_raporu">Faaliyet Raporu</option>
          </select>
        </FormField>
        <FormField label="Başlık" htmlFor="title">
          <input
            id="title"
            name="title"
            defaultValue={item?.title}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Yıl" htmlFor="year">
          <input
            id="year"
            name="year"
            type="number"
            defaultValue={item?.year}
            required
            className="w-32 rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="PDF Dosyası" htmlFor="pdf_url">
          <input id="pdf_url" name="pdf_url" type="file" accept="application/pdf" className="block w-full text-sm" />
          {item?.pdf_url && (
            <a
              href={item.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-primary hover:underline"
            >
              Mevcut dosyayı görüntüle
            </a>
          )}
        </FormField>
        <FormField label="Sıra" htmlFor="sort_order">
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={item?.sort_order ?? 0}
            className="w-24 rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>

        <button type="submit" className="gradient-primary rounded-full px-6 py-2 font-semibold text-white">
          Kaydet
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(protected)/belgeler"
git commit -m "Belgeler için admin CRUD ekranlarını ekle"
```

---

### Task 7: Hakkımızda Düzenleme Formu

**Files:**
- Create: `src/app/admin/(protected)/hakkimizda/page.tsx`
- Create: `src/app/admin/(protected)/hakkimizda/actions.ts`

**Interfaces:**
- Consumes: `requireSection`, `uploadToStorage`, `FormField` (Task 1)
- Produces: `/admin/hakkimizda` route (liste yok, tekil form); `updateAboutContent` Server Action'ı.

- [ ] **Step 1: Server Action'ı yaz**

`src/app/admin/(protected)/hakkimizda/actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/storage-upload'

export async function updateAboutContent(formData: FormData) {
  const supabase = await createClient()

  const tuzukFile = formData.get('tuzuk_pdf_url') as File | null
  const uploadedTuzuk = tuzukFile ? await uploadToStorage(supabase, 'document-files', tuzukFile) : null
  const existingTuzuk = String(formData.get('existing_tuzuk_pdf_url') ?? '') || null
  const tuzukPdfUrl = uploadedTuzuk ?? existingTuzuk

  const payload = {
    kurulus_tr: String(formData.get('kurulus_tr') ?? ''),
    kurulus_en: String(formData.get('kurulus_en') ?? ''),
    amac_ilkeler_tr: String(formData.get('amac_ilkeler_tr') ?? ''),
    amac_ilkeler_en: String(formData.get('amac_ilkeler_en') ?? ''),
    vizyon_tr: String(formData.get('vizyon_tr') ?? ''),
    vizyon_en: String(formData.get('vizyon_en') ?? ''),
    degerler_tr: String(formData.get('degerler_tr') ?? ''),
    degerler_en: String(formData.get('degerler_en') ?? ''),
    tuzuk_pdf_url: tuzukPdfUrl,
  }

  const { error } = await supabase.from('about_content').update(payload).eq('id', 1)

  if (error) {
    redirect(`/admin/hakkimizda?error=${encodeURIComponent('Kayıt sırasında bir hata oluştu: ' + error.message)}`)
  }

  revalidatePath('/admin/hakkimizda')
  revalidatePath('/hakkimizda')
  redirect('/admin/hakkimizda?success=1')
}
```

- [ ] **Step 2: Formu yaz**

`src/app/admin/(protected)/hakkimizda/page.tsx`:

```tsx
import { requireSection } from '@/lib/auth/require-section'
import { createClient } from '@/lib/supabase/server'
import { FormField } from '@/components/admin/FormField'
import { updateAboutContent } from './actions'

export default async function AdminHakkimizdaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  await requireSection('hakkimizda')
  const { error, success } = await searchParams
  const supabase = await createClient()
  const { data: about } = await supabase.from('about_content').select('*').eq('id', 1).single()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-dark">Hakkımızda</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Kaydedildi.</p>}
      <form action={updateAboutContent} className="space-y-4">
        <input type="hidden" name="existing_tuzuk_pdf_url" value={about?.tuzuk_pdf_url ?? ''} />

        <FormField label="Derneğin Kuruluşu (TR)" htmlFor="kurulus_tr">
          <textarea
            id="kurulus_tr"
            name="kurulus_tr"
            defaultValue={about?.kurulus_tr}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Derneğin Kuruluşu (EN)" htmlFor="kurulus_en">
          <textarea
            id="kurulus_en"
            name="kurulus_en"
            defaultValue={about?.kurulus_en}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Amaç ve Misyon (TR)" htmlFor="amac_ilkeler_tr">
          <textarea
            id="amac_ilkeler_tr"
            name="amac_ilkeler_tr"
            defaultValue={about?.amac_ilkeler_tr}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Amaç ve Misyon (EN)" htmlFor="amac_ilkeler_en">
          <textarea
            id="amac_ilkeler_en"
            name="amac_ilkeler_en"
            defaultValue={about?.amac_ilkeler_en}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Vizyon (TR)" htmlFor="vizyon_tr">
          <textarea
            id="vizyon_tr"
            name="vizyon_tr"
            defaultValue={about?.vizyon_tr}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Vizyon (EN)" htmlFor="vizyon_en">
          <textarea
            id="vizyon_en"
            name="vizyon_en"
            defaultValue={about?.vizyon_en}
            rows={5}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Değerlerimiz (TR) — her satır 'Başlık: Açıklama' formatında" htmlFor="degerler_tr">
          <textarea
            id="degerler_tr"
            name="degerler_tr"
            defaultValue={about?.degerler_tr}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Değerlerimiz (EN)" htmlFor="degerler_en">
          <textarea
            id="degerler_en"
            name="degerler_en"
            defaultValue={about?.degerler_en}
            rows={6}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="Tüzük PDF" htmlFor="tuzuk_pdf_url">
          <input
            id="tuzuk_pdf_url"
            name="tuzuk_pdf_url"
            type="file"
            accept="application/pdf"
            className="block w-full text-sm"
          />
          {about?.tuzuk_pdf_url && (
            <a
              href={about.tuzuk_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-primary hover:underline"
            >
              Mevcut dosyayı görüntüle
            </a>
          )}
        </FormField>

        <button type="submit" className="gradient-primary rounded-full px-6 py-2 font-semibold text-white">
          Kaydet
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(protected)/hakkimizda"
git commit -m "Hakkımızda düzenleme formunu ekle"
```

---

### Task 8: Gelen Mesajlar (Liste + Sil)

**Files:**
- Create: `src/app/admin/(protected)/mesajlar/page.tsx`
- Create: `src/app/admin/(protected)/mesajlar/actions.ts`

**Interfaces:**
- Consumes: `requireSection`, `AdminTable`/`DeleteButton` (Task 1)
- Produces: `/admin/mesajlar` route; `deleteMessage` Server Action'ı.

- [ ] **Step 1: Server Action'ı yaz**

`src/app/admin/(protected)/mesajlar/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteMessage(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('contact_messages').delete().eq('id', id)
  revalidatePath('/admin/mesajlar')
}
```

- [ ] **Step 2: Liste sayfasını yaz**

`src/app/admin/(protected)/mesajlar/page.tsx`:

```tsx
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
```

- [ ] **Step 3: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(protected)/mesajlar"
git commit -m "Gelen Mesajlar admin ekranını ekle"
```

---

### Task 9: Son Doğrulama ve Deploy

**Files:** Yok (yalnızca doğrulama ve deploy)

- [ ] **Step 1: Tam build + lint + typecheck + test**

```bash
npm run lint
npm run typecheck
npm run build
npm run test
```

Expected: Hepsi hatasız/PASS.

- [ ] **Step 2: Tek seferlik kapsamlı manuel doğrulama**

`npm run dev` çalıştır ve sırasıyla doğrula (bu planın tek dev-server oturumu):

1. `dev@egitimto.org` ile `/admin` girişi yap, sol menüde artık **Belgeler** ve **Gelen Mesajlar**'ın da göründüğünü doğrula
2. Haberler: "Yeni Haber" ile bir taslak oluştur (kapak görseli yükle), listede görün, düzenle, yayınla işaretle, `/haberler`'de göründüğünü doğrula, sil
3. Etkinlikler: aynı akışı `event_date`/`location` ile tekrarla
4. Ekibimiz: yeni kategori ekle, o kategoriye fotoğraflı bir üye ekle, `/ekibimiz`'de göründüğünü doğrula, üyeyi ve kategoriyi sil
5. İşbirlikleri: logo yükleyerek bir kayıt oluştur, `/isbirlikleri`'de göründüğünü doğrula, sil
6. Belgeler: bir PDF yükleyerek bir Beyanname ekle, `/hakkimizda`'da Beyannameler listesinde göründüğünü doğrula, sil
7. Hakkımızda: bir alanı değiştirip kaydet, `/hakkimizda`'da güncellendiğini doğrula
8. Gelen Mesajlar: public `/iletisim` formundan bir test mesajı gönder, `/admin/mesajlar`'da göründüğünü doğrula, sil
9. Moderatör rolüyle giriş yap (veya rolü geçici `moderator` yap), sol menüde yalnızca Haberler+Etkinlikler'in göründüğünü, `/admin/belgeler`'e doğrudan gidildiğinde `/admin`'e yönlendirildiğini doğrula; rolü tekrar `admin`'e al
10. Sunucuyu durdur

- [ ] **Step 3: Vercel'e push et**

```bash
git push origin main
```

Vercel deploy'unun başarılı olduğunu (dashboard'dan veya kullanıcıdan) doğrula.

---

## Self-Review Notu

- **Spec kapsaması:** §2 (RBAC) → Task 1; §3 (ortak desen) → tüm görevler; §4 (ortak bileşenler) → Task 1; §5 (dosya yükleme) → Task 1 (`uploadToStorage`) + her CRUD görevi; §6.1-6.6 (bölüm bazlı alanlar) → Task 3-8 birebir eşleşiyor; §7 (`slugify`) → Task 2; §8 (test stratejisi, doğrulama verimliliği) → her görevde tek `npm run build`, kapsamlı manuel test yalnızca Task 9'da.
- **Placeholder taraması:** Tüm Server Action'lar ve form bileşenleri gerçek, çalışan kod içeriyor; "TODO" veya "Task 3'teki gibi yap" yok — Etkinlikler, İşbirlikleri, Belgeler gibi Haberler'e benzeyen görevler için de tam kod ayrı ayrı yazıldı.
- **Tip tutarlılığı:** `uploadToStorage(supabase, bucket, file)` imzası Task 1'de tanımlanıp Task 3-7'de birebir aynı şekilde çağrılıyor; `AdminSection`'a eklenen `'belgeler'`/`'mesajlar'` değerleri `requireSection('belgeler')`/`requireSection('mesajlar')` çağrılarıyla (Task 6, Task 8) tutarlı; `FormField`/`ImageUploadField`/`DeleteButton`/`PublishToggle`/`AdminTable` prop imzaları Task 1'de tanımlandığı gibi tüm sonraki görevlerde kullanılıyor.
