# egitimto.org Web Sitesi — Faz 1 / Bölüm A: Temel Altyapı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js + Tailwind sitesinin tasarım sistemini, Supabase veri katmanını (şema + RLS), i18n/RBAC yardımcı fonksiyonlarını ve rol tabanlı korumalı bir admin panel iskeletini kurmak — bu planın sonunda, boş ama gerçek kimlik doğrulama ve role göre menü gösteren, çalışan ve deploy edilmiş bir admin paneli olacak.

**Architecture:** Next.js 16 App Router + TypeScript + Tailwind v4 (CSS-tabanlı tema). Supabase (Postgres + Auth + Storage) `@supabase/ssr` ile SSR-uyumlu şekilde bağlanır. Tüm tablolarda Row Level Security zorunlu; rol kontrolü tek bir `security definer` fonksiyonu (`public.current_user_role()`) üzerinden yapılır.

**Tech Stack:** Next.js 16.3.4, React 19, TypeScript, Tailwind CSS v4, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Vitest (unit testler).

**Spec:** `docs/superpowers/specs/2026-09-02-egitimto-web-rebuild-design.md`

## Global Constraints

- Renkler (spec §4): primary `#FF6B35` (gradient `#FF8C42 → #FF6B35 → #E85A2A`, 135°), secondary `#2C3E50`, krem gradyan `#F5F5F0 → #E8E8E3`, koyu/footer `#212529`, gövde metni `#343A40`
- Tipografi (spec §4): başlıklarda **Space Grotesk**, gövde/arayüzde **Inter** (next/font/google ile, self-hosted)
- Tüzel kişilik adı her yerde birebir: "Eğitim Teknoloji ve Oyun Derneği" (virgülsüz)
- i18n (spec §6): TR/EN içerik `_tr`/`_en` sütun çiftleriyle tutulur; bu planda cookie tabanlı basit locale mekanizması kurulur (URL segment routing YOK — YAGNI)
- Supabase her tabloda RLS zorunlu (spec §7); rol kontrolü `(select public.current_user_role())` deseniyle, per-row fonksiyon çağrısından kaçınılarak yazılır
- Roller: `admin` (tam erişim) ve `moderator` (yalnızca Haberler + Eğitim ve Etkinlikler) — spec §7
- Admin kullanıcı davetleri ve rol ataması bu fazda bir UI ile değil, Supabase Dashboard üzerinden elle yapılır (YAGNI — küçük ekip, self-servis kullanıcı yönetimi ekranı şimdilik gereksiz)
- Test stratejisi: saf mantık (i18n, RBAC helper'ları) Vitest ile TDD; Next.js sunucu bileşenleri/Server Action'lar `npm run build` + `npm run dev` ile manuel doğrulanır (Next.js'in kendi request/cookie bağlamı olmadan bunları mock'lamak kırılgan ve düşük değerli olur)
- Ortam değişkenleri: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`.env.local` içinde yerelde, Vercel proje ayarlarında canlıda)

---

### Task 1: Tasarım Tokenları ve Fontlar

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: Tailwind utility sınıfları `bg-primary`, `text-primary`, `bg-secondary`, `text-secondary`, `bg-dark`, `text-dark`, `text-body-text`, `font-display` (Space Grotesk), `font-sans` (Inter, varsayılan gövde fontu), yardımcı sınıflar `.gradient-primary` ve `.gradient-cream`. Sonraki tüm sayfa/bileşen görevleri bunları kullanır.

- [ ] **Step 1: `globals.css`'i yeni tasarım tokenlarıyla değiştir**

`src/app/globals.css` dosyasının tamamını şununla değiştir:

```css
@import "tailwindcss";

:root {
  --primary: #FF6B35;
  --primary-light: #FF8C42;
  --primary-dark: #E85A2A;
  --secondary: #2C3E50;
  --cream-start: #F5F5F0;
  --cream-end: #E8E8E3;
  --dark: #212529;
  --body-text: #343A40;
}

@theme inline {
  --color-primary: var(--primary);
  --color-primary-light: var(--primary-light);
  --color-primary-dark: var(--primary-dark);
  --color-secondary: var(--secondary);
  --color-dark: var(--dark);
  --color-body-text: var(--body-text);
  --font-display: var(--font-space-grotesk);
  --font-sans: var(--font-inter);
}

body {
  color: var(--body-text);
  font-family: var(--font-sans), sans-serif;
}

.gradient-primary {
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 50%, var(--primary-dark) 100%);
}

.gradient-cream {
  background: linear-gradient(135deg, var(--cream-start) 0%, var(--cream-end) 100%);
}
```

