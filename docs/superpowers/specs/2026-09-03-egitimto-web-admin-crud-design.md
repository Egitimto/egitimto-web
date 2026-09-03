# egitimto.org Yeniden Yapılanması — Faz 1 / Bölüm C: Admin İçerik Yönetimi (CRUD) — Tasarım Spesifikasyonu

**Tarih:** 2026-09-03
**Durum:** Onaylandı
**Ön koşul:** Faz 1 / Bölüm A (temel altyapı, admin auth/iskelet) ve Bölüm B (public sayfalar, tüm tablolar okunuyor) tamamlandı.

## 1. Amaç ve Kapsam

Bölüm B'de public sayfalar veritabanından okuyacak şekilde kodlandı ama içerik girişi için hiçbir arayüz yoktu (Haberler, Etkinlikler, Ekibimiz, İşbirlikleri boş state ile başlıyordu; Hakkımızda içeriği SQL ile elle girildi). Bu spesifikasyon, kod bilmeyen dernek personelinin bu içerikleri admin panelden yönetebilmesini sağlayan CRUD ekranlarını tanımlar.

**Kapsamdaki bölümler:**
1. Haberler (`news`)
2. Etkinlikler (`events`)
3. Ekibimiz (`team_categories` + `team_members`)
4. İşbirlikleri (`partnerships`)
5. Hakkımızda (`about_content` — tekil satır düzenleme)
6. Belgeler (`documents` — Beyannameler + Faaliyet Raporları)
7. Gelen Mesajlar (`contact_messages` — salt okunur + sil)

**Kapsam dışı:** Kullanıcı davetleri/rol atama (Bölüm A kararı, Supabase Dashboard üzerinden elle kalır), egitimto.org domain taşıma, Faz 2 (iyzico).

## 2. RBAC Genişletmesi

`src/lib/auth/roles.ts`'teki `AdminSection` tipine 2 yeni değer eklenir: `'belgeler'`, `'mesajlar'`. `MODERATOR_SECTIONS` değişmez (`['haberler', 'etkinlikler']`) — yani Belgeler ve Gelen Mesajlar yalnızca `admin` rolüne açıktır (spec ana doküman §7 ile tutarlı: moderatör yalnızca Haberler + Etkinlikler'e erişir).

`src/app/admin/(protected)/layout.tsx`'teki `NAV_ITEMS`'a bu 2 bölüm eklenir.

## 3. Ortak Desen

Her bölüm için aynı üç dosya seti:

```
src/app/admin/(protected)/<bölüm>/
  page.tsx        — liste görünümü, requireSection('<bölüm>') ile korunur
  actions.ts       — Server Action'lar: create/update/delete
  [id]/page.tsx    — oluştur/düzenle formu (create için [id] = 'new')
```

Formlar TR/EN alanları alt alta gösterir (yan yana değil — dar admin ekranında daha okunaklı, spec kararı). Tüm mutasyonlar Server Action'lar üzerinden `createClient()` (server) ile yapılır, başarılı işlemden sonra `revalidatePath` + `redirect` ile liste sayfasına dönülür.

## 4. Ortak Bileşenler (`src/components/admin/`)

