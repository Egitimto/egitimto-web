# egitimto.org Web Sitesi — Faz 1 / Bölüm B: Public Sayfalar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** egitimto.org'un tüm public (herkese açık) sayfalarını — Ana Sayfa, Hakkımızda, Ekibimiz, İşbirlikleri, Duyurular (Haberler/Etkinlikler/Projeler), Uygulamalarımız, Alanlarımız, Destek Ol, İletişim, Yasal sayfalar ve site geneli Header/Footer — canlı siteden taşınan gerçek içerikle, TR/EN dil desteğiyle inşa etmek. Bu planın sonunda site Vercel'de tam işlevsel, gezinebilir, boş state'leri düzgün gösteren bir halde canlı olacak.

**Architecture:** Next.js 16 App Router, Server Component'ler ile Supabase'den okuma (CMS-beslemeli bölümler: Ekibimiz, İşbirlikleri, Haberler, Etkinlikler, Hakkımızda metinleri) + statik/hardcode sayfalar (Ana Sayfa, Alanlarımız, Destek Ol, İletişim metni, Yasal sayfalar — spec gereği bu fazda CMS yok). Statik metin içerikleri `src/content/` altında ayrı TS veri dosyalarında tutulur (sayfa bileşenlerini okunaklı tutmak için). Bölüm A'da kurulmuş `localize()`/`getLocale()` (cookie tabanlı) ve `createClient()` (server/browser) aynen kullanılır.

**Tech Stack:** Next.js 16.3.4, React 19, TypeScript, Tailwind CSS v4, Supabase (`@supabase/ssr`).

**Spec:** `docs/superpowers/specs/2026-09-03-egitimto-web-public-pages-design.md` (ve ön koşul: `docs/superpowers/specs/2026-09-02-egitimto-web-rebuild-design.md`)

## Global Constraints