- [ ] **Step 2: `layout.tsx`'te fontları Geist'ten Space Grotesk + Inter'e değiştir**

`src/app/layout.tsx` dosyasının tamamını şununla değiştir:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Build ile doğrula**

Run: `npm run build`
Expected: Build hatasız tamamlanır (font importları ve CSS geçerli olduğu için).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "Tasarım tokenlarını ve Space Grotesk/Inter fontlarını kur"
```

---

### Task 2: Supabase İstemcileri, Tip Tanımları ve Vitest Kurulumu

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/types.ts`
- Create: `src/lib/supabase/client.test.ts`
- Create: `.env.local.example`
- Create: `vitest.config.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `createClient()` (browser, `src/lib/supabase/client.ts`), `createClient()` (server, async, `src/lib/supabase/server.ts`), tipler `Locale`, `Role`, `Document`, `AboutContent`, `TeamCategory`, `TeamMember`, `SocialLinks`, `Partnership`, `NewsItem`, `EventItem`, `UserRole` (`src/lib/supabase/types.ts`). Sonraki tüm görevler bu iki `createClient` fonksiyonunu ve bu tipleri kullanır.

- [ ] **Step 1: Bağımlılıkları ekle**

`package.json`'daki `dependencies` ve `devDependencies` bloklarını güncelle:

```json
{
  "name": "egitimto-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "16.3.4",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "@supabase/ssr": "^0.7.0",
    "@supabase/supabase-js": "^2.58.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.4",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^3.2.4"
  }
}
```

Run: `npm install`
Expected: Kurulum hatasız tamamlanır.

- [ ] **Step 2: Vitest yapılandırmasını oluştur**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

- [ ] **Step 3: Ortam değişkeni örneğini oluştur**

`.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Bu iki değeri gerçek `.env.local` dosyasında (git'e girmez, `.gitignore` zaten kapsıyor) Supabase projesinin **Project Settings → API** sayfasındaki `Project URL` ve `anon public` anahtarıyla doldur. Aynı iki değeri Vercel projesinin **Settings → Environment Variables** kısmına da ekle (Production + Preview).

- [ ] **Step 4: Ortak veritabanı tiplerini yaz**

`src/lib/supabase/types.ts`:

```ts
export type Locale = 'tr' | 'en'

export type Role = 'admin' | 'moderator'

export interface UserRole {
  user_id: string
  role: Role
  created_at: string
}

export interface Document {
  id: string
  type: 'beyanname' | 'faaliyet_raporu'
  title: string
  year: number
  pdf_url: string
  sort_order: number
  created_at: string
}

export interface AboutContent {
  id: number
  tuzuk_pdf_url: string | null
  amac_ilkeler_tr: string
  amac_ilkeler_en: string
  updated_at: string
}

export interface TeamCategory {
  id: string
  name_tr: string
  name_en: string
  sort_order: number
}

export interface SocialLinks {
  instagram?: string
  linkedin?: string
  twitter?: string
  email?: string
}

export interface TeamMember {
  id: string
  category_id: string
  full_name: string
  role_tr: string
  role_en: string
  photo_url: string | null
  email: string | null
  social_links: SocialLinks
  sort_order: number
}

export interface Partnership {
  id: string
  name: string
  project_description_tr: string
  project_description_en: string
  logo_url: string
  sort_order: number
}

export interface NewsItem {
  id: string
  slug: string
  title_tr: string
  title_en: string
  content_tr: string
  content_en: string
  cover_image: string | null
  published_at: string | null
  show_apply_button: boolean
  apply_button_url: string | null
  is_published: boolean
  created_at: string
}

export interface EventItem extends NewsItem {
  event_date: string | null
  location: string | null
}
```

- [ ] **Step 5: Başarısız olan istemci testini yaz**

`src/lib/supabase/client.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'

describe('createClient (browser)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('creates a Supabase client without throwing when env vars are present', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

    const { createClient } = await import('./client')
    expect(() => createClient()).not.toThrow()
  })
})
```

Run: `npm run test`
Expected: FAIL — `src/lib/supabase/client.ts` henüz mevcut değil.

- [ ] **Step 6: Tarayıcı istemcisini oluştur**

`src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 7: Testi çalıştırıp geçtiğini doğrula**

Run: `npm run test`
Expected: PASS

- [ ] **Step 8: Sunucu istemcisini oluştur**

`src/lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component render sırasında çağrıldı; oturum yenilemesini middleware yapar.
          }
        },
      },
    }
  )
}
```

Bu dosya için ayrı bir birim testi yazılmaz — `next/headers`'a bağımlılığı gerçek bir Next.js request bağlamı gerektirir, Task 6'da (giriş sayfası) uçtan uca doğrulanır.

- [ ] **Step 9: Build ile doğrula**

Run: `npm run build`
Expected: TypeScript hatasız derlenir.

- [ ] **Step 10: Commit**

```bash
git add src/lib/supabase package.json package-lock.json vitest.config.ts .env.local.example
git commit -m "Supabase istemcilerini, tip tanımlarını ve Vitest kurulumunu ekle"
```

---

### Task 3: Veritabanı Şeması, RLS Politikaları ve Depolama Bucket'ları

**Files:**
- Create: `supabase/migrations/0001_schema.sql`
- Create: `supabase/migrations/0002_rls.sql`
- Create: `supabase/migrations/0003_storage.sql`

**Interfaces:**
- Produces: Postgres tabloları `user_roles`, `documents`, `about_content`, `team_categories`, `team_members`, `partnerships`, `news`, `events`; fonksiyon `public.current_user_role()`; storage bucket'ları `team-photos`, `partnership-logos`, `news-events-covers`, `document-files`. Sonraki tüm görevler (admin CRUD, public sayfalar) bu tabloları ve bucket'ları kullanır.

- [ ] **Step 1: Şema migration dosyasını yaz**

`supabase/migrations/0001_schema.sql`:

```sql
create extension if not exists "pgcrypto";

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'moderator')),
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('beyanname', 'faaliyet_raporu')),
  title text not null,
  year integer not null,
  pdf_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index documents_type_year_idx on public.documents (type, year desc);