- `AdminTable` — liste sayfalarında satır + "Düzenle"/"Sil" aksiyonları için genel tablo kabuğu
- `FormField` — label + input/textarea sarmalayıcı (TR/EN çifti için iki kez kullanılır)
- `ImageUploadField` — mevcut görseli önizler, yeni dosya seçilirse formda tutar (Server Action'da yüklenir)
- `DeleteButton` — `confirm()` ile onay isteyen, `formAction` tetikleyen silme butonu
- `PublishToggle` — Haberler/Etkinlikler için `is_published` checkbox'ı

## 5. Dosya/Görsel Yükleme

Mevcut Storage bucket'ları (Bölüm A) kullanılır: `team-photos`, `partnership-logos`, `news-events-covers`, `document-files`. Akış:

1. Form `<input type="file" name="photo">` içerir (mevcut URL varsa küçük önizleme ile)
2. Server Action `formData.get('photo')` ile `File` nesnesini alır; dosya seçilmemişse mevcut URL korunur
3. `supabase.storage.from('<bucket>').upload(path, file, { upsert: true })` ile yüklenir — `path` örn. `${crypto.randomUUID()}-${file.name}`
4. `getPublicUrl(path)` ile alınan URL, ilgili tabloya (`photo_url`, `logo_url`, `cover_image`, `pdf_url`) yazılır
5. Ayrı bir API route yok — hepsi Server Action içinde senkron olarak yapılır

## 6. Bölüm Bazlı Detaylar

### 6.1 Haberler / Etkinlikler
Alanlar: `title_tr/en`, `content_tr/en` (düz textarea, boş satırla paragraf ayrımı — Bölüm B'de `whitespace-pre-line` ile zaten doğru render ediliyor), `cover_image` (ImageUploadField), `is_published` (PublishToggle, varsayılan kapalı), `show_apply_button` + `apply_button_url` (koşullu görünür), Etkinlikler'de ayrıca `event_date` + `location`. `slug`, başlıktan otomatik üretilir (Türkçe karakterleri sadeleştiren bir `slugify` yardımcı fonksiyonu ile) ve formda düzenlenebilir bir alan olarak gösterilir (kullanıcı isterse değiştirir).

### 6.2 Ekibimiz
İki alt ekran: **Kategoriler** (`team_categories` — basit liste + ekle/sil, `name_tr/en`, `sort_order`) ve **Üyeler** (`team_members` — `category_id` seçimi dropdown, `full_name`, `role_tr/en`, `photo_url` ImageUploadField, `email`, `social_links` — instagram/linkedin/twitter/email için 4 ayrı URL input, `sort_order` sayısal alan).

### 6.3 İşbirlikleri
`name`, `project_description_tr/en`, `logo_url` (ImageUploadField), `sort_order`.

### 6.4 Hakkımızda
Liste değil, tek bir düzenleme formu (`about_content` id=1 satırı). Alanlar: `kurulus_tr/en`, `amac_ilkeler_tr/en`, `vizyon_tr/en`, `degerler_tr/en` (hepsi textarea), `tuzuk_pdf_url` (dosya yükleme — `document-files` bucket).

### 6.5 Belgeler
`type` (Beyanname/Faaliyet Raporu seçimi), `title`, `year` (sayısal), `pdf_url` (dosya yükleme, zorunlu), `sort_order`. Liste iki sekmeye ayrılır (Beyannameler / Faaliyet Raporları) ya da `type` sütunuyla filtrelenir.

### 6.6 Gelen Mesajlar
Salt okunur liste (`full_name`, `email`, `subject`, `message`, `created_at`, en yeniden eskiye) + her satırda "Sil" (`DeleteButton`). Düzenleme yok, durum takibi yok (YAGNI, kullanıcı kararı).

## 7. Yardımcı Fonksiyon

`src/lib/slugify.ts` — `slugify(text: string): string`, Türkçe karakterleri (ğ,ü,ş,ı,ö,ç) ASCII karşılıklarına çevirir, boşlukları tire yapar, küçük harfe indirger. Vitest ile TDD (saf mantık, Bölüm A/B'deki `localize`/`canAccessSection` testleriyle tutarlı).

## 8. Test Stratejisi

Bölüm A/B ile tutarlı: `slugify` gibi saf mantık Vitest ile test edilir; Server Action'lar ve formlar `npm run build` + `npm run dev` ile manuel doğrulanır (gerçek dosya yükleme, gerçek Supabase yazma içerdiği için mock'lamak düşük değerli).

**Doğrulama verimliliği notu (kullanıcı talebi):** İmplementasyon sırasında her küçük adımdan sonra ayrı ayrı build/dev/curl doğrulaması yapılmaz — ilişkili birkaç görev tamamlandıktan sonra toplu doğrulama yapılır.

## 9. Kullanıcı Onayı

Bu spesifikasyondaki tüm kararlar (RBAC genişlemesi, ortak CRUD deseni, dosya yükleme mekanizması, bölüm bazlı alanlar, Gelen Mesajlar kapsamı) kullanıcı ile birlikte gözden geçirilmiş ve onaylanmıştır. Açık soru kalmamıştır.