- Route şeması düz, iç içe önek yok (spec §3): `/hakkimizda`, `/ekibimiz`, `/isbirlikleri`, `/haberler`, `/etkinlikler`, `/projeler`, `/uygulamalarimiz`, `/alanlarimiz`, `/destek-ol`, `/iletisim`, `/yasal/tuzuk`, `/yasal/kvkk`, `/yasal/etik-ilkeler`, `/yasal/sss`
- Boş state politikası (spec §2, §5): Haberler, Etkinlikler, İşbirlikleri, Beyannameler, Faaliyet Raporları, Tüzük PDF — hiçbiri seed edilmez, hepsi nazik bir "henüz içerik eklenmedi" durumuyla başlar
- Ekibimiz seed verisi (spec §5.2): 5 gerçek kişi, fotosuz — Erhan KOÇ (Yönetim Kurulu Başkanı), Alican DİŞLİTAŞ (Yönetim Kurulu Başkan Yardımcısı), Göksel KÖSE (Genel Sekreter), Nuri KARAGÖZOĞLU (Sayman), Orhan AYVALLI (Kurucu Üye / **Founding Member**)
- Alanlarımız: 8 kart, hardcode, CMS yok (spec §5.6)
- Çeviri düzeltmeleri (spec §2): KVKK onay metninde "GDPR" ifadesi kullanılmaz; Orhan AYVALLI'nın EN unvanı "Founding Member"dır ("Board Member" değil)
- **Bu planın kararı (spec'e ek, YAGNI gerekçeli):** Ana Sayfa/Hakkımızda'da kullanılan statik görseller (hero, about-1/2/3, logo) Supabase Storage'a değil, doğrudan `public/images/` klasörüne konur — bu görseller admin tarafından düzenlenmediği için Storage/RLS/auth karmaşıklığına gerek yok
- **Bu planın kararı:** Canlı sitenin `?lang=en` sürümü Alanlarımız ve Yasal (KVKK/Etik/SSS) sayfalarında gerçekte çevrilmemiş (Türkçe dönüyor) — bu iki bölüm için İngilizce metni bu plan içinde iş seviyesinde çeviri olarak sağlanır (profesyonel çeviri değil, anlamı doğru aktaran bir çeviri)
- i18n: `localize(tr, en, locale)` (`src/lib/i18n/localize.ts`, Bölüm A) ve `getLocale()` (`src/lib/i18n/locale.ts`, Bölüm A) kullanılır — yeni bir mekanizma kurulmaz
- Test stratejisi: Bölüm A ile tutarlı — bu plandaki görevlerin büyük çoğunluğu sunum bileşenleri/statik içerik; saf mantık içeren tek yeni parça (dil değiştirme Server Action'ı) `next/headers`e bağımlı olduğu için birim testi yazılmaz, `npm run build` + `npm run dev` ile manuel doğrulanır
- Kod stili: Bölüm A'daki dosyalarla tutarlı — `'use client'` yalnızca gerçekten interaktif (state/etkileşim) bileşenlerde, Tailwind utility sınıfları (`bg-primary`, `font-display`, `text-body-text`, `.gradient-primary`, `.gradient-cream` — `src/app/globals.css`, Bölüm A)

---

### Task 1: Veri Modeli Genişletmesi (about_content + contact_messages)

**Files:**
- Create: `supabase/migrations/add_public_pages_schema.sql` (yerel kopya; gerçek dosya adı Supabase MCP tarafından zaman damgasıyla oluşturulur)
- Modify: `src/lib/supabase/database.types.ts` (yeniden üretilir, elle düzenlenmez)
- Modify: `src/lib/supabase/types.ts`

**Interfaces:**
- Consumes: `about_content` tablosu (Bölüm A, `id=1` satırı zaten mevcut)
- Produces: `about_content` tablosuna 6 yeni sütun (`kurulus_tr/en`, `vizyon_tr/en`, `degerler_tr/en`); yeni tablo `contact_messages`; tip `ContactMessage` (`src/lib/supabase/types.ts`). Task 5 (Hakkımızda) ve Task 12 (İletişim) bunları kullanır.

- [ ] **Step 1: Migration SQL'ini yaz**

`supabase/migrations/add_public_pages_schema.sql`:

```sql
alter table public.about_content
  add column kurulus_tr text not null default '',
  add column kurulus_en text not null default '',
  add column vizyon_tr text not null default '',
  add column vizyon_en text not null default '',
  add column degerler_tr text not null default '',
  add column degerler_en text not null default '';

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "contact_messages_public_insert" on public.contact_messages
  for insert to anon, authenticated with check (true);

create policy "contact_messages_staff_read" on public.contact_messages
  for select to authenticated
  using ((select public.current_user_role()) in ('admin', 'moderator'));
```

- [ ] **Step 2: Migration'ı Supabase projesine uygula**

Supabase MCP aracını kullan:
1. `mcp__plugin_supabase_supabase__list_projects` ile `egitimto-web` projesinin `project_id`'sini bul
2. `mcp__plugin_supabase_supabase__apply_migration` ile `name: "add_public_pages_schema"`, `query`: yukarıdaki SQL

- [ ] **Step 3: Doğrula**

1. `mcp__plugin_supabase_supabase__list_tables` çalıştır, `contact_messages`'ın `rls_enabled: true` ile listelendiğini ve `about_content`'in 6 yeni sütunu içerdiğini doğrula
2. `mcp__plugin_supabase_supabase__get_advisors` (tür: `security`) çalıştır, yeni tabloyla ilgili uyarı olmadığını doğrula

- [ ] **Step 4: TypeScript tiplerini yeniden üret**

`mcp__plugin_supabase_supabase__generate_typescript_types` çalıştır (`project_id` ile), dönen içeriği birebir `src/lib/supabase/database.types.ts` dosyasının tamamının yerine yaz.

- [ ] **Step 5: `ContactMessage` tipini ekle**

`src/lib/supabase/types.ts` dosyasındaki son satıra ekle:

```ts
export type ContactMessage = Tables<'contact_messages'>
```

- [ ] **Step 6: Build ile doğrula**

Run: `npm run build`
Expected: Hatasız derlenir (yeni `about_content` alanları `AboutContent` tipine otomatik yansır).

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations src/lib/supabase/database.types.ts src/lib/supabase/types.ts
git commit -m "about_content'i genişlet, contact_messages tablosunu ekle"
```

---

### Task 2: Ortak Sunum Bileşenleri

**Files:**
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/SectionHeading.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/PdfDownloadButton.tsx`

**Interfaces:**
- Produces: `<Card>`, `<SectionHeading title subtitle? />`, `<EmptyState message />`, `<PdfDownloadButton url={string|null} label />`. Bu planın tüm sonraki sayfa görevleri bunları kullanır.

- [ ] **Step 1: `Card.tsx`'i yaz**

```tsx
import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: `SectionHeading.tsx`'i yaz**

```tsx
export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="font-display text-3xl font-bold text-dark">{title}</h2>
      {subtitle && <p className="mt-2 text-body-text">{subtitle}</p>}
    </div>
  )
}
```

- [ ] **Step 3: `EmptyState.tsx`'i yaz**

```tsx
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="gradient-cream rounded-2xl px-6 py-16 text-center">
      <p className="text-body-text">{message}</p>
    </div>
  )
}
```

- [ ] **Step 4: `PdfDownloadButton.tsx`'i yaz**

```tsx
export function PdfDownloadButton({
  url,
  label,
  unavailableLabel,
}: {
  url: string | null
  label: string
  unavailableLabel: string
}) {
  if (!url) {
    return (
      <span className="inline-block cursor-not-allowed rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-400">
        {unavailableLabel}
      </span>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="gradient-primary inline-block rounded-full px-5 py-2 text-sm font-semibold text-white"
    >
      {label}
    </a>
  )
}
```

- [ ] **Step 5: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 6: Commit**

```bash
git add src/components/ui
git commit -m "Ortak sunum bileşenlerini (Card, SectionHeading, EmptyState, PdfDownloadButton) ekle"
```

---

### Task 3: Header, Footer, Dil Değiştirici ve Root Layout

**Files:**
- Create: `src/lib/i18n/actions.ts`
- Create: `src/content/contact-info.ts`
- Create: `src/components/site/LocaleSwitcher.tsx`
- Create: `src/components/site/NavDropdown.tsx`
- Create: `src/components/site/Header.tsx`
- Create: `src/components/site/Footer.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `getLocale()`, `LOCALE_COOKIE` (`src/lib/i18n/locale.ts`, Bölüm A), `localize()` (Bölüm A)
- Produces: `setLocale(formData)` Server Action; `CONTACT_INFO` sabiti (`src/content/contact-info.ts`) — Task 12 (İletişim) da bunu kullanır; `<Header locale />`, `<Footer locale />` — `RootLayout` bunları sarmalar, sonraki tüm sayfa görevleri otomatik olarak içine yerleşir.

- [ ] **Step 1: İletişim bilgilerini içerik dosyasına yaz**

`src/content/contact-info.ts`:

```ts
export const CONTACT_INFO = {
  address: 'Fahrettin Altay, 65/20. Sk. No:14A, 35140 Karabağlar/İzmir',
  email: 'info@egitimto.org',
  collaborationEmail: 'isbirligi@egitimto.org',
  ethicsEmail: 'etik@egitimto.org',
  pressEmail: 'basin@egitimto.org',
  registryNumber: '35-088-084',
  hours: {
    tr: 'Pzt-Cuma 09:00-18:00, Cmt 09:00-13:00, Pazar kapalı',
    en: 'Mon-Fri 09:00-18:00, Sat 09:00-13:00, Closed on Sundays',
  },
  socials: {
    twitter: 'https://twitter.com/egitimto',
    facebook: 'https://facebook.com/egitimto',
    instagram: 'https://instagram.com/egitimto',
    youtube: 'https://youtube.com/egitimto',
    linkedin: 'https://linkedin.com/company/egitimto',
  },
}
```

- [ ] **Step 2: Dil değiştirme Server Action'ını yaz**

`src/lib/i18n/actions.ts`:

```ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LOCALE_COOKIE } from './locale'

export async function setLocale(formData: FormData) {
  const locale = formData.get('locale') === 'en' ? 'en' : 'tr'
  const path = String(formData.get('path') ?? '/')

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  redirect(path)
}
```

- [ ] **Step 3: `LocaleSwitcher.tsx`'i yaz**

```tsx
'use client'

import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/supabase/types'
import { setLocale } from '@/lib/i18n/actions'

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-2 text-sm">
      {(['tr', 'en'] as const).map((target) => (
        <form key={target} action={setLocale}>
          <input type="hidden" name="locale" value={target} />
          <input type="hidden" name="path" value={pathname} />
          <button
            type="submit"
            className={
              locale === target
                ? 'font-semibold text-primary'
                : 'text-neutral-400 hover:text-body-text'
            }
            aria-current={locale === target}
          >
            {target === 'tr' ? 'TR' : 'EN'}
          </button>
        </form>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: `NavDropdown.tsx`'i yaz**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

export function NavDropdown({
  label,
  items,
}: {
  label: string
  items: { href: string; label: string }[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-body-text hover:text-primary"
        aria-expanded={open}
      >
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 min-w-48 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-body-text hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: `Header.tsx`'i yaz**

```tsx
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
```

- [ ] **Step 6: `Footer.tsx`'i yaz**

```tsx
import Link from 'next/link'
import type { Locale } from '@/lib/supabase/types'
import { localize } from '@/lib/i18n/localize'
import { CONTACT_INFO } from '@/content/contact-info'

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="mt-auto bg-dark text-neutral-300">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm text-neutral-400">
          {localize(
            `www.egitimto.org, Eğitim Teknoloji ve Oyun Derneği'nin resmi internet sitesidir. Dernek Kütük No: ${CONTACT_INFO.registryNumber}`,
            `www.egitimto.org is the official website of the Education, Technology and Gaming Association. Association Registry No: ${CONTACT_INFO.registryNumber}`,
            locale
          )}
        </p>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 font-display font-semibold text-white">
              {localize('Yasal', 'Legal', locale)}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/yasal/tuzuk">{localize('Dernek Tüzüğü', 'Association Charter', locale)}</Link></li>
              <li><Link href="/yasal/kvkk">{localize('KVKK ve Gizlilik Politikası', 'Privacy Policy', locale)}</Link></li>
              <li><Link href="/yasal/etik-ilkeler">{localize('Etik İlkeler', 'Ethical Principles', locale)}</Link></li>
              <li><Link href="/yasal/sss">{localize('SSS', 'FAQ', locale)}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-display font-semibold text-white">
              {localize('İletişim', 'Contact', locale)}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>{CONTACT_INFO.address}</li>
              <li>{CONTACT_INFO.email}</li>
              <li>{localize('Dernek Kütük No', 'Registry No', locale)}: {CONTACT_INFO.registryNumber}</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-display font-semibold text-white">
              {localize('Sosyal Medya', 'Social Media', locale)}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href={CONTACT_INFO.socials.instagram}>Instagram</a></li>
              <li><a href={CONTACT_INFO.socials.linkedin}>LinkedIn</a></li>
              <li><a href={CONTACT_INFO.socials.facebook}>Facebook</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-xs text-neutral-500">
          © {new Date().getFullYear()} Eğitim Teknoloji ve Oyun Derneği
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 7: `RootLayout`'u Header/Footer ile güncelle**

`src/app/layout.tsx` dosyasının tamamını şununla değiştir:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { getLocale } from "@/lib/i18n/locale";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eğitim Teknoloji ve Oyun Derneği",
  description: "Eğitimde fırsat eşitliği için birlikte çalışıyoruz.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
```

**Not:** `/admin/*` rotaları kendi `layout.tsx`'ine sahip olduğu için (Bölüm A, `src/app/admin/(protected)/layout.tsx`) bu değişiklik admin panelini etkilemez — admin sayfaları Next.js'in layout iç içe geçme kuralına göre root layout'u da miras alır (`<html>`/`<body>` ve artık Header/Footer'ı da), bu istenmeyen bir görünüm olabilir. Bunu Step 8'de doğrula.

- [ ] **Step 8: Admin panelinin görünümünü kontrol et**

`npm run dev` çalıştır, `http://localhost:3000/admin/login` adresine git. Root layout'taki Header/Footer admin sayfalarının üstünde/altında görünüyorsa (istenmeyen), `src/app/admin/layout.tsx` dosyasını oluşturup içine sadece `{children}` döndüren minimal bir layout koy:

```tsx
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

Bu, `/admin/*` altındaki tüm rotalar için public Header/Footer'ı iptal eder (Next.js route group/layout override kuralı). Sunucuyu durdur.

- [ ] **Step 9: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 10: Manuel doğrula**

1. `npm run dev` çalıştır
2. `http://localhost:3000` adresine git, Header'da EğitimTO ve Duyurular dropdown'larının açılıp kapandığını doğrula
3. Dil değiştiriciden EN'e tıkla → sayfa `en` locale ile yeniden render edilir, menü metinleri İngilizceye döner, aynı sayfada kal (redirect path korunuyor) doğrula
4. TR'ye geri dön
5. Sunucuyu durdur

- [ ] **Step 11: Commit**

```bash
git add src/lib/i18n/actions.ts src/content/contact-info.ts src/components/site src/app/layout.tsx src/app/admin/layout.tsx
git commit -m "Header, Footer ve dil değiştiriciyi ekle, root layout'u güncelle"
```

---

### Task 4: Ana Sayfa

**Files:**
- Create: `public/images/hero.jpg`
- Create: `public/images/logo.png`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getLocale()`, `localize()` (Bölüm A)
- Produces: `/` route'unun nihai içeriği.

- [ ] **Step 1: Görselleri indir**

```bash
curl -sL "https://egitimto.org/assets/images/hero-image.jpg" -o public/images/hero.jpg
curl -sL "https://egitimto.org/assets/images/logo1.png" -o public/images/logo.png
```

- [ ] **Step 2: `page.tsx`'i yaz**

`src/app/page.tsx` dosyasının tamamını şununla değiştir:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'

const STATS = [
  { value: '500+', tr: 'Öğrenci', en: 'Students' },
  { value: '25+', tr: 'Projeler', en: 'Projects' },
  { value: '15+', tr: 'Şehir', en: 'Cities' },
]

const WHAT_WE_DO = [
  {
    href: '/uygulamalarimiz',
    tr: { title: 'Uygulamalarımız', description: 'Projelerimizi takip etmek için uygulamalarımıza göz atın.' },
    en: { title: 'Our Apps', description: 'Check out our apps to follow our projects.' },
  },
  {
    href: '/destek-ol',
    tr: { title: 'Destek Ol', description: 'Projelerimize destek olun, toplumsal değişime katkı sağlayın.' },
    en: { title: 'Support Us', description: 'Support our projects and contribute to social change.' },
  },
  {
    href: '/iletisim',
    tr: { title: 'İletişim', description: 'Bize ulaşın, sorularınızı sorun.' },
    en: { title: 'Contact', description: 'Contact us, ask your questions.' },
  },
]

const FOCUS_AREAS = [
  { tr: 'Eğitim & Teknoloji', en: 'Education & Technology' },
  { tr: 'Oyun & Öğrenme', en: 'Gaming & Learning' },
  { tr: 'Dijital Okuryazarlık', en: 'Digital Literacy' },
  { tr: 'Gençlik & Gönüllülük', en: 'Youth & Volunteering' },
]

export default async function Home() {
  const locale = await getLocale()

  return (
    <>
      <section className="gradient-cream px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full bg-white px-4 py-1 text-sm font-medium text-primary">
            🎓 {localize('Eğitim Teknoloji ve Oyun Derneği', 'Education, Technology and Gaming Association', locale)}
          </span>
          <h1 className="font-display text-4xl font-bold text-dark sm:text-5xl">
            {localize('Eğitimde Fırsat Eşitliği İçin Birlikte', 'Together for Equal Opportunities in Education', locale)}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-body-text">
            {localize(
              'Eğitim, teknoloji ve oyun alanlarında toplumsal fayda sağlamak için çalışan bir sivil toplum kuruluşu.',
              'A civil society organization working to provide social benefit in the fields of education, technology and gaming.',
              locale
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/hakkimizda" className="gradient-primary rounded-full px-6 py-3 font-semibold text-white">
              {localize('Projelerimizi İncele', 'Explore Our Projects', locale)}
            </Link>
            <Link href="/destek-ol" className="rounded-full border border-primary px-6 py-3 font-semibold text-primary">
              {localize('Destek Ol', 'Support Us', locale)}
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <div key={stat.tr}>
                <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-body-text">{localize(stat.tr, stat.en, locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          title={localize('Neler Yapıyoruz?', 'What Do We Do?', locale)}
          subtitle={localize(
            'Eğitim, teknoloji ve oyun alanlarındaki faaliyetlerimizle toplumsal değişime katkı sağlıyoruz',
            'We contribute to social change through our activities in education, technology and gaming',
            locale
          )}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {WHAT_WE_DO.map((item) => {
            const content = locale === 'en' ? item.en : item.tr
            return (
              <Card key={item.href}>
                <h3 className="font-display text-lg font-bold text-dark">{content.title}</h3>
                <p className="mt-2 text-sm text-body-text">{content.description}</p>
                <Link href={item.href} className="mt-4 inline-block text-sm font-semibold text-primary">
                  {localize('Devamını Gör →', 'Learn More →', locale)}
                </Link>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading title={localize('Son Haberler', 'Latest News', locale)} />
        <EmptyState
          message={localize(
            'Henüz yayınlanmış bir haber yok, yakında burada olacak.',
            'No news has been published yet — check back soon.',
            locale
          )}
        />
      </section>

      <section className="gradient-cream px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 sm:grid-cols-2">
          <Image src="/images/hero.jpg" alt="" width={600} height={400} className="rounded-2xl" />
          <div>
            <h2 className="font-display text-2xl font-bold text-dark">
              {localize('Biz Kimiz?', 'Who Are We?', locale)}
            </h2>
            <p className="mt-4 text-body-text">
              {localize(
                'Eğitim Teknoloji ve Oyun Derneği, eğitimde yenilikçi yaklaşımları destekleyen bir sivil toplum kuruluşudur. Eğitim ve teknoloji alanında çalışan uzmanlar, akademisyenler ve gönüllüler tarafından kurulmuştur.',
                'Education, Technology and Gaming Association is a civil society organization that supports innovative approaches in education. Founded by experts, academics and volunteers working in the field of education and technology.',
                locale
              )}
            </p>
            <Link href="/hakkimizda" className="mt-4 inline-block font-semibold text-primary">
              {localize('Daha Fazla Bilgi →', 'More Information →', locale)}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading title={localize('Faaliyet Alanlarımız', 'Our Areas of Activity', locale)} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FOCUS_AREAS.map((area) => (
            <Card key={area.tr} className="text-center">
              <p className="font-medium text-dark">{localize(area.tr, area.en, locale)}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/alanlarimiz" className="font-semibold text-primary">
            {localize('Tüm Alanlar →', 'All Areas →', locale)}
          </Link>
        </div>
      </section>

      <section className="gradient-primary px-6 py-16 text-center text-white">
        <h2 className="font-display text-2xl font-bold">
          {localize('Siz de Bize Katılın!', 'Join Us Too!', locale)}
        </h2>
        <Link href="/destek-ol" className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-primary">
          {localize('Destek Ol', 'Support Us', locale)}
        </Link>
      </section>
    </>
  )
}
```

- [ ] **Step 3: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 4: Manuel doğrula**

`npm run dev`, `http://localhost:3000` adresinde tüm bölümlerin göründüğünü, görsellerin yüklendiğini, dil değiştirmenin çalıştığını doğrula. Sunucuyu durdur.

- [ ] **Step 5: Commit**

```bash
git add public/images/hero.jpg public/images/logo.png src/app/page.tsx
git commit -m "Ana Sayfayı canlı siteden taşınan içerikle inşa et"
```

---

### Task 5: Hakkımızda

**Files:**
- Create: `public/images/about-1.jpg`, `public/images/about-2.jpg`, `public/images/about-3.jpg`
- Create: `src/app/hakkimizda/page.tsx`

**Interfaces:**
- Consumes: `createClient()` server (Bölüm A), `AboutContent`/`Document` tipleri (Bölüm A/Task 1), `PdfDownloadButton`/`EmptyState`/`SectionHeading` (Task 2)
- Produces: `/hakkimizda` route.

- [ ] **Step 1: Görselleri indir**

```bash
curl -sL "https://egitimto.org/assets/images/about-1.jpg" -o public/images/about-1.jpg
curl -sL "https://egitimto.org/assets/images/about-2.jpg" -o public/images/about-2.jpg
curl -sL "https://egitimto.org/assets/images/about-3.jpg" -o public/images/about-3.jpg
```

- [ ] **Step 2: `about_content` satırını gerçek içerikle güncelle**

Supabase MCP `mcp__plugin_supabase_supabase__execute_sql` ile (`project_id` ile) çalıştır:

```sql
update public.about_content set
  kurulus_tr = 'Eğitim, Teknoloji ve Oyun Derneği (EĞİTİMTO), eğitimde yenilikçi yaklaşımları desteklemek amacıyla 2025 yılında İzmir''de kurulmuştur. Derneğimiz, eğitim ve teknoloji alanında çalışan uzmanlar, akademisyenler ve gönüllüler tarafından bir araya getirilmiştir.

Kuruluş amacımız, eğitimde teknoloji ve oyun temelli yaklaşımları yaygınlaştırarak, öğrenme süreçlerini daha etkili ve keyifli hale getirmektir. Derneğimiz, Türkiye''nin dijital dönüşüm sürecine katkıda bulunmayı ve toplumun her kesiminin bu dönüşümden faydalanmasını sağlamayı hedeflemektedir.',
  kurulus_en = 'Education, Technology and Gaming Association (EĞİTİMTO) was founded in 2025 in İzmir to support innovative approaches in education. Our association was brought together by experts, academics and volunteers working in the field of education and technology.

Our founding purpose is to make learning processes more effective and enjoyable by spreading technology and game-based approaches in education. Our association aims to contribute to Turkey''s digital transformation process and ensure that all segments of society benefit from this transformation.',
  amac_ilkeler_tr = 'Derneğimizin temel amacı, eğitim alanında teknoloji ve oyun temelli yaklaşımları yaygınlaştırmak, dijital okuryazarlığı artırmak ve bu alanlarda toplumsal fayda sağlayacak projeler geliştirmektir.

Misyonumuz:
- Eğitimde teknoloji kullanımını yaygınlaştırmak
- Oyun temelli öğrenme yaklaşımlarını geliştirmek ve uygulamak
- Dijital okuryazarlık becerilerini toplumun her kesimine kazandırmak
- Eğitimde fırsat eşitliğini desteklemek
- Teknoloji ve oyun alanlarında araştırma ve geliştirme çalışmaları yapmak
- Ulusal ve uluslararası işbirlikleri geliştirmek',
  amac_ilkeler_en = 'The main purpose of our association is to spread technology and game-based approaches in the field of education, increase digital literacy and develop projects that will provide social benefit in these areas.

Our mission:
- To spread the use of technology in education
- To develop and implement game-based learning approaches
- To provide digital literacy skills to all segments of society
- To support equal opportunity in education
- To conduct research and development studies in technology and gaming fields
- To develop national and international collaborations',
  vizyon_tr = 'Eğitim, Teknoloji ve Oyun Derneği olarak vizyonumuz, Türkiye''de ve dünyada eğitim alanında teknoloji ve oyun temelli yaklaşımların öncüsü olmak ve bu alanlarda yenilikçi projeler geliştirerek toplumsal dönüşüme katkı sağlamaktır.

Gelecek hedeflerimiz:
- Eğitim kurumlarında teknoloji ve oyun temelli öğrenme yaklaşımlarının yaygınlaşmasını sağlamak
- Dijital okuryazarlık konusunda ulusal bir referans merkezi haline gelmek
- Uluslararası işbirlikleri ile global ölçekte projeler geliştirmek
- Eğitim teknolojileri ve oyun alanlarında araştırma ve geliştirme çalışmalarını desteklemek
- Toplumun dezavantajlı kesimlerinin dijital dönüşüme adaptasyonunu kolaylaştırmak',
  vizyon_en = 'As the Education, Technology and Gaming Association, our vision is to be a pioneer in technology and game-based approaches in the field of education in Turkey and the world, and to contribute to social transformation by developing innovative projects in these areas.

Our future goals:
- To ensure the spread of technology and game-based learning approaches in educational institutions
- To become a national reference center for digital literacy
- To develop global-scale projects through international collaborations
- To support research and development studies in educational technologies and gaming fields
- To facilitate the adaptation of disadvantaged segments of society to digital transformation',
  degerler_tr = 'Fırsat Eşitliği: Toplumun her kesiminin eğitim ve teknoloji imkanlarına eşit şekilde erişebilmesini sağlamak için çalışıyoruz.
Şeffaflık: Tüm faaliyetlerimizde ve kaynak kullanımımızda şeffaflığı ve hesap verebilirliği esas alıyoruz.
Gönüllülük: Gönüllülük esasına dayalı çalışmalarla toplumsal fayda sağlamayı ve dayanışmayı güçlendirmeyi hedefliyoruz.
Yenilikçilik: Eğitim ve teknoloji alanlarında yenilikçi yaklaşımları destekliyor ve uyguluyoruz.
Katılımcılık: Tüm paydaşların karar alma süreçlerine katılımını sağlayarak ortak akıl ile hareket ediyoruz.
Sürdürülebilirlik: Projelerimizde ve faaliyetlerimizde sürdürülebilirliği gözetiyor, uzun vadeli etki yaratmayı amaçlıyoruz.',
  degerler_en = 'Equal Opportunity: We work to ensure that all segments of society have equal access to education and technology opportunities.
Transparency: We base transparency and accountability in all our activities and resource use.
Volunteering: We aim to provide social benefit and strengthen solidarity through volunteer-based work.
Innovation: We support and implement innovative approaches in education and technology fields.
Participation: We act with collective wisdom by ensuring the participation of all stakeholders in decision-making processes.
Sustainability: We consider sustainability in our projects and activities, aiming to create long-term impact.'
where id = 1;
```

- [ ] **Step 3: `page.tsx`'i yaz**

`src/app/hakkimizda/page.tsx`:

```tsx
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PdfDownloadButton } from '@/components/ui/PdfDownloadButton'
import type { Document } from '@/lib/supabase/types'

function TextBlock({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-body-text">
      {text.split('\n\n').map((paragraph, i) => (
        <p key={i} className="whitespace-pre-line">{paragraph}</p>
      ))}
    </div>
  )
}

function DocumentList({ documents, emptyMessage }: { documents: Document[]; emptyMessage: string }) {
  if (documents.length === 0) return <EmptyState message={emptyMessage} />
  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li key={doc.id}>
          <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {doc.title} ({doc.year})
          </a>
        </li>
      ))}
    </ul>
  )
}

export default async function HakkimizdaPage() {
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: about } = await supabase.from('about_content').select('*').eq('id', 1).single()
  const { data: allDocuments } = await supabase
    .from('documents')
    .select('*')
    .order('year', { ascending: false })
    .order('sort_order', { ascending: true })

  const beyannameler = (allDocuments ?? []).filter((d) => d.type === 'beyanname')
  const faaliyetRaporlari = (allDocuments ?? []).filter((d) => d.type === 'faaliyet_raporu')

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading title={localize('Hakkımızda', 'About Us', locale)} />

      <section className="mb-12 grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
        <Image src="/images/about-1.jpg" alt="" width={500} height={350} className="rounded-2xl" />
        <div>
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Derneğin Kuruluşu', 'Foundation of the Association', locale)}
          </h2>
          <div className="mt-3">
            <TextBlock text={localize(about?.kurulus_tr ?? '', about?.kurulus_en ?? '', locale)} />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-xl font-bold text-dark">
          {localize('Amaç ve Misyon', 'Purpose and Mission', locale)}
        </h2>
        <div className="mt-3">
          <TextBlock text={localize(about?.amac_ilkeler_tr ?? '', about?.amac_ilkeler_en ?? '', locale)} />
        </div>
      </section>

      <section className="mb-12 grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
        <div className="order-2 sm:order-1">
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Vizyon', 'Vision', locale)}
          </h2>
          <div className="mt-3">
            <TextBlock text={localize(about?.vizyon_tr ?? '', about?.vizyon_en ?? '', locale)} />
          </div>
        </div>
        <Image src="/images/about-2.jpg" alt="" width={500} height={350} className="order-1 rounded-2xl sm:order-2" />
      </section>

      <section className="mb-12">
        <h2 className="font-display text-xl font-bold text-dark">
          {localize('Değerlerimiz', 'Our Values', locale)}
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {localize(about?.degerler_tr ?? '', about?.degerler_en ?? '', locale)
            .split('\n')
            .filter(Boolean)
            .map((line) => {
              const [title, ...rest] = line.split(':')
              return (
                <li key={title} className="rounded-xl border border-neutral-200 p-4">
                  <p className="font-semibold text-dark">{title}</p>
                  <p className="mt-1 text-sm text-body-text">{rest.join(':').trim()}</p>
                </li>
              )
            })}
        </ul>
      </section>

      <section className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-bold text-dark">
            {localize('Dernek Tüzüğü', 'Association Charter', locale)}
          </h2>
          <p className="mt-2 text-sm text-body-text">
            {localize(
              'Tüzüğün tam metni PDF olarak yakında burada yer alacak.',
              'The full text of the charter will be available here as a PDF soon.',
              locale
            )}
          </p>
          <div className="mt-3">
            <PdfDownloadButton
              url={about?.tuzuk_pdf_url ?? null}
              label={localize('Tüzüğü İndir', 'Download Charter', locale)}
              unavailableLabel={localize('Yakında', 'Coming Soon', locale)}
            />
          </div>
        </div>
        <Image src="/images/about-3.jpg" alt="" width={500} height={350} className="rounded-2xl" />
      </section>

      <section className="mb-12">
        <h2 className="font-display text-xl font-bold text-dark">
          {localize('Beyannameler', 'Declarations', locale)}
        </h2>
        <div className="mt-3">
          <DocumentList
            documents={beyannameler}
            emptyMessage={localize('Henüz beyanname eklenmedi.', 'No declarations have been added yet.', locale)}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-dark">
          {localize('Faaliyet Raporları', 'Annual Reports', locale)}
        </h2>
        <div className="mt-3">
          <DocumentList
            documents={faaliyetRaporlari}
            emptyMessage={localize('Henüz faaliyet raporu eklenmedi.', 'No annual reports have been added yet.', locale)}
          />
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 5: Manuel doğrula**

`npm run dev`, `http://localhost:3000/hakkimizda` — tüm bölümlerin (Kuruluş/Amaç/Vizyon/Değerler/Tüzük/Beyannameler/Faaliyet Raporları) göründüğünü, Tüzük butonunun devre dışı olduğunu, Beyanname/Faaliyet Raporu listelerinin boş state gösterdiğini, EN'e geçince tüm metnin İngilizceye döndüğünü doğrula. Sunucuyu durdur.

- [ ] **Step 6: Commit**

```bash
git add public/images/about-1.jpg public/images/about-2.jpg public/images/about-3.jpg src/app/hakkimizda/page.tsx
git commit -m "Hakkımızda sayfasını gerçek içerikle inşa et"
```

---

### Task 6: Ekibimiz

**Files:**
- Create: `src/app/ekibimiz/page.tsx`

**Interfaces:**
- Consumes: `createClient()` server, `TeamCategory`/`TeamMember` tipleri (Bölüm A)
- Produces: `/ekibimiz` route.

- [ ] **Step 1: Yönetim Kurulu'nu seed et**

Supabase MCP `mcp__plugin_supabase_supabase__execute_sql` ile çalıştır:

```sql
insert into public.team_categories (name_tr, name_en, sort_order)
values ('Yönetim Kurulu', 'Board of Directors', 0)
returning id;
```

Dönen `id`'yi kullanarak (örnek: `<CATEGORY_ID>`):

```sql
insert into public.team_members (category_id, full_name, role_tr, role_en, sort_order)
values
  ('<CATEGORY_ID>', 'Erhan KOÇ', 'Yönetim Kurulu Başkanı', 'Board Chairman', 0),
  ('<CATEGORY_ID>', 'Alican DİŞLİTAŞ', 'Yönetim Kurulu Başkan Yardımcısı', 'Vice Chairman', 1),
  ('<CATEGORY_ID>', 'Göksel KÖSE', 'Genel Sekreter', 'General Secretary', 2),
  ('<CATEGORY_ID>', 'Nuri KARAGÖZOĞLU', 'Sayman', 'Treasurer', 3),
  ('<CATEGORY_ID>', 'Orhan AYVALLI', 'Kurucu Üye', 'Founding Member', 4);
```

- [ ] **Step 2: `page.tsx`'i yaz**

`src/app/ekibimiz/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

function initials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

export default async function EkibimizPage() {
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('team_categories')
    .select('*, team_members(*)')
    .order('sort_order', { ascending: true })

  const hasAnyMembers = (categories ?? []).some((c) => (c.team_members as unknown[])?.length > 0)

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading title={localize('Ekibimiz', 'Our Team', locale)} />

      {!hasAnyMembers && (
        <EmptyState message={localize('Henüz ekip üyesi eklenmedi.', 'No team members have been added yet.', locale)} />
      )}

      {(categories ?? []).map((category) => {
        const members = ((category.team_members ?? []) as {
          id: string
          full_name: string
          role_tr: string
          role_en: string
          sort_order: number
        }[]).sort((a, b) => a.sort_order - b.sort_order)

        if (members.length === 0) return null

        return (
          <section key={category.id} className="mb-12">
            <h2 className="mb-6 font-display text-xl font-bold text-dark">
              {localize(category.name_tr, category.name_en, locale)}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {members.map((member) => (
                <Card key={member.id} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                    {initials(member.full_name)}
                  </div>
                  <p className="mt-3 font-semibold text-dark">{member.full_name}</p>
                  <p className="text-sm text-body-text">{localize(member.role_tr, member.role_en, locale)}</p>
                </Card>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 4: Manuel doğrula**

`npm run dev`, `http://localhost:3000/ekibimiz` — 5 kişinin de baş harf avatarıyla göründüğünü doğrula. Sunucuyu durdur.

- [ ] **Step 5: Commit**

```bash
git add src/app/ekibimiz/page.tsx
git commit -m "Ekibimiz sayfasını ve Yönetim Kurulu seed verisini ekle"
```

---

### Task 7: İşbirlikleri

**Files:**
- Create: `src/app/isbirlikleri/page.tsx`

**Interfaces:**
- Consumes: `createClient()` server, `Partnership` tipi (Bölüm A)
- Produces: `/isbirlikleri` route.

- [ ] **Step 1: `page.tsx`'i yaz**

```tsx
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function IsbirlikleriPage() {
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: partnerships } = await supabase
    .from('partnerships')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading title={localize('İşbirlikleri', 'Partnerships', locale)} />

      {(!partnerships || partnerships.length === 0) ? (
        <EmptyState message={localize('Henüz işbirliği eklenmedi.', 'No partnerships have been added yet.', locale)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {partnerships.map((partnership) => (
            <Card key={partnership.id}>
              <Image src={partnership.logo_url} alt={partnership.name} width={160} height={80} className="mb-4" />
              <h3 className="font-display font-bold text-dark">{partnership.name}</h3>
              <p className="mt-2 text-sm text-body-text">
                {localize(partnership.project_description_tr, partnership.project_description_en, locale)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/app/isbirlikleri/page.tsx
git commit -m "İşbirlikleri sayfasını ekle"
```

---

### Task 8: Duyurular — Haberler ve Etkinlikler

**Files:**
- Create: `src/app/haberler/page.tsx`
- Create: `src/app/haberler/[slug]/page.tsx`
- Create: `src/app/etkinlikler/page.tsx`
- Create: `src/app/etkinlikler/[slug]/page.tsx`

**Interfaces:**
- Consumes: `createClient()` server, `NewsItem`/`EventItem` tipleri (Bölüm A)
- Produces: `/haberler`, `/haberler/[slug]`, `/etkinlikler`, `/etkinlikler/[slug]` route'ları.

- [ ] **Step 1: Haberler liste sayfasını yaz**

`src/app/haberler/page.tsx`:

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function HaberlerPage() {
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: news } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading title={localize('Haberler', 'News', locale)} />

      {(!news || news.length === 0) ? (
        <EmptyState message={localize('Henüz yayınlanmış bir haber yok.', 'No news has been published yet.', locale)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {news.map((item) => (
            <Link key={item.id} href={`/haberler/${item.slug}`}>
              <Card>
                <h3 className="font-display font-bold text-dark">{localize(item.title_tr, item.title_en, locale)}</h3>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Haber detay sayfasını yaz**

`src/app/haberler/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'

export default async function HaberDetayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!item) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-dark">{localize(item.title_tr, item.title_en, locale)}</h1>
      <div className="mt-6 whitespace-pre-line text-body-text">
        {localize(item.content_tr, item.content_en, locale)}
      </div>
      {item.show_apply_button && item.apply_button_url && (
        <a
          href={item.apply_button_url}
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-primary mt-8 inline-block rounded-full px-6 py-3 font-semibold text-white"
        >
          {localize('Başvuru için tıklayın', 'Click to Apply', locale)}
        </a>
      )}
    </article>
  )
}
```

- [ ] **Step 3: Etkinlikler liste sayfasını yaz**

`src/app/etkinlikler/page.tsx`:

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function EtkinliklerPage() {
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('event_date', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading title={localize('Eğitim ve Etkinlikler', 'Events', locale)} />

      {(!events || events.length === 0) ? (
        <EmptyState message={localize('Henüz planlanmış bir etkinlik yok.', 'No events have been scheduled yet.', locale)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {events.map((item) => (
            <Link key={item.id} href={`/etkinlikler/${item.slug}`}>
              <Card>
                <h3 className="font-display font-bold text-dark">{localize(item.title_tr, item.title_en, locale)}</h3>
                {item.location && <p className="mt-1 text-sm text-body-text">{item.location}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Etkinlik detay sayfasını yaz**

`src/app/etkinlikler/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'

export default async function EtkinlikDetayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!item) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-dark">{localize(item.title_tr, item.title_en, locale)}</h1>
      {item.location && <p className="mt-2 text-body-text">{item.location}</p>}
      <div className="mt-6 whitespace-pre-line text-body-text">
        {localize(item.content_tr, item.content_en, locale)}
      </div>
      {item.show_apply_button && item.apply_button_url && (
        <a
          href={item.apply_button_url}
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-primary mt-8 inline-block rounded-full px-6 py-3 font-semibold text-white"
        >
          {localize('Başvuru için tıklayın', 'Click to Apply', locale)}
        </a>
      )}
    </article>
  )
}
```

- [ ] **Step 5: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 6: Manuel doğrula**

`npm run dev`, `/haberler` ve `/etkinlikler` boş state gösterdiğini, `/haberler/olmayan-slug` gibi bir URL'nin 404 verdiğini doğrula. Sunucuyu durdur.

- [ ] **Step 7: Commit**

```bash
git add src/app/haberler src/app/etkinlikler
git commit -m "Duyurular: Haberler ve Etkinlikler sayfalarını ekle"
```

---

### Task 9: Duyurular — Projeler ve Uygulamalarımız (Yakında Sayfaları)

**Files:**
- Create: `src/components/site/ComingSoon.tsx`
- Create: `src/app/projeler/page.tsx`
- Create: `src/app/uygulamalarimiz/page.tsx`

**Interfaces:**
- Produces: `<ComingSoon title />`; `/projeler`, `/uygulamalarimiz` route'ları.

- [ ] **Step 1: `ComingSoon.tsx`'i yaz**

```tsx
export function ComingSoon({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-dark">{title}</h1>
      <p className="mt-4 text-body-text">{message}</p>
    </div>
  )
}
```

- [ ] **Step 2: `/projeler` sayfasını yaz**

`src/app/projeler/page.tsx`:

```tsx
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { ComingSoon } from '@/components/site/ComingSoon'

export default async function ProjelerPage() {
  const locale = await getLocale()
  return (
    <ComingSoon
      title={localize('Projeler', 'Projects', locale)}
      message={localize('Projelerimiz yakında burada listelenecek.', 'Our projects will be listed here soon.', locale)}
    />
  )
}
```

- [ ] **Step 3: `/uygulamalarimiz` sayfasını yaz**

`src/app/uygulamalarimiz/page.tsx`:

```tsx
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { ComingSoon } from '@/components/site/ComingSoon'

export default async function UygulamalarimizPage() {
  const locale = await getLocale()
  return (
    <ComingSoon
      title={localize('Uygulamalarımız', 'Our Apps', locale)}
      message={localize('Uygulamalarımız yakında burada yer alacak.', 'Our apps will be featured here soon.', locale)}
    />
  )
}
```

- [ ] **Step 4: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/components/site/ComingSoon.tsx src/app/projeler src/app/uygulamalarimiz
git commit -m "Projeler ve Uygulamalarımız için Yakında sayfalarını ekle"
```

---

### Task 10: Alanlarımız

**Files:**
- Create: `src/content/alanlarimiz.ts`
- Create: `src/app/alanlarimiz/page.tsx`

**Interfaces:**
- Produces: `FOCUS_AREAS` sabiti (`src/content/alanlarimiz.ts`); `/alanlarimiz` route.

- [ ] **Step 1: İçerik dosyasını yaz**

`src/content/alanlarimiz.ts`:

```ts
export const FOCUS_AREAS = [
  {
    title_tr: 'Eğitim & Teknoloji',
    title_en: 'Education & Technology',
    description_tr: 'Eğitimde teknoloji kullanımını yaygınlaştırmak için çalışmalar yapıyoruz. Öğretmenlere ve öğrencilere yönelik eğitim teknolojileri konusunda farkındalık ve beceri kazandırmayı hedefliyoruz.',
    description_en: 'We work to spread the use of technology in education. We aim to raise awareness and build skills in educational technology for teachers and students.',
    activities_tr: [
      'Eğitimcilere yönelik teknoloji kullanımı eğitimleri',
      'Eğitim kurumlarında teknoloji entegrasyonu danışmanlığı',
      'Eğitim teknolojileri konusunda araştırma ve geliştirme çalışmaları',
      'Eğitim yazılımları ve uygulamaları geliştirme',
      'Uzaktan eğitim ve hibrit öğrenme modelleri tasarımı',
    ],
    activities_en: [
      'Technology-use training programs for educators',
      'Technology integration consulting for educational institutions',
      'Research and development in educational technology',
      'Development of educational software and applications',
      'Design of distance and hybrid learning models',
    ],
  },
  {
    title_tr: 'Oyun & Oyun Temelli Öğrenme',
    title_en: 'Gaming & Game-Based Learning',
    description_tr: 'Oyun temelli öğrenme yaklaşımlarını geliştiriyor ve uyguluyoruz. Oyunların eğitimde etkili bir araç olarak kullanılmasını sağlamak için çalışıyoruz.',
    description_en: 'We develop and implement game-based learning approaches. We work to ensure games are used as an effective tool in education.',
    activities_tr: [
      'Eğitsel oyun tasarımı ve geliştirme',
      'Oyunlaştırma (gamification) uygulamaları',
      'Oyun temelli öğrenme metodolojileri geliştirme',
      'Eğitimcilere yönelik oyun temelli öğrenme eğitimleri',
      'Ciddi oyunlar (serious games) tasarımı ve uygulaması',
    ],
    activities_en: [
      'Educational game design and development',
      'Gamification applications',
      'Development of game-based learning methodologies',
      'Game-based learning training for educators',
      'Design and implementation of serious games',
    ],
  },
  {
    title_tr: 'Dijitalleşme & Dijital Okuryazarlık',
    title_en: 'Digitalization & Digital Literacy',
    description_tr: 'Toplumun her kesiminin dijital becerilerini geliştirmeyi hedefliyoruz. Dijital dönüşüm sürecinde kimsenin geride kalmaması için çalışıyoruz.',
    description_en: 'We aim to improve the digital skills of all segments of society and ensure no one is left behind in the digital transformation process.',
    activities_tr: [
      'Dijital okuryazarlık eğitimleri',
      'Dezavantajlı gruplar için dijital beceri kazandırma programları',
      'Dijital vatandaşlık ve güvenli internet kullanımı eğitimleri',
      'Temel kodlama ve programlama eğitimleri',
      'Dijital araçların etkin kullanımı konusunda rehberlik',
    ],
    activities_en: [
      'Digital literacy training',
      'Digital skills programs for disadvantaged groups',
      'Digital citizenship and safe internet use training',
      'Basic coding and programming education',
      'Guidance on effective use of digital tools',
    ],
  },
  {
    title_tr: 'Medya Okuryazarlığı',
    title_en: 'Media Literacy',
    description_tr: 'Medya içeriklerini doğru anlama, analiz etme ve değerlendirme becerilerini geliştirmeye yönelik çalışmalar yapıyoruz. Eleştirel düşünme ve bilinçli medya tüketimi konularında farkındalık yaratıyoruz.',
    description_en: 'We work to develop skills in correctly understanding, analyzing and evaluating media content, raising awareness of critical thinking and conscious media consumption.',
    activities_tr: [
      'Medya okuryazarlığı eğitimleri',
      'Dezenformasyon ve yanlış bilgi ile mücadele programları',
      'Sosyal medya kullanımı ve etkileri konusunda bilinçlendirme',
      'Çocuklar ve gençler için güvenli medya kullanımı rehberleri',
      'Medya içerik üretimi ve etik ilkeler eğitimleri',
    ],
    activities_en: [
      'Media literacy training',
      'Programs to combat disinformation and misinformation',
      'Awareness of social media use and its effects',
      'Safe media-use guides for children and youth',
      'Media content production and ethics training',
    ],
  },
  {
    title_tr: 'Çevre & Sürdürülebilirlik',
    title_en: 'Environment & Sustainability',
    description_tr: 'Çevre bilinci ve sürdürülebilirlik konularında farkındalık yaratmak için teknoloji ve oyun temelli yaklaşımları kullanıyoruz. Sürdürülebilir kalkınma hedeflerine katkıda bulunmayı amaçlıyoruz.',
    description_en: 'We use technology and game-based approaches to raise awareness of environmental consciousness and sustainability, aiming to contribute to sustainable development goals.',
    activities_tr: [
      'Çevre eğitimi için dijital araçlar ve oyunlar geliştirme',
      'Sürdürülebilirlik konusunda farkındalık kampanyaları',
      'Ekolojik ayak izi hesaplama ve azaltma programları',
      'Geri dönüşüm ve atık yönetimi eğitimleri',
      'Yenilenebilir enerji ve iklim değişikliği konularında bilinçlendirme',
    ],
    activities_en: [
      'Digital tools and games for environmental education',
      'Sustainability awareness campaigns',
      'Ecological footprint calculation and reduction programs',
      'Recycling and waste management training',
      'Awareness on renewable energy and climate change',
    ],
  },
  {
    title_tr: 'Gençlik & Gönüllülük',
    title_en: 'Youth & Volunteering',
    description_tr: 'Gençlerin ve gönüllülerin katılımıyla projeler geliştiriyoruz. Gençlerin potansiyellerini gerçekleştirmelerine ve toplumsal sorunlara çözüm üretmelerine destek oluyoruz.',
    description_en: 'We develop projects with the participation of young people and volunteers, supporting them in realizing their potential and solving social problems.',
    activities_tr: [
      'Gençlik projeleri ve girişimleri destekleme',
      'Gönüllülük programları ve eğitimleri',
      'Gençlik liderliği ve katılımı programları',
      'Ulusal ve uluslararası gençlik değişimleri',
      'Gençlik politikaları geliştirme ve savunuculuk',
    ],
    activities_en: [
      'Supporting youth projects and initiatives',
      'Volunteering programs and training',
      'Youth leadership and participation programs',
      'National and international youth exchanges',
      'Youth policy development and advocacy',
    ],
  },
  {
    title_tr: 'İnsan Hakları & Eşitlik',
    title_en: 'Human Rights & Equality',
    description_tr: 'İnsan hakları ve eşitlik konularında farkındalık yaratmak için teknoloji ve oyun temelli yaklaşımları kullanıyoruz. Herkes için eşit fırsatlar yaratmayı hedefliyoruz.',
    description_en: 'We use technology and game-based approaches to raise awareness of human rights and equality, aiming to create equal opportunities for everyone.',
    activities_tr: [
      'İnsan hakları eğitimleri ve farkındalık kampanyaları',
      'Ayrımcılıkla mücadele programları',
      'Toplumsal cinsiyet eşitliği projeleri',
      'Kapsayıcı eğitim modelleri geliştirme',
      'Dezavantajlı grupların güçlendirilmesi çalışmaları',
    ],
    activities_en: [
      'Human rights training and awareness campaigns',
      'Anti-discrimination programs',
      'Gender equality projects',
      'Development of inclusive education models',
      'Empowerment work for disadvantaged groups',
    ],
  },
  {
    title_tr: 'Sosyal İnovasyon & Girişimcilik',
    title_en: 'Social Innovation & Entrepreneurship',
    description_tr: 'Toplumsal sorunlara yenilikçi çözümler üretmek için sosyal inovasyon ve girişimcilik yaklaşımlarını destekliyoruz. Sürdürülebilir ve ölçeklenebilir çözümler geliştirmeyi amaçlıyoruz.',
    description_en: 'We support social innovation and entrepreneurship approaches to produce innovative solutions to social problems, aiming to develop sustainable and scalable solutions.',
    activities_tr: [
      'Sosyal inovasyon laboratuvarları ve atölyeleri',
      'Sosyal girişimcilik eğitimleri ve mentorluk programları',
      'Sosyal etki ölçümü ve değerlendirmesi',
      'Sosyal girişimleri destekleme ve ölçeklendirme',
      'Sosyal inovasyon yarışmaları ve hackathonlar',
    ],
    activities_en: [
      'Social innovation labs and workshops',
      'Social entrepreneurship training and mentorship programs',
      'Social impact measurement and evaluation',
      'Supporting and scaling social enterprises',
      'Social innovation competitions and hackathons',
    ],
  },
]
```

- [ ] **Step 2: `page.tsx`'i yaz**

`src/app/alanlarimiz/page.tsx`:

```tsx
import Link from 'next/link'
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { FOCUS_AREAS } from '@/content/alanlarimiz'

export default async function AlanlarimizPage() {
  const locale = await getLocale()

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading
        title={localize('Alanlarımız', 'Our Focus Areas', locale)}
        subtitle={localize('Derneğimizin çalıştığı temel alanlar', 'The main areas where our association works', locale)}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {FOCUS_AREAS.map((area) => (
          <Card key={area.title_tr}>
            <h3 className="font-display font-bold text-dark">{localize(area.title_tr, area.title_en, locale)}</h3>
            <p className="mt-2 text-sm text-body-text">{localize(area.description_tr, area.description_en, locale)}</p>
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-body-text">
              {(locale === 'en' ? area.activities_en : area.activities_tr).map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="gradient-primary mt-12 rounded-2xl px-6 py-10 text-center text-white">
        <h2 className="font-display text-xl font-bold">
          {localize('İlgi Alanınıza Göre Bize Katılın!', 'Join Us in Your Area of Interest!', locale)}
        </h2>
        <Link href="/destek-ol" className="mt-4 inline-block rounded-full bg-white px-6 py-2 font-semibold text-primary">
          {localize('Gönüllü Ol', 'Volunteer', locale)}
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/content/alanlarimiz.ts src/app/alanlarimiz/page.tsx
git commit -m "Alanlarımız sayfasını 8 kartla inşa et"
```

---

### Task 11: Destek Ol

**Files:**
- Create: `src/app/destek-ol/page.tsx`

**Interfaces:**
- Produces: `/destek-ol` route.

- [ ] **Step 1: `page.tsx`'i yaz**

```tsx
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { CONTACT_INFO } from '@/content/contact-info'

export default async function DestekOlPage() {
  const locale = await getLocale()

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading
        title={localize('Destek Ol', 'Support Us', locale)}
        subtitle={localize(
          'Eğitim çalışmalarımıza destek olarak daha çok çocuğa ulaşmamıza yardımcı olun.',
          'Support our educational work to help us reach more children.',
          locale
        )}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg font-bold text-dark">
            {localize('Gönüllülük', 'Volunteer Support', locale)}
          </h2>
          <p className="mt-2 text-sm text-body-text">
            {localize('Yeteneklerinizle eğitimde fark yaratın.', 'Make a difference in education with your talents.', locale)}
          </p>
          <h3 className="mt-4 font-semibold text-dark">
            {localize('Gönüllülük Alanları', 'Volunteer Areas', locale)}
          </h3>
          <ul className="mt-2 list-inside list-disc text-sm text-body-text">
            {localize(
              'Eğitim ve Öğretim,İçerik Geliştirme,Grafik Tasarım,Web/Mobil Yazılım,Etkinlik Organizasyonu,Sosyal Medya Yönetimi,Proje Yönetimi,Çeviri ve Editörlük',
              'Education and Teaching,Content Development,Graphic Design,Web/Mobile Software,Event Organization,Social Media Management,Project Management,Translation and Editing',
              locale
            )
              .split(',')
              .map((area) => (
                <li key={area}>{area}</li>
              ))}
          </ul>
          <p className="mt-4 text-sm text-body-text">
            {localize(
              'Gönüllülük faaliyetlerinin tamamlanmasının ardından katılım sertifikası verilir.',
              'A certificate is provided upon completion of volunteer activities.',
              locale
            )}
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-bold text-dark">
            {localize('Kurumsal İşbirliği', 'Corporate Collaboration', locale)}
          </h2>
          <p className="mt-2 text-sm text-body-text">
            {localize(
              'Kurumsal ortaklıklar ve işbirlikleriyle eğitimde daha büyük etkiler yaratıyoruz.',
              'We create greater impacts in education through corporate partnerships and collaborations.',
              locale
            )}
          </p>
          <h3 className="mt-4 font-semibold text-dark">
            {localize('İşbirliği Alanları', 'Collaboration Areas', locale)}
          </h3>
          <ul className="mt-2 list-inside list-disc text-sm text-body-text">
            {localize(
              'Kurumsal Sosyal Sorumluluk Projeleri,Eğitim Programları ve Atölyeler,Araştırma ve Geliştirme Çalışmaları,Etkinlik ve Organizasyonlar,Teknoloji ve Ekipman Desteği,Mekan ve Altyapı Desteği,Uzman ve İnsan Kaynağı Desteği',
              'Corporate Social Responsibility Projects,Education Programs and Workshops,Research and Development Studies,Events and Organizations,Technology and Equipment Support,Venue and Infrastructure Support,Expert and Human Resource Support',
              locale
            )
              .split(',')
              .map((area) => (
                <li key={area}>{area}</li>
              ))}
          </ul>
          <p className="mt-4 text-sm text-body-text">
            {localize(
              `İşbirliği önerileriniz için ${CONTACT_INFO.collaborationEmail} adresine e-posta gönderebilirsiniz.`,
              `For your collaboration proposals, you can send an email to ${CONTACT_INFO.collaborationEmail}.`,
              locale
            )}
          </p>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/app/destek-ol/page.tsx
git commit -m "Destek Ol sayfasını ekle"
```

---

### Task 12: İletişim

**Files:**
- Create: `src/app/iletisim/actions.ts`
- Create: `src/app/iletisim/page.tsx`
- Create: `src/app/iletisim/ContactForm.tsx`

**Interfaces:**
- Consumes: `createClient()` server, `CONTACT_INFO` (Task 3)
- Produces: `submitContactForm(prevState, formData)` Server Action; `<ContactForm locale />`; `/iletisim` route.

- [ ] **Step 1: Server Action'ı yaz**

`src/app/iletisim/actions.ts`:

```ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitContactForm(
  _prevState: { success: boolean; error?: string },
  formData: FormData
) {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const subject = String(formData.get('subject') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!fullName || !email || !subject || !message) {
    return { success: false, error: 'Lütfen tüm zorunlu alanları doldurun.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').insert({
    full_name: fullName,
    email,
    subject,
    message,
  })

  if (error) {
    return { success: false, error: 'Mesajınız gönderilemedi, lütfen tekrar deneyin.' }
  }

  return { success: true }
}
```

- [ ] **Step 2: `page.tsx`'i yaz (server component — locale bilgisini `ContactForm`'a aktarır)**

`src/app/iletisim/page.tsx`:

```tsx
import { getLocale } from '@/lib/i18n/locale'
import { ContactForm } from './ContactForm'
import { CONTACT_INFO } from '@/content/contact-info'
import { localize } from '@/lib/i18n/localize'

export default async function IletisimPage() {
  const locale = await getLocale()

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 py-16 sm:grid-cols-2">
      <div>
        <h1 className="font-display text-3xl font-bold text-dark">{localize('İletişim', 'Contact', locale)}</h1>
        <p className="mt-4 text-body-text">
          {localize(
            'Bizimle iletişime geçin, sorularınızı yanıtlayalım ve eğitimde birlikte fark yaratalım.',
            'Get in touch with us, let us answer your questions and make a difference in education together.',
            locale
          )}
        </p>
        <dl className="mt-8 space-y-4 text-sm text-body-text">
          <div>
            <dt className="font-semibold text-dark">{localize('Adres', 'Address', locale)}</dt>
            <dd>{CONTACT_INFO.address}</dd>
          </div>
          <div>
            <dt className="font-semibold text-dark">{localize('E-posta', 'Email', locale)}</dt>
            <dd>{CONTACT_INFO.email}</dd>
          </div>
          <div>
            <dt className="font-semibold text-dark">{localize('Çalışma Saatleri', 'Working Hours', locale)}</dt>
            <dd>{localize(CONTACT_INFO.hours.tr, CONTACT_INFO.hours.en, locale)}</dd>
          </div>
        </dl>
      </div>
      <ContactForm locale={locale} />
    </div>
  )
}
```

- [ ] **Step 3: `ContactForm.tsx` client bileşenini oluştur**

`src/app/iletisim/ContactForm.tsx`:

```tsx
'use client'

import { useActionState } from 'react'
import { submitContactForm } from './actions'
import { localize } from '@/lib/i18n/localize'
import type { Locale } from '@/lib/supabase/types'

const SUBJECTS: { tr: string; en: string }[] = [
  { tr: 'Genel Bilgi', en: 'General Information' },
  { tr: 'Projeler', en: 'Projects' },
  { tr: 'Eğitim Programları', en: 'Educational Programs' },
  { tr: 'Gönüllülük', en: 'Volunteer Cooperation' },
  { tr: 'İşbirliği', en: 'Partnership' },
  { tr: 'Diğer', en: 'Other' },
]

export function ContactForm({ locale }: { locale: Locale }) {
  const [state, formAction, pending] = useActionState(submitContactForm, { success: false })

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-body-text">
          {localize('Adınız Soyadınız', 'Your Full Name', locale)}
        </label>
        <input id="fullName" name="fullName" required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-body-text">
          {localize('E-posta Adresi', 'Email Address', locale)}
        </label>
        <input id="email" name="email" type="email" required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-body-text">
          {localize('Konu', 'Subject', locale)}
        </label>
        <select id="subject" name="subject" required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2">
          {SUBJECTS.map((subject) => (
            <option key={subject.tr} value={locale === 'en' ? subject.en : subject.tr}>
              {localize(subject.tr, subject.en, locale)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-body-text">
          {localize('Mesajınız', 'Your Message', locale)}
        </label>
        <textarea id="message" name="message" required rows={5} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
      </div>
      <label className="flex items-start gap-2 text-sm text-body-text">
        <input type="checkbox" required className="mt-1" />
        {localize(
          "KVKK ve Gizlilik Politikası'nı okudum ve kabul ediyorum.",
          'I have read and accept the KVKK (Turkish Data Protection Law) and Privacy Policy.',
          locale
        )}
      </label>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {localize(
            'Mesajınız için teşekkür ederiz, en kısa sürede size dönüş yapacağız.',
            'Thank you for your message, we will get back to you as soon as possible.',
            locale
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="gradient-primary w-full rounded-full px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {pending
          ? localize('Gönderiliyor...', 'Sending...', locale)
          : localize('Gönder', 'Send', locale)}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 5: Manuel doğrula**

`npm run dev`, `/iletisim` formunu doldurup gönder, Supabase Dashboard → Table Editor → `contact_messages`'ta yeni satırın göründüğünü doğrula. Sunucuyu durdur.

- [ ] **Step 6: Commit**

```bash
git add src/app/iletisim
git commit -m "İletişim sayfasını ve formunu ekle"
```

---

### Task 13: Yasal Sayfalar

**Files:**
- Create: `src/content/legal.ts`
- Create: `src/app/yasal/tuzuk/page.tsx`
- Create: `src/app/yasal/kvkk/page.tsx`
- Create: `src/app/yasal/etik-ilkeler/page.tsx`
- Create: `src/app/yasal/sss/page.tsx`

**Interfaces:**
- Produces: `KVKK_SECTIONS`, `ETIK_SECTIONS`, `SSS_CATEGORIES` sabitleri (`src/content/legal.ts`); 4 route.

- [ ] **Step 1: İçerik dosyasını yaz**

`src/content/legal.ts`:

```ts
export const KVKK_SECTIONS: { title_tr: string; title_en: string; body_tr: string; body_en: string }[] = [
  {
    title_tr: 'Giriş',
    title_en: 'Introduction',
    body_tr: `Eğitim, Teknoloji ve Oyun Derneği ("Dernek" veya "biz") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla, kişisel verilerinizin güvenliği ve korunması konusuna önem veriyoruz. Bu Kişisel Verilerin Korunması ve Gizlilik Politikası ("Politika"), derneğimizin faaliyetleri kapsamında işlenen kişisel verilerin toplanması, kullanılması, paylaşılması ve korunması hakkında bilgi vermek amacıyla hazırlanmıştır.`,
    body_en: `As Education, Technology and Gaming Association ("Association" or "we"), under Law No. 6698 on the Protection of Personal Data ("KVKK", the Turkish Data Protection Law), we attach importance to the security and protection of your personal data as the data controller. This Personal Data Protection and Privacy Policy ("Policy") has been prepared to inform you about the collection, use, sharing and protection of personal data processed within the scope of our association's activities.`,
  },
  {
    title_tr: 'Kapsam',
    title_en: 'Scope',
    body_tr: `Bu Politika, derneğimizin üyeleri, gönüllüleri, bağışçıları, etkinlik katılımcıları, web sitesi ziyaretçileri, iş ortakları ve diğer ilgili kişilerin kişisel verilerinin işlenmesine ilişkin ilke ve kuralları içermektedir.`,
    body_en: `This Policy contains the principles and rules regarding the processing of personal data of our association's members, volunteers, donors, event participants, website visitors, business partners and other related persons.`,
  },
  {
    title_tr: 'Tanımlar',
    title_en: 'Definitions',
    body_tr: `Kişisel Veri: Kimliği belirli veya belirlenebilir gerçek kişiye ilişkin her türlü bilgiyi ifade eder.

Özel Nitelikli Kişisel Veri: Kişilerin ırkı, etnik kökeni, siyasi düşüncesi, felsefi inancı, dini, mezhebi veya diğer inançları, kılık ve kıyafeti, dernek, vakıf ya da sendika üyeliği, sağlığı, cinsel hayatı, ceza mahkûmiyeti ve güvenlik tedbirleriyle ilgili verileri ile biyometrik ve genetik verileri özel nitelikli kişisel veridir.

Kişisel Verilerin İşlenmesi: Kişisel verilerin tamamen veya kısmen otomatik olan ya da herhangi bir veri kayıt sisteminin parçası olmak kaydıyla otomatik olmayan yollarla elde edilmesi, kaydedilmesi, depolanması, muhafaza edilmesi, değiştirilmesi, yeniden düzenlenmesi, açıklanması, aktarılması, devralınması, elde edilebilir hâle getirilmesi, sınıflandırılması ya da kullanılmasının engellenmesi gibi veriler üzerinde gerçekleştirilen her türlü işlemi ifade eder.`,
    body_en: `Personal Data: Any information relating to an identified or identifiable natural person.

Special Category Personal Data: Data concerning a person's race, ethnic origin, political opinion, philosophical belief, religion, sect or other beliefs, appearance, membership of associations, foundations or trade unions, health, sex life, criminal convictions and security measures, as well as biometric and genetic data.

Processing of Personal Data: Any operation performed on personal data, such as collection, recording, storage, preservation, alteration, reorganization, disclosure, transfer, acquisition, making available, classification or preventing the use of data, whether by automated means, in whole or in part, or by non-automated means as part of a data recording system.`,
  },
  {
    title_tr: 'Kişisel Verilerin İşlenme Amaçları',
    title_en: 'Purposes of Processing Personal Data',
    body_tr: `Derneğimiz, kişisel verilerinizi aşağıdaki amaçlar doğrultusunda işlemektedir: Dernek üyelik işlemlerinin yürütülmesi; Dernek faaliyetleri ve etkinliklerinin planlanması ve icrası; Bağış ve yardımların kabul edilmesi ve takibi; İletişim faaliyetlerinin yürütülmesi; Web sitesi ve sosyal medya hesaplarının yönetimi; Proje ve eğitim faaliyetlerinin yürütülmesi; Gönüllülük faaliyetlerinin organizasyonu; Yasal yükümlülüklerin yerine getirilmesi; Dernek içi raporlama ve istatistik çalışmaları.`,
    body_en: `Our association processes your personal data for the following purposes: Carrying out membership procedures; Planning and execution of association activities and events; Accepting and tracking donations and aid; Carrying out communication activities; Management of the website and social media accounts; Carrying out project and education activities; Organizing volunteering activities; Fulfilling legal obligations; Internal reporting and statistical studies.`,
  },
  {
    title_tr: 'İşlenen Kişisel Veri Kategorileri',
    title_en: 'Categories of Personal Data Processed',
    body_tr: `Kimlik Bilgileri: Ad, soyad, T.C. kimlik numarası, doğum tarihi vb.
İletişim Bilgileri: Telefon numarası, e-posta adresi, adres vb.
Finansal Bilgiler: Banka hesap bilgileri, bağış bilgileri vb.
Eğitim ve İş Bilgileri: Öğrenim durumu, meslek, çalışılan kurum vb.
Görsel ve İşitsel Kayıtlar: Fotoğraflar, video kayıtları vb.
Web Sitesi Kullanım Verileri: IP adresi, çerezler, ziyaret edilen sayfalar vb.`,
    body_en: `Identity Information: Name, surname, national ID number, date of birth, etc.
Contact Information: Phone number, email address, address, etc.
Financial Information: Bank account information, donation information, etc.
Education and Work Information: Education level, profession, employer, etc.
Visual and Audio Records: Photographs, video recordings, etc.
Website Usage Data: IP address, cookies, pages visited, etc.`,
  },
  {
    title_tr: 'Kişisel Verilerin Aktarılması',
    title_en: 'Transfer of Personal Data',
    body_tr: `Derneğimiz, kişisel verilerinizi aşağıdaki durumlarda üçüncü kişilere aktarabilir: Yasal yükümlülüklerimizin yerine getirilmesi amacıyla yetkili kamu kurum ve kuruluşlarına; Proje ortaklıkları kapsamında işbirliği yaptığımız kurum ve kuruluşlara; Hizmet alınan tedarikçilere (bilişim altyapısı, web sitesi barındırma, muhasebe hizmetleri vb.); Açık rızanızın bulunması halinde diğer üçüncü kişilere.`,
    body_en: `Our association may transfer your personal data to third parties in the following cases: To authorized public institutions and organizations for the fulfillment of our legal obligations; To institutions and organizations we collaborate with within the scope of project partnerships; To service providers (IT infrastructure, website hosting, accounting services, etc.); To other third parties when you have given explicit consent.`,
  },
  {
    title_tr: 'Kişisel Verilerin Korunması İçin Alınan Tedbirler',
    title_en: 'Measures Taken to Protect Personal Data',
    body_tr: `Kişisel verilere erişim yetkilerinin sınırlandırılması; Veri güvenliğini sağlayan yazılım ve sistemlerin kullanılması; Düzenli güvenlik testleri ve kontroller; Çalışanların kişisel verilerin korunması konusunda eğitilmesi; Fiziksel güvenlik önlemleri (kilitli dolaplar, erişim kontrollü alanlar vb.); Kişisel verilerin yedeklenmesi ve felaket kurtarma planları.`,
    body_en: `Limiting access authority to personal data; Use of software and systems that ensure data security; Regular security tests and controls; Training staff on the protection of personal data; Physical security measures (locked cabinets, access-controlled areas, etc.); Backing up personal data and disaster recovery plans.`,
  },
  {
    title_tr: 'İlgili Kişilerin Hakları',
    title_en: 'Rights of Data Subjects',
    body_tr: `KVKK'nın 11. maddesi uyarınca: Kişisel verilerinizin işlenip işlenmediğini öğrenme; işlenmişse buna ilişkin bilgi talep etme; işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme; yurt içinde/dışında aktarıldığı üçüncü kişileri bilme; eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme; kanuni şartlar çerçevesinde silinmesini veya yok edilmesini isteme; bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme; münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme; kanuna aykırı işlenme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.`,
    body_en: `Under Article 11 of KVKK: Learning whether your personal data is being processed; requesting information if it has been processed; learning the purpose of processing and whether it is used in accordance with that purpose; knowing the third parties to whom it is transferred domestically or abroad; requesting correction if incompletely or incorrectly processed; requesting deletion or destruction within the framework of legal conditions; requesting that these operations be notified to the third parties to whom the data was transferred; objecting to a result that is to your detriment arising from analysis exclusively through automated systems; requesting compensation for damages in case of unlawful processing.`,
  },
  {
    title_tr: 'Başvuru Yöntemi',
    title_en: 'Application Method',
    body_tr: `Yukarıda belirtilen haklarınızı kullanmak için, kimliğinizi tespit edici gerekli bilgiler ve kullanmak istediğiniz hakkınıza yönelik açıklamalarınızla birlikte yazılı talebinizi "Fahrettin Altay, 65/20. Sk. No:14A, 35140 Karabağlar/İzmir" adresine bizzat elden iletebilir, noter kanalıyla gönderebilir veya info@egitimto.org adresine güvenli elektronik imzalı olarak iletebilirsiniz.`,
    body_en: `To exercise your rights listed above, you can submit your written request, together with information identifying you and an explanation of the right you wish to exercise, in person to "Fahrettin Altay, 65/20. Sk. No:14A, 35140 Karabağlar/İzmir", send it via notary, or submit it to info@egitimto.org with a secure electronic signature.`,
  },
]

export const ETIK_SECTIONS: { title_tr: string; title_en: string; body_tr: string; body_en: string }[] = [
  {
    title_tr: 'Temel Değerlerimiz',
    title_en: 'Our Core Values',
    body_tr: `Dürüstlük ve Şeffaflık: Tüm faaliyetlerimizde dürüst ve şeffaf olmayı, karar ve uygulamalarımızı açık bir şekilde paylaşmayı taahhüt ederiz.
Eşitlik ve Kapsayıcılık: Cinsiyet, yaş, etnik köken, din, dil, engellilik durumu veya sosyoekonomik statü gözetmeksizin herkese eşit davranmayı ve kapsayıcı olmayı taahhüt ederiz.
Hesap Verebilirlik: Tüm eylem ve kararlarımızın sorumluluğunu üstlenmeyi ve paydaşlarımıza karşı hesap verebilir olmayı taahhüt ederiz.
Bilimsellik: Çalışmalarımızda bilimsel yöntemleri benimsemeyi, kanıta dayalı uygulamaları desteklemeyi taahhüt ederiz.
Sürdürülebilirlik: Çevresel, sosyal ve ekonomik sürdürülebilirliği gözetmeyi, gelecek nesillerin ihtiyaçlarını dikkate almayı taahhüt ederiz.
İşbirliği: Paydaşlarımızla açık iletişim ve işbirliği içinde çalışmayı, ortak hedefler doğrultusunda güçlerimizi birleştirmeyi taahhüt ederiz.`,
    body_en: `Honesty and Transparency: We commit to being honest and transparent in all our activities and openly sharing our decisions and practices.
Equality and Inclusiveness: We commit to treating everyone equally and being inclusive regardless of gender, age, ethnicity, religion, language, disability status or socioeconomic status.
Accountability: We commit to taking responsibility for all our actions and decisions and being accountable to our stakeholders.
Scientific Rigor: We commit to adopting scientific methods and supporting evidence-based practices in our work.
Sustainability: We commit to considering environmental, social and economic sustainability and the needs of future generations.
Collaboration: We commit to working in open communication and collaboration with our stakeholders, combining our strengths towards common goals.`,
  },
  {
    title_tr: 'Yönetim ve Çalışma İlkelerimiz',
    title_en: 'Governance and Working Principles',
    body_tr: `Demokratik Yönetim: Dernek içi karar alma süreçlerinde demokratik ilkeleri benimser, üyelerimizin katılımını teşvik ederiz.
Mali Şeffaflık: Derneğin mali kaynaklarını amacına uygun ve verimli şekilde kullanır, mali durumumuzu şeffaf bir şekilde raporlarız.
Çıkar Çatışmalarından Kaçınma: Kişisel çıkarlar ile dernek çıkarlarının çatışmasını önleyecek politikalar uygular, potansiyel çıkar çatışmalarını açıkça beyan ederiz.
Profesyonellik: Tüm faaliyetlerimizde profesyonel standartlara uygun davranır, sürekli gelişimi hedefleriz.
Gizlilik: Kişisel verilerin ve gizli bilgilerin korunmasına özen gösterir, yasal düzenlemelere uygun hareket ederiz.`,
    body_en: `Democratic Governance: We adopt democratic principles in internal decision-making processes and encourage the participation of our members.
Financial Transparency: We use the association's financial resources appropriately and efficiently, and report our financial status transparently.
Avoiding Conflicts of Interest: We implement policies to prevent conflicts between personal interests and association interests, and openly declare potential conflicts of interest.
Professionalism: We act in accordance with professional standards in all our activities and aim for continuous improvement.
Confidentiality: We take care to protect personal data and confidential information, acting in accordance with legal regulations.`,
  },
  {
    title_tr: 'İçerik Geliştirme İlkelerimiz',
    title_en: 'Content Development Principles',
    body_tr: `Bilimsel Doğruluk: Geliştirdiğimiz tüm eğitim içerikleri ve materyaller bilimsel olarak doğrulanmış bilgilere dayanır.
Yaş ve Gelişim Uygunluğu: İçeriklerimizi hedef kitlenin yaş ve gelişim özelliklerine uygun olarak tasarlarız.
Kültürel Duyarlılık: Farklı kültürel değerlere saygı gösterir, kültürel çeşitliliği yansıtan içerikler geliştiririz.
Telif Haklarına Saygı: Başkalarına ait fikri mülkiyet haklarına saygı gösterir, gerekli izinleri alır ve kaynakları uygun şekilde belirtiriz.
Güvenli İçerik: Özellikle çocuklar ve gençler için geliştirilen içeriklerde güvenlik standartlarına uyar, zararlı olabilecek unsurlardan kaçınırız.`,
    body_en: `Scientific Accuracy: All educational content and materials we develop are based on scientifically verified information.
Age and Developmental Appropriateness: We design our content to be appropriate to the age and developmental characteristics of the target audience.
Cultural Sensitivity: We respect different cultural values and develop content that reflects cultural diversity.
Respect for Copyright: We respect the intellectual property rights of others, obtain necessary permissions, and properly cite sources.
Safe Content: We comply with safety standards, especially in content developed for children and young people, and avoid elements that could be harmful.`,
  },
  {
    title_tr: 'İşbirliği ve Ortaklık İlkelerimiz',
    title_en: 'Partnership and Collaboration Principles',
    body_tr: `Derneğimiz, diğer kurum ve kuruluşlarla işbirliği yaparken aşağıdaki ilkelere bağlı kalır: Ortak değer ve ilkelere sahip kuruluşlarla işbirliği yaparız; İşbirliklerinde karşılıklı saygı, güven ve açık iletişimi esas alırız; Ortaklıklarımızda roller, sorumluluklar ve beklentileri net bir şekilde tanımlarız; İşbirliği yaptığımız kuruluşların etik standartlarını ve uygulamalarını değerlendiririz; Ortak projelerde kaynakların adil ve verimli kullanımını sağlarız.`,
    body_en: `Our association adheres to the following principles when collaborating with other institutions and organizations: We collaborate with organizations that share common values and principles; We base our collaborations on mutual respect, trust and open communication; We clearly define roles, responsibilities and expectations in our partnerships; We evaluate the ethical standards and practices of the organizations we collaborate with; We ensure fair and efficient use of resources in joint projects.`,
  },
  {
    title_tr: 'Etik İhlallerin Bildirimi',
    title_en: 'Reporting Ethical Violations',
    body_tr: `Derneğimiz bünyesinde etik ilkelere aykırı davranışların bildirilmesi için güvenli kanallar oluşturulmuştur. Etik ihlalleri bildirmek veya etik konularda danışmak için etik@egitimto.org adresine e-posta gönderebilirsiniz. Tüm bildirimler gizli tutulacak ve bildirimi yapan kişilere karşı herhangi bir misilleme yapılmayacaktır.`,
    body_en: `Secure channels have been established within our association for reporting behavior contrary to ethical principles. You can send an email to etik@egitimto.org to report ethical violations or seek advice on ethical matters. All reports will be kept confidential and no retaliation will be taken against those who report.`,
  },
]

export const SSS_CATEGORIES: {
  title_tr: string
  title_en: string
  items: { question_tr: string; question_en: string; answer_tr: string; answer_en: string }[]
}[] = [
  {
    title_tr: 'Dernek Hakkında',
    title_en: 'About the Association',
    items: [
      {
        question_tr: 'Eğitim, Teknoloji ve Oyun Derneği ne zaman kuruldu?',
        question_en: 'When was the Education, Technology and Gaming Association founded?',
        answer_tr: 'Derneğimiz 2025 yılında İzmir\'de kurulmuştur. Eğitim, teknoloji ve oyun alanlarında toplumsal fayda sağlamak amacıyla çalışmalarına başlamıştır.',
        answer_en: 'Our association was founded in 2025 in İzmir. It began its work with the aim of providing social benefit in the fields of education, technology and gaming.',
      },
      {
        question_tr: 'Derneğin temel amaçları nelerdir?',
        question_en: 'What are the main purposes of the association?',
        answer_tr: 'Derneğimizin temel amaçları; eğitim, teknoloji ve oyun alanlarında toplumsal fayda sağlayacak çalışmalar yapmak, bu alanlarda bilimsel araştırmaları desteklemek, eğitim ve öğretim faaliyetlerinde teknoloji ve oyun temelli yaklaşımların kullanımını yaygınlaştırmak, dijital okuryazarlık ve medya okuryazarlığı konularında farkındalık oluşturmaktır.',
        answer_en: 'Our main purposes are to carry out work that will provide social benefit in the fields of education, technology and gaming, to support scientific research in these fields, to spread the use of technology and game-based approaches in education and teaching activities, and to raise awareness on digital literacy and media literacy.',
      },
      {
        question_tr: 'Dernek hangi alanlarda faaliyet gösteriyor?',
        question_en: 'In which areas does the association operate?',
        answer_tr: 'Derneğimiz; eğitim teknolojileri, oyun temelli öğrenme, dijital okuryazarlık, medya okuryazarlığı, çevre ve sürdürülebilirlik, gençlik ve gönüllülük, insan hakları ve eşitlik, sosyal inovasyon ve girişimcilik alanlarında faaliyet göstermektedir.',
        answer_en: 'Our association operates in the fields of educational technologies, game-based learning, digital literacy, media literacy, environment and sustainability, youth and volunteering, human rights and equality, and social innovation and entrepreneurship.',
      },
      {
        question_tr: 'Derneğin merkezi nerededir ve şubeleri var mıdır?',
        question_en: 'Where is the association\'s headquarters and does it have branches?',
        answer_tr: 'Derneğimizin merkezi İzmir\'dedir.',
        answer_en: 'Our association\'s headquarters is in İzmir.',
      },
    ],
  },
  {
    title_tr: 'Faaliyetler ve Etkinlikler',
    title_en: 'Activities and Events',
    items: [
      {
        question_tr: 'Derneğin düzenlediği etkinliklere nasıl katılabilirim?',
        question_en: 'How can I attend the events organized by the association?',
        answer_tr: 'Etkinliklerimiz web sitemizde ve sosyal medya hesaplarımızda duyurulmaktadır. Etkinliklere katılmak için ilgili etkinlik sayfasındaki kayıt formunu doldurmanız yeterlidir. Bazı etkinliklerimiz üyelere özel olabilirken, çoğu etkinliğimiz herkese açıktır.',
        answer_en: 'Our events are announced on our website and social media accounts. To attend an event, simply fill out the registration form on the relevant event page. While some of our events may be members-only, most of our events are open to everyone.',
      },
      {
        question_tr: 'Eğitim programlarınıza kimler katılabilir?',
        question_en: 'Who can participate in your educational programs?',
        answer_tr: 'Eğitim programlarımız hedef kitlesine göre değişiklik göstermektedir. Çocuklar, gençler, eğitimciler, ebeveynler ve profesyoneller için farklı eğitim programlarımız bulunmaktadır. Her programın katılım koşulları, program duyurusunda belirtilmektedir.',
        answer_en: 'Our educational programs vary according to their target audience. We have different educational programs for children, youth, educators, parents and professionals. The participation conditions for each program are specified in the program announcement.',
      },
      {
        question_tr: 'Etkinlikleriniz ücretli mi?',
        question_en: 'Are your events paid?',
        answer_tr: 'Etkinliklerimizin bir kısmı ücretsiz, bir kısmı ise ücretlidir. Ücretli etkinliklerde elde edilen gelir, derneğimizin faaliyetlerinin sürdürülebilirliği için kullanılmaktadır. Üyelerimize etkinliklerde indirim sağlanmaktadır.',
        answer_en: 'Some of our events are free, while others are paid. Revenue from paid events is used to sustain our association\'s activities. Our members receive discounts on events.',
      },
      {
        question_tr: 'Derneğinizle ortak etkinlik düzenleyebilir miyiz?',
        question_en: 'Can we organize a joint event with your association?',
        answer_tr: 'Evet, derneğimizin amaç ve ilkeleriyle uyumlu ortak etkinlikler düzenlemek için işbirliği yapabiliriz. İşbirliği önerilerinizi info@egitimto.org adresine iletebilirsiniz.',
        answer_en: 'Yes, we can collaborate to organize joint events that are compatible with our association\'s purposes and principles. You can send your collaboration proposals to info@egitimto.org.',
      },
    ],
  },
  {
    title_tr: 'Gönüllülük',
    title_en: 'Volunteering',
    items: [
      {
        question_tr: 'Derneğinizde gönüllü olarak çalışabilir miyim?',
        question_en: 'Can I work as a volunteer at your association?',
        answer_tr: 'Evet, derneğimizde gönüllü olarak çalışabilirsiniz. Web sitemizdeki "Destek Ol" sayfasında yer alan gönüllü başvuru formunu doldurarak gönüllü ağımıza katılabilirsiniz.',
        answer_en: 'Yes, you can work as a volunteer at our association. You can join our volunteer network by filling out the volunteer application form on the "Support Us" page of our website.',
      },
      {
        question_tr: 'Gönüllülük için belirli bir uzmanlık alanı gerekiyor mu?',
        question_en: 'Is a specific area of expertise required for volunteering?',
        answer_tr: 'Gönüllülerimiz farklı uzmanlık alanlarına göre çeşitli projelerde görev alabilirler. Eğitim, teknoloji, oyun tasarımı, grafik tasarım, sosyal medya yönetimi, proje yönetimi gibi alanlarda uzmanlığı olanlar için özel görevler bulunmaktadır. Ancak herhangi bir uzmanlık alanı olmayan kişiler de genel gönüllülük faaliyetlerine katılabilirler.',
        answer_en: 'Our volunteers can take part in various projects according to their different areas of expertise. There are specific roles for those with expertise in fields such as education, technology, game design, graphic design, social media management and project management. However, people without any area of expertise can also participate in general volunteering activities.',
      },
      {
        question_tr: 'Gönüllülük için ne kadar zaman ayırmam gerekiyor?',
        question_en: 'How much time do I need to allocate for volunteering?',
        answer_tr: 'Gönüllülük için ayırabileceğiniz zamana göre farklı görevler üstlenebilirsiniz. Haftalık birkaç saat ayırabileceğiniz görevler olduğu gibi, belirli projelerde daha yoğun çalışma gerektiren görevler de bulunmaktadır. Gönüllü başvuru formunda zaman uygunluğunuzu belirtebilirsiniz.',
        answer_en: 'You can take on different tasks depending on the time you can allocate for volunteering. There are tasks that require just a few hours a week, as well as tasks in certain projects that require more intensive work. You can specify your time availability in the volunteer application form.',
      },
      {
        question_tr: 'Gönüllülere eğitim veriliyor mu?',
        question_en: 'Is training provided to volunteers?',
        answer_tr: 'Evet, gönüllülerimize görev alacakları alanlarla ilgili oryantasyon ve eğitimler sağlanmaktadır. Ayrıca gönüllülerimizin kişisel ve mesleki gelişimlerine katkıda bulunacak eğitim programlarına ücretsiz katılım imkanı sunulmaktadır.',
        answer_en: 'Yes, our volunteers are provided with orientation and training related to the areas they will work in. In addition, our volunteers are offered free participation in training programs that will contribute to their personal and professional development.',
      },
    ],
  },
  {
    title_tr: 'Bağış ve Destek',
    title_en: 'Donations and Support',
    items: [
      {
        question_tr: 'Derneğinize nasıl bağış yapabilirim?',
        question_en: 'How can I make a donation to your association?',
        answer_tr: 'Derneğimize bağış yapmak için web sitemizdeki "Destek Ol" sayfasında yer alan bağış formunu kullanabilir, banka hesabımıza havale/EFT yapabilir veya dernek merkezimize şahsen başvurabilirsiniz.',
        answer_en: 'To make a donation to our association, you can use the donation form on the "Support Us" page of our website, make a bank transfer to our account, or apply in person at our headquarters.',
      },
      {
        question_tr: 'Bağışlar için vergi muafiyeti var mı?',
        question_en: 'Is there a tax exemption for donations?',
        answer_tr: 'Derneğimize yapılan bağışlar için vergi muafiyeti bulunmaktadır. Bağış makbuzunuz ile birlikte vergi dairenize başvurarak vergi muafiyetinden yararlanabilirsiniz.',
        answer_en: 'There is a tax exemption for donations made to our association. You can benefit from the tax exemption by applying to your tax office with your donation receipt.',
      },
      {
        question_tr: 'Ayni bağış (eşya, malzeme vb.) kabul ediyor musunuz?',
        question_en: 'Do you accept in-kind donations (goods, materials, etc.)?',
        answer_tr: 'Evet, derneğimiz ayni bağışları da kabul etmektedir. Özellikle teknolojik ekipman, eğitim materyalleri, kırtasiye malzemeleri gibi dernek faaliyetlerinde kullanılabilecek malzemeler için ayni bağış kabul edilmektedir. Ayni bağış yapmak için lütfen önceden derneğimizle iletişime geçiniz.',
        answer_en: 'Yes, our association also accepts in-kind donations. In-kind donations are accepted especially for materials that can be used in association activities, such as technological equipment, educational materials and stationery supplies. Please contact our association in advance to make an in-kind donation.',
      },
      {
        question_tr: 'Kurumsal sponsorluk mümkün mü?',
        question_en: 'Is corporate sponsorship possible?',
        answer_tr: 'Evet, derneğimiz kurumsal sponsorlukları kabul etmektedir. Projelerimize veya genel faaliyetlerimize sponsor olmak isteyen kurumlar için farklı sponsorluk paketlerimiz bulunmaktadır. Detaylı bilgi için info@egitimto.org adresine e-posta gönderebilirsiniz.',
        answer_en: 'Yes, our association accepts corporate sponsorships. We have different sponsorship packages for institutions that want to sponsor our projects or general activities. You can send an email to info@egitimto.org for detailed information.',
      },
    ],
  },
  {
    title_tr: 'İletişim',
    title_en: 'Contact',
    items: [
      {
        question_tr: 'Derneğe nasıl ulaşabilirim?',
        question_en: 'How can I reach the association?',
        answer_tr: 'Derneğimize e-posta veya web sitemizdeki iletişim formu aracılığıyla ulaşabilirsiniz. E-posta: info@egitimto.org; Adres: Fahrettin Altay, 65/20. Sk. No:14A, 35140 Karabağlar/İzmir.',
        answer_en: 'You can reach our association via email or through the contact form on our website. Email: info@egitimto.org; Address: Fahrettin Altay, 65/20. Sk. No:14A, 35140 Karabağlar/İzmir.',
      },
      {
        question_tr: 'Dernek merkezini ziyaret edebilir miyim?',
        question_en: 'Can I visit the association\'s headquarters?',
        answer_tr: 'Evet, dernek merkezimizi çalışma saatleri içerisinde (Pazartesi-Cuma, 09:00-18:00) ziyaret edebilirsiniz. Randevu almanız durumunda size daha iyi hizmet verebiliriz.',
        answer_en: 'Yes, you can visit our headquarters during working hours (Monday-Friday, 09:00-18:00). We can serve you better if you make an appointment.',
      },
      {
        question_tr: 'Basın ve medya ilişkileri için kiminle görüşmeliyim?',
        question_en: 'Who should I contact for press and media relations?',
        answer_tr: 'Basın ve medya ilişkileri için basin@egitimto.org adresine e-posta gönderebilirsiniz.',
        answer_en: 'You can send an email to basin@egitimto.org for press and media relations.',
      },
      {
        question_tr: 'Sosyal medya hesaplarınız var mı?',
        question_en: 'Do you have social media accounts?',
        answer_tr: 'Evet, derneğimizin Twitter, Instagram, Facebook ve YouTube hesapları bulunmaktadır. Sosyal medya hesaplarımızı takip ederek güncel duyuru ve etkinliklerimizden haberdar olabilirsiniz.',
        answer_en: 'Yes, our association has Twitter, Instagram, Facebook and YouTube accounts. You can follow our social media accounts to stay informed about our current announcements and events.',
      },
    ],
  },
]
```

- [ ] **Step 2: `/yasal/tuzuk` sayfasını yaz**

`src/app/yasal/tuzuk/page.tsx`:

```tsx
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function TuzukPage() {
  const locale = await getLocale()
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading title={localize('Dernek Tüzüğü', 'Association Charter', locale)} />
      <EmptyState
        message={localize(
          'Tüzüğün tam metni PDF olarak yakında burada yer alacak.',
          'The full text of the charter will be available here as a PDF soon.',
          locale
        )}
      />
    </div>
  )
}
```

- [ ] **Step 3: `/yasal/kvkk` sayfasını yaz**

`src/app/yasal/kvkk/page.tsx`:

```tsx
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { KVKK_SECTIONS } from '@/content/legal'

export default async function KvkkPage() {
  const locale = await getLocale()
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading title={localize('KVKK ve Gizlilik Politikası', 'Privacy Policy', locale)} />
      <div className="space-y-8">
        {KVKK_SECTIONS.map((section) => (
          <section key={section.title_tr}>
            <h2 className="font-display text-lg font-bold text-dark">
              {localize(section.title_tr, section.title_en, locale)}
            </h2>
            <p className="mt-2 whitespace-pre-line text-body-text">
              {localize(section.body_tr, section.body_en, locale)}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: `/yasal/etik-ilkeler` sayfasını yaz**

`src/app/yasal/etik-ilkeler/page.tsx`:

```tsx
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ETIK_SECTIONS } from '@/content/legal'

export default async function EtikIlkelerPage() {
  const locale = await getLocale()
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading title={localize('Etik İlkeler', 'Ethical Principles', locale)} />
      <div className="space-y-8">
        {ETIK_SECTIONS.map((section) => (
          <section key={section.title_tr}>
            <h2 className="font-display text-lg font-bold text-dark">
              {localize(section.title_tr, section.title_en, locale)}
            </h2>
            <p className="mt-2 whitespace-pre-line text-body-text">
              {localize(section.body_tr, section.body_en, locale)}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: `/yasal/sss` sayfasını yaz**

`src/app/yasal/sss/page.tsx`:

```tsx
import { getLocale } from '@/lib/i18n/locale'
import { localize } from '@/lib/i18n/localize'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SSS_CATEGORIES } from '@/content/legal'

export default async function SssPage() {
  const locale = await getLocale()
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading title={localize('Sıkça Sorulan Sorular', 'FAQ', locale)} />
      <div className="space-y-10">
        {SSS_CATEGORIES.map((category) => (
          <section key={category.title_tr}>
            <h2 className="font-display text-lg font-bold text-dark">
              {localize(category.title_tr, category.title_en, locale)}
            </h2>
            <div className="mt-4 space-y-4">
              {category.items.map((item) => (
                <div key={item.question_tr}>
                  <p className="font-semibold text-dark">{localize(item.question_tr, item.question_en, locale)}</p>
                  <p className="mt-1 text-sm text-body-text">{localize(item.answer_tr, item.answer_en, locale)}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 7: Manuel doğrula**

`npm run dev`, 4 yasal sayfayı da TR ve EN'de gez, KVKK metninde "GDPR" ifadesi geçmediğini doğrula. Sunucuyu durdur.

- [ ] **Step 8: Commit**

```bash
git add src/content/legal.ts src/app/yasal
git commit -m "Yasal sayfaları (Tüzük, KVKK, Etik İlkeler, SSS) ekle"
```

---

### Task 14: Son Doğrulama ve Deploy

**Files:** Yok (sadece doğrulama ve deploy)

- [ ] **Step 1: Tam build + lint + typecheck**

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: Üçü de hatasız tamamlanır.

- [ ] **Step 2: Vitest'i çalıştır**

Run: `npm run test`
Expected: Bölüm A'daki mevcut testler (localize, canAccessSection, client) hâlâ PASS.

- [ ] **Step 3: Kapsamlı manuel gezinme**

`npm run dev` çalıştır, sırasıyla doğrula:
1. Header'daki her link ve dropdown öğesi doğru sayfaya gidiyor
2. Her sayfa TR'de düzgün render oluyor, dil değiştirici ile EN'e geçince tüm metin İngilizceye dönüyor
3. Haberler, Etkinlikler, İşbirlikleri, Hakkımızda'daki Tüzük/Beyannameler/Faaliyet Raporları boş state'leri düzgün görünüyor
4. `/haberler/olmayan`, `/etkinlikler/olmayan` 404 veriyor
5. İletişim formu başarıyla gönderiliyor ve `contact_messages`'a yazıyor
6. `/admin/login` ve `/admin` akışı (Bölüm A) hâlâ çalışıyor, Header/Footer admin panelinde görünmüyor
7. Sunucuyu durdur

- [ ] **Step 4: Vercel'e push et ve canlı deploy'u doğrula**

```bash
git push origin main
```

Vercel dashboard'unda deploy'un başarılı olduğunu doğrula, ardından canlı URL'de Step 3'teki gezinmeyi tekrarla.

---

## Self-Review Notu

- **Spec kapsaması:** §3 (route yapısı) → her task kendi route'unu üretiyor; §4 (veri modeli genişletmesi) → Task 1; §5.1-5.11 (sayfa bazlı içerik) → Task 4-13 birebir eşleşiyor; §6 (ortak bileşenler) → Task 2, 3, 9; §7 (asset taşıma, plan kararıyla Storage yerine `public/images/`) → Task 4, 5; §8 (i18n) → Task 3 ve her sayfa görevi; §9 (test stratejisi) → Task 14; §10 (kapsam dışı: admin CRUD, domain taşıma, Faz 2) bu plana dahil edilmedi.
- **Placeholder taraması:** Tüm sayfalarda gerçek, canlı siteden alınmış veya (Alanlarımız/Yasal EN için) iş seviyesinde çevrilmiş tam içerik kullanıldı; "TODO"/"benzer şekilde doldur" yok. Tüzük PDF ve Haberler/Etkinlikler/İşbirlikleri boş state'leri spec'in kendisinin istediği bilinçli bir durum, placeholder değil.
- **Tip tutarlılığı:** `ContactMessage`, `AboutContent` (genişletilmiş), `NewsItem`/`EventItem`/`Partnership`/`TeamMember` tipleri Bölüm A + Task 1'den değişmeden kullanılıyor; `localize(tr, en, locale)` imzası tüm görevlerde birebir aynı; `getLocale()` her sayfada `await` ile tutarlı çağrılıyor.