create table public.about_content (
  id integer primary key default 1,
  tuzuk_pdf_url text,
  amac_ilkeler_tr text not null default '',
  amac_ilkeler_en text not null default '',
  updated_at timestamptz not null default now(),
  constraint about_content_singleton check (id = 1)
);
insert into public.about_content (id) values (1);

create table public.team_categories (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null,
  name_en text not null,
  sort_order integer not null default 0
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.team_categories (id) on delete cascade,
  full_name text not null,
  role_tr text not null,
  role_en text not null,
  photo_url text,
  email text,
  social_links jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0
);
create index team_members_category_id_idx on public.team_members (category_id);

create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project_description_tr text not null default '',
  project_description_en text not null default '',
  logo_url text not null,
  sort_order integer not null default 0
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_tr text not null,
  title_en text not null,
  content_tr text not null default '',
  content_en text not null default '',
  cover_image text,
  published_at timestamptz,
  show_apply_button boolean not null default false,
  apply_button_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create index news_is_published_published_at_idx on public.news (is_published, published_at desc);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_tr text not null,
  title_en text not null,
  content_tr text not null default '',
  content_en text not null default '',
  cover_image text,
  event_date date,
  location text,
  published_at timestamptz,
  show_apply_button boolean not null default false,
  apply_button_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create index events_is_published_event_date_idx on public.events (is_published, event_date desc);
```

- [ ] **Step 2: RLS migration dosyasını yaz**

`supabase/migrations/0002_rls.sql`:

```sql
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.user_roles where user_id = (select auth.uid())
$$;

revoke execute on function public.current_user_role() from public, anon;
grant execute on function public.current_user_role() to authenticated;

alter table public.user_roles enable row level security;
alter table public.documents enable row level security;
alter table public.about_content enable row level security;
alter table public.team_categories enable row level security;
alter table public.team_members enable row level security;
alter table public.partnerships enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;

-- user_roles: doğrudan istemci erişimi yok; yalnızca current_user_role() üzerinden (definer ayrıcalığıyla) okunur

