# egitimto.org Yeniden Yapılanması — Tasarım Spesifikasyonu

**Tarih:** 2026-09-02
**Durum:** İnceleme bekliyor

## 1. Amaç

`www.egitimto.org` şu anda PHP ile kodlanmış durumda ve kişisel hesaplar üzerinden yönetiliyor. Bu proje siteyi:

1. Next.js + Tailwind ile yeniden kurar (mevcut tasarım ve içerik korunarak),
2. içerik yönetimini kod bilmeyen dernek personelinin yapabileceği bir admin panele taşır,
3. Google for Nonprofits'in reddettiği "domain ↔ tüzel kişilik" bağlantısını güçlendirecek içerikleri ekler,
4. tüm altyapıyı (GitHub/Vercel/Supabase) kişisel hesaplardan kurumsal hesaplara taşır.

## 2. Kapsam

**Faz 1 (bu spesifikasyon):** Site geçişi, admin panel, uyumluluk içerikleri.
**Faz 2 (ayrı bir sonraki proje, bu spec'in dışında):** iyzico bağış/ödeme entegrasyonu. "Destek Ol" sayfası Faz 1'de mevcut haliyle statik kalır.

## 3. Tamamlanan Altyapı (bu spec'in ön koşulu, zaten kuruldu)

- GitHub Organization: `Egitimto` (business/institution tipi), repo: `egitimto-web` (public — Vercel Hobby plan private+organization repo deploy edemediği için public yapıldı)
- Vercel Team: `Egitimto` (Hobby plan — **canlıya/gerçek bağışa geçmeden önce Pro'ya yükseltilecek**, hem Vercel ToS'un ticari kullanım şartı hem de çoklu üye eklenebilmesi için)
- Supabase Organization: `Egitimto` (Free plan — canlıya geçmeden önce Pro'ya yükseltilecek: otomatik duraklama ve yedekleme sorunları için), proje: `egitimto-web`, region: Frankfurt (Central EU)
- Next.js 16 (App Router, TypeScript, Tailwind, ESLint) iskeleti kuruldu ve Vercel'e başarıyla deploy edildi
- Kurumsal kimlik: `dev@egitimto.org` (Google Workspace, dernekler için ücretsiz plana geçiş başvurusu onay bekliyor) her üç platformda da kök hesap; kişisel hesaplar ek üye/Owner olarak eklendi (Vercel'de üye ekleme Pro gerektirdiği için bu adım Pro'ya geçişe ertelendi)

## 4. Tasarım Sistemi

Mevcut canlı siteden (`egitimto.org`) gerçek CSS değerleri okunarak çıkarıldı, birebir korunacak:

**Renkler**
- Primary: `#FF6B35` (gradient: `#FF8C42 → #FF6B35 → #E85A2A`, 135°)
- Secondary: `#2C3E50`
- Bölüm arka planı (hero vb.): krem gradyan `#F5F5F0 → #E8E8E3`
- Footer / koyu alanlar: `#212529`
- Gövde metni: `#343A40`

**Tipografi** (mevcut siteden bilinçli bir sapma, kullanıcı onaylı)
- Başlıklar: **Space Grotesk** (700/800 ağırlık)
- Gövde/arayüz metni: **Inter** (400/600 ağırlık) — admin panel dahil her yerde
- Orijinal sitede tek font (Poppins) kullanılıyordu; bu değişiklik kullanıcı tarafından onaylandı

**Layout imzası**
- Pill butonlar (30px border-radius), gradyanlı primary CTA
- Kart tabanlı bölümler, turuncu ikon-in-daire deseni

**Tüzel kişilik adı (her yerde birebir bu şekilde kullanılacak):**
> Eğitim Teknoloji ve Oyun Derneği (virgülsüz — Google'ın ret mesajındaki resmi biçim)

## 5. Bilgi Mimarisi / Menü Yapısı

```
Ana Sayfa
├── EğitimTO (dropdown)
│   ├── Hakkımızda
│   │   ├── Tüzük (PDF indirme butonu)
│   │   ├── Amacımız ve İlkelerimiz (metin)
│   │   ├── Beyannameler (yıla göre, tıklanabilir PDF listesi)
│   │   └── Faaliyet Raporları (yıla göre, tıklanabilir PDF listesi)
│   ├── Ekibimiz
│   │   └── Bölüm bazlı (örn. Yönetim Kurulu, Hibe Programları — admin yeni bölüm oluşturabilir)
│   │       └── Her bölümde: kişiler (foto, ad-soyad, görev, sosyal medya/mail ikonları)
│   └── İşbirlikleri (isim, proje açıklaması, logo — admin panelinden)
├── Duyurular (dropdown)
│   ├── Haberler (kart → detay sayfası, opsiyonel "Başvuru için tıklayın" butonu)
│   ├── Eğitim ve Etkinlikler (aynı kart → detay yapısı, aynı opsiyonel başvuru butonu)
│   └── Projeler (Faz 1'de statik "Yakında" sayfası, CMS yok)
├── Uygulamalarımız (statik "Yakında" sayfası; ilk gerçek uygulama eklenince CMS'e dönüştürülecek — bkz. §8)
├── Alanlarımız (statik sayfa, mevcut 4 kartlı içerik birebir korunur, CMS yok)
├── Destek Ol (statik, Faz 1'de değişmez)
└── İletişim (statik, Faz 1'de değişmez)

Footer (site geneli, her sayfada):
- Resmi Kimlik metni: "www.egitimto.org, Eğitim Teknoloji ve Oyun Derneği'nin resmi internet sitesidir. Dernek Kütük No: 35-088-084"
- Yasal: Dernek Tüzüğü, KVKK ve Gizlilik Politikası, Etik İlkeler, SSS
- İletişim bilgileri (adres, e-posta, kütük no)
```

**Ana sayfa "Neler Yapıyoruz?" kartları güncellemesi:** Mevcut 4 kart (Mobile App, Aylık Bülten, Destek Ol, İletişim) → Aylık Bülten kartı kaldırıldı (bülten artık normal bir haber olarak yayınlanacak). Yerine **Duyurular** kartı eklenmesi öneriliyor (Mobile App → Uygulamalarımız, Destek Ol, İletişim, Duyurular). *Bu bir varsayımdır, kullanıcı onayı gerekir.*

**Not — "Etik İlkeler" ile "Amacımız ve İlkelerimiz" farkı:** Etik İlkeler mevcut `/yasal/etik-ilkeler` sayfası olarak ayrı kalır (davranış kuralları); Amacımız ve İlkelerimiz yeni bir misyon/vizyon metni olarak Hakkımızda içinde yer alır. İkisi farklı içeriklerdir, karıştırılmayacak.

## 6. Veri Modeli (Supabase / Postgres)

Tüm çok-dilli alanlar `_tr` / `_en` sütun çiftleri olarak tutulur (ayrı çeviri tablosu yok — bu ölçekte gereksiz karmaşıklık).

| Tablo | Amaç | Anahtar alanlar |
|---|---|---|
| `documents` | Beyannameler + Faaliyet Raporları (ortak yapı) | `type` (`beyanname` \| `faaliyet_raporu`), `title`, `year`, `pdf_url`, `sort_order` |
| `about_content` | Hakkımızda sabit içerikleri (tekil satır) | `tuzuk_pdf_url`, `amac_ilkeler_tr`, `amac_ilkeler_en` |
| `team_categories` | Ekibimiz bölümleri (admin genişletebilir) | `name_tr`, `name_en`, `sort_order` |
| `team_members` | Ekip üyeleri | `category_id` (FK), `full_name`, `role_tr`, `role_en`, `photo_url`, `email`, `social_links` (jsonb), `sort_order` |
| `partnerships` | İşbirlikleri | `name`, `project_description_tr`, `project_description_en`, `logo_url`, `sort_order` |
| `news` | Haberler | `title_tr/en`, `content_tr/en`, `cover_image`, `published_at`, `show_apply_button`, `apply_button_url`, `is_published` |
| `events` | Eğitim ve Etkinlikler | `news` ile aynı + `event_date`, `location` |
| `user_roles` | Admin panel yetkilendirme | `user_id` (FK → `auth.users`), `role` (`admin` \| `moderator`) |

`projects` ve gerçek `apps` tabloları Faz 1'de **oluşturulmaz** — bu sayfalar statik "Yakında" içeriği gösterir; ilk gerçek ihtiyaç doğduğunda (ilk proje/uygulama eklenecekken) küçük bir ek migration ile kurulur.

## 7. Kimlik Doğrulama ve Yetkilendirme

- Admin panel girişi: Supabase Auth (email/şifre), **davetle** eklenir — herkese açık kayıt yok
- İki rol:
  - **Admin**: tüm içerik türlerine tam erişim
  - **Moderatör**: yalnızca Haberler ve Eğitim ve Etkinlikler bölümlerine erişir (Ekibimiz, İşbirlikleri, Hakkımızda içeriklerine erişemez)
- Yetkilendirme hem admin panel arayüzünde (rota bazlı gizleme) hem de Supabase RLS politikalarında (veritabanı seviyesinde) uygulanır — sadece arayüzde gizlemek yeterli değildir
- Public (anonim) okuma: yalnızca `is_published = true` olan kayıtlar `anon` anahtarıyla görülebilir; yazma işlemleri yalnızca kimliği doğrulanmış ve rolü uygun kullanıcılara açıktır

## 8. Uyumluluk Gereksinimleri

**Google for Nonprofits domain doğrulaması için:**
- Tüzel kişilik adı her yerde tutarlı: "Eğitim Teknoloji ve Oyun Derneği"
- Footer'da site genelinde crawlable, düz metin "Resmi Kimlik" beyanı (bkz. §5)
- Next.js App Router sayesinde bu metin sunucu tarafında render edilir — JavaScript çalıştırmayan doğrulama botları da görebilir
- Bu değişikliklerden sonra Google for Nonprofits başvurusu yeniden gönderilmeli (bu spec'in kapsamı dışında, ayrı bir operasyonel adım)

**Google Play hesap/veri silme politikası (ileride, ilk uygulama eklendiğinde):**
- Uygulamalarımız sayfası, ileride her uygulama için "ne veri toplanır + hesap/veri silme nasıl talep edilir" bilgisini tek, merkezi ve genişleyebilir bir yapıda tutacak şekilde tasarlanacak (şimdilik statik yer tutucu, §6'daki not)
- Bu URL'ler Play Console'a bildirileceği için hepsi `egitimto.org` domain'ine işaret edecek, bu da domain-kurum bağlantısını güçlendirir

## 9. Depolama (Supabase Storage)

- `team-photos` (public bucket): ekip üyesi fotoğrafları
- `partnership-logos` (public bucket): işbirliği logoları
- `news-events-covers` (public bucket): haber/etkinlik kapak görselleri
- `documents` (public bucket): tüzük, beyannameler, faaliyet raporları PDF'leri

## 10. Açık Varsayımlar (kullanıcı onayı gerekir)

1. Ana sayfa "Neler Yapıyoruz?" kartlarında Aylık Bülten'in yerine "Duyurular" kartı eklenmesi (bkz. §5)
2. `documents` tablosunun Beyannameler ve Faaliyet Raporları için ortak/tek tablo olarak tasarlanması (aynı admin arayüzü, `type` alanıyla filtrelenir)