create policy "documents_public_read" on public.documents
  for select to anon, authenticated using (true);
create policy "documents_admin_write" on public.documents
  for all to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

create policy "about_content_public_read" on public.about_content
  for select to anon, authenticated using (true);
create policy "about_content_admin_update" on public.about_content
  for update to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

create policy "team_categories_public_read" on public.team_categories
  for select to anon, authenticated using (true);
create policy "team_categories_admin_write" on public.team_categories
  for all to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

create policy "team_members_public_read" on public.team_members
  for select to anon, authenticated using (true);
create policy "team_members_admin_write" on public.team_members
  for all to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

create policy "partnerships_public_read" on public.partnerships
  for select to anon, authenticated using (true);
create policy "partnerships_admin_write" on public.partnerships
  for all to authenticated
  using ((select public.current_user_role()) = 'admin')
  with check ((select public.current_user_role()) = 'admin');

create policy "news_public_read" on public.news
  for select to anon, authenticated using (is_published = true);
create policy "news_staff_all" on public.news
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'moderator'))
  with check ((select public.current_user_role()) in ('admin', 'moderator'));

create policy "events_public_read" on public.events
  for select to anon, authenticated using (is_published = true);
create policy "events_staff_all" on public.events
  for all to authenticated
  using ((select public.current_user_role()) in ('admin', 'moderator'))
  with check ((select public.current_user_role()) in ('admin', 'moderator'));
```

- [ ] **Step 3: Storage migration dosyasını yaz**

`supabase/migrations/0003_storage.sql`:

```sql
insert into storage.buckets (id, name, public)
values
  ('team-photos', 'team-photos', true),
  ('partnership-logos', 'partnership-logos', true),
  ('news-events-covers', 'news-events-covers', true),
  ('document-files', 'document-files', true)
on conflict (id) do nothing;

create policy "team_photos_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'team-photos');
create policy "team_photos_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'team-photos' and (select public.current_user_role()) = 'admin')
  with check (bucket_id = 'team-photos' and (select public.current_user_role()) = 'admin');

create policy "partnership_logos_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'partnership-logos');
create policy "partnership_logos_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'partnership-logos' and (select public.current_user_role()) = 'admin')
  with check (bucket_id = 'partnership-logos' and (select public.current_user_role()) = 'admin');

create policy "news_events_covers_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'news-events-covers');
create policy "news_events_covers_staff_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'news-events-covers' and (select public.current_user_role()) in ('admin', 'moderator'))
  with check (bucket_id = 'news-events-covers' and (select public.current_user_role()) in ('admin', 'moderator'));

create policy "document_files_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'document-files');
create policy "document_files_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'document-files' and (select public.current_user_role()) = 'admin')
  with check (bucket_id = 'document-files' and (select public.current_user_role()) = 'admin');
```

- [ ] **Step 4: Migration'ları Supabase projesine uygula**

Supabase MCP aracını kullan:
1. `mcp__plugin_supabase_supabase__list_projects` ile `egitimto-web` projesinin `project_id`'sini bul
2. `mcp__plugin_supabase_supabase__apply_migration` ile sırasıyla `0001_schema`, `0002_rls`, `0003_storage` migration'larını (her biri kendi adı ve yukarıdaki SQL içeriğiyle) uygula

- [ ] **Step 5: Doğrula**

1. `mcp__plugin_supabase_supabase__list_tables` çalıştır, 8 tablonun da (`user_roles`, `documents`, `about_content`, `team_categories`, `team_members`, `partnerships`, `news`, `events`) `rls_enabled: true` ile listelendiğini doğrula
2. `mcp__plugin_supabase_supabase__get_advisors` (tür: `security`) çalıştır, bu tablolarla ilgili "RLS disabled" uyarısı olmadığını doğrula

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations
git commit -m "Veritabanı şemasını, RLS politikalarını ve storage bucket'larını ekle"
```

---

### Task 4: i18n Yardımcı Fonksiyonları

**Files:**
- Create: `src/lib/i18n/locale.ts`
- Create: `src/lib/i18n/localize.ts`
- Create: `src/lib/i18n/localize.test.ts`

**Interfaces:**
- Consumes: `Locale` tipi (`src/lib/supabase/types.ts`, Task 2)
- Produces: `LOCALE_COOKIE: string`, `DEFAULT_LOCALE: Locale`, `getLocale(): Promise<Locale>` (`src/lib/i18n/locale.ts`); `localize(tr: string, en: string, locale: Locale): string` (`src/lib/i18n/localize.ts`). Public sayfa görevleri (Faz 1 Bölüm B/C) bunları kullanacak.

- [ ] **Step 1: Başarısız olan `localize` testini yaz**

`src/lib/i18n/localize.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { localize } from './localize'

describe('localize', () => {
  it('returns the Turkish value when locale is tr', () => {
    expect(localize('Merhaba', 'Hello', 'tr')).toBe('Merhaba')
  })

  it('returns the English value when locale is en', () => {
    expect(localize('Merhaba', 'Hello', 'en')).toBe('Hello')
  })

  it('falls back to Turkish when the English value is empty', () => {
    expect(localize('Merhaba', '', 'en')).toBe('Merhaba')
  })
})
```

Run: `npm run test`
Expected: FAIL — `./localize` henüz mevcut değil.

- [ ] **Step 2: `localize` fonksiyonunu yaz**

`src/lib/i18n/localize.ts`:

```ts
import type { Locale } from '@/lib/supabase/types'

export function localize(tr: string, en: string, locale: Locale): string {
  return locale === 'en' && en.trim().length > 0 ? en : tr
}
```

- [ ] **Step 3: Testi çalıştırıp geçtiğini doğrula**

Run: `npm run test`
Expected: PASS

- [ ] **Step 4: `locale.ts`'i yaz**

`src/lib/i18n/locale.ts`:

```ts
import { cookies } from 'next/headers'
import type { Locale } from '@/lib/supabase/types'

export const LOCALE_COOKIE = 'egitimto_locale'
export const DEFAULT_LOCALE: Locale = 'tr'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE)?.value
  return value === 'en' ? 'en' : DEFAULT_LOCALE
}
```

Bu dosya `next/headers`'a bağımlı olduğu için ayrı birim testi yazılmaz; ilk gerçek kullanıcısı olan dil değiştirme bileşeni Faz 1 Bölüm C'de (public sayfalar) uçtan uca doğrulanır.

- [ ] **Step 5: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 6: Commit**

```bash
git add src/lib/i18n
git commit -m "i18n locale ve localize yardımcı fonksiyonlarını ekle"
```

---

### Task 5: Yetkilendirme (RBAC) Yardımcı Fonksiyonu

**Files:**
- Create: `src/lib/auth/roles.ts`
- Create: `src/lib/auth/roles.test.ts`

**Interfaces:**
- Consumes: `Role` tipi (`src/lib/supabase/types.ts`, Task 2)
- Produces: `AdminSection` tipi, `canAccessSection(role: Role | null, section: AdminSection): boolean`. Task 7 (admin iskeleti) ve Faz 1 Bölüm B'deki her admin CRUD sayfası bunu kullanır.

- [ ] **Step 1: Başarısız olan testi yaz**

`src/lib/auth/roles.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { canAccessSection } from './roles'

describe('canAccessSection', () => {
  it('allows admin to access every section', () => {
    expect(canAccessSection('admin', 'ekibimiz')).toBe(true)
    expect(canAccessSection('admin', 'haberler')).toBe(true)
  })

  it('allows moderator to access only haberler and etkinlikler', () => {
    expect(canAccessSection('moderator', 'haberler')).toBe(true)
    expect(canAccessSection('moderator', 'etkinlikler')).toBe(true)
    expect(canAccessSection('moderator', 'ekibimiz')).toBe(false)
    expect(canAccessSection('moderator', 'isbirlikleri')).toBe(false)
    expect(canAccessSection('moderator', 'hakkimizda')).toBe(false)
  })

  it('denies access when role is null', () => {
    expect(canAccessSection(null, 'haberler')).toBe(false)
  })
})
```

Run: `npm run test`
Expected: FAIL — `./roles` henüz mevcut değil.

- [ ] **Step 2: `roles.ts`'i yaz**

`src/lib/auth/roles.ts`:

```ts
import type { Role } from '@/lib/supabase/types'

export type AdminSection =
  | 'haberler'
  | 'etkinlikler'
  | 'ekibimiz'
  | 'isbirlikleri'
  | 'hakkimizda'

const MODERATOR_SECTIONS: AdminSection[] = ['haberler', 'etkinlikler']

export function canAccessSection(role: Role | null, section: AdminSection): boolean {
  if (role === 'admin') return true
  if (role === 'moderator') return MODERATOR_SECTIONS.includes(section)
  return false
}
```

- [ ] **Step 3: Testi çalıştırıp geçtiğini doğrula**

Run: `npm run test`
Expected: PASS (Task 4 ve Task 5'in tüm testleri dahil, toplam 6 test geçmeli)

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth/roles.ts src/lib/auth/roles.test.ts
git commit -m "RBAC canAccessSection yardımcı fonksiyonunu ekle"
```

---

### Task 6: Supabase Auth Girişi ve `/admin` Rota Koruması

**Files:**
- Create: `middleware.ts`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/login/actions.ts`
- Create: `src/lib/auth/get-current-role.ts`

**Interfaces:**
- Consumes: `createClient()` (server, Task 2), `Role` tipi (Task 2)
- Produces: `getCurrentRole(): Promise<Role | null>` (`src/lib/auth/get-current-role.ts`). Task 7 ve tüm admin sayfaları bunu kullanır. `/admin/*` rotaları, giriş yapmamış kullanıcıyı `/admin/login`'e yönlendirir.

- [ ] **Step 1: Root-level middleware'i yaz**

`middleware.ts` (proje kökünde, `src/` dışında):

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/admin/login'
  if (request.nextUrl.pathname.startsWith('/admin') && !isLoginPage && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 2: Giriş Server Action'ını yaz**

`src/app/admin/login/actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/admin')
}
```

- [ ] **Step 3: Giriş sayfasını yaz**

`src/app/admin/login/page.tsx`:

```tsx
import { signIn } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <form
        action={signIn}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 p-8"
      >
        <h1 className="font-display text-2xl font-bold text-dark">Yönetim Paneli Girişi</h1>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-body-text">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-body-text">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="gradient-primary w-full rounded-full px-4 py-2 font-semibold text-white"
        >
          Giriş Yap
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 4: `getCurrentRole` yardımcı fonksiyonunu yaz**

`src/lib/auth/get-current-role.ts`:

```ts
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/supabase/types'

export async function getCurrentRole(): Promise<Role | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase.rpc('current_user_role')
  return (data as Role) ?? null
}
```

- [ ] **Step 5: Build ile doğrula**

Run: `npm run build`
Expected: Hatasız derlenir.

- [ ] **Step 6: İlk admin kullanıcısını oluştur (manuel, tek seferlik)**

1. Supabase Dashboard → **Authentication → Users → Add user**: `dev@egitimto.org` ile bir kullanıcı oluştur, güçlü bir şifre belirle
2. Supabase Dashboard → **SQL Editor**'de çalıştır (yukarıda oluşturulan kullanıcının UUID'sini **Authentication → Users** sayfasından kopyala):

```sql
insert into public.user_roles (user_id, role)
values ('<KULLANICI_UUID>', 'admin');
```

- [ ] **Step 7: Manuel olarak doğrula**

1. `npm run dev` çalıştır
2. Tarayıcıda `http://localhost:3000/admin` adresine git → `/admin/login`'e yönlendirildiğini doğrula (middleware çalışıyor)
3. `dev@egitimto.org` ve şifresiyle giriş yap → `/admin`'e yönlendirildiğini doğrula (henüz boş bir sayfa olabilir, Task 7'de doldurulacak)
4. Sunucuyu durdur (Ctrl+C)

- [ ] **Step 8: Commit**

```bash
git add middleware.ts src/app/admin/login src/lib/auth/get-current-role.ts
git commit -m "Supabase Auth girişini ve /admin rota korumasını ekle"
```

---

### Task 7: Admin Panel İskeleti (Layout + Role Bazlı Menü + Çıkış Yap)

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/actions.ts`
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `getCurrentRole()` (Task 6), `canAccessSection()`, `AdminSection` (Task 5), `createClient()` server (Task 2)
- Produces: Her admin alt sayfasının (Faz 1 Bölüm B'de eklenecek) otomatik olarak içine yerleşeceği `/admin` layout'u ve rol bazlı filtrelenmiş sol menü.

- [ ] **Step 1: Çıkış yap Server Action'ını yaz**

`src/app/admin/actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
```

- [ ] **Step 2: Admin layout'unu yaz**

`src/app/admin/layout.tsx`:

```tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentRole } from '@/lib/auth/get-current-role'
import { canAccessSection, type AdminSection } from '@/lib/auth/roles'
import { signOut } from './actions'

const NAV_ITEMS: { href: string; label: string; section: AdminSection }[] = [
  { href: '/admin/haberler', label: 'Haberler', section: 'haberler' },
  { href: '/admin/etkinlikler', label: 'Eğitim ve Etkinlikler', section: 'etkinlikler' },
  { href: '/admin/ekibimiz', label: 'Ekibimiz', section: 'ekibimiz' },
  { href: '/admin/isbirlikleri', label: 'İşbirlikleri', section: 'isbirlikleri' },
  { href: '/admin/hakkimizda', label: 'Hakkımızda', section: 'hakkimizda' },
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
        <p className="mb-4 font-display text-lg font-bold text-dark">Yönetim Paneli</p>
        <nav className="space-y-1">
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
```

- [ ] **Step 3: Admin ana sayfasını yaz**

`src/app/admin/page.tsx`:

```tsx
export default function AdminHomePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-dark">Hoş geldiniz</h1>
      <p className="mt-2 text-body-text">Soldaki menüden yönetmek istediğiniz bölümü seçin.</p>
    </div>
  )
}
```

- [ ] **Step 4: Build ile doğrula**

Run: `npm run build`

- [ ] **Step 5: Manuel olarak rol bazlı menüyü doğrula**

1. `npm run dev` çalıştır, `dev@egitimto.org` (rolü `admin`) ile `/admin`'e giriş yap → sol menüde **5 öğenin de** (Haberler, Eğitim ve Etkinlikler, Ekibimiz, İşbirlikleri, Hakkımızda) göründüğünü doğrula
2. Supabase SQL Editor'de aynı kullanıcının rolünü geçici olarak değiştir: `update public.user_roles set role = 'moderator' where user_id = '<UUID>';`
3. Sayfayı yenile → sol menüde **yalnızca Haberler ve Eğitim ve Etkinlikler** göründüğünü doğrula
4. Rolü tekrar `admin`'e geri al: `update public.user_roles set role = 'admin' where user_id = '<UUID>';`
5. "Çıkış Yap"a tıkla → `/admin/login`'e yönlendirildiğini doğrula
6. Sunucuyu durdur

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/layout.tsx src/app/admin/actions.ts src/app/admin/page.tsx
git commit -m "Admin panel iskeletini ve rol bazlı menüyü ekle"
```

- [ ] **Step 7: Vercel'e push et ve canlı deploy'u doğrula**

```bash
git push origin main
```

Vercel dashboard'unda yeni deploy'un başarılı olduğunu doğrula, ardından canlı URL'de `/admin` akışını (Step 5'teki gibi) tekrar test et.

---

## Self-Review Notu

- **Spec kapsaması:** §4 (tasarım tokenları/fontlar) → Task 1; §6 (veri modeli) → Task 3; §7 (auth/RBAC) → Task 5, 6, 7; §3'teki altyapı zaten tamamlanmış olarak işaretlendi. §5 (public sayfalar), §8 (uyumluluk içerikleri) ve admin CRUD ekranları (Haberler/Etkinlikler/Ekibimiz/İşbirlikleri/Hakkımızda) bu planın kapsamında değil — ayrı, takip eden planlarda (Bölüm B: admin CRUD, Bölüm C: public sayfalar) ele alınacak.
- **Placeholder taraması:** Tüm adımlarda gerçek, çalışan kod var; "TODO"/"benzer şekilde yap" yok.
- **Tip tutarlılığı:** `Role`, `Locale`, `NewsItem`, `EventItem` vb. tipler Task 2'de tanımlanıp sonraki tüm görevlerde birebir aynı adlarla içe aktarılıyor; `current_user_role()` fonksiyon adı Task 3 (SQL) ve Task 6 (`getCurrentRole`'un `.rpc()` çağrısı) arasında tutarlı.
