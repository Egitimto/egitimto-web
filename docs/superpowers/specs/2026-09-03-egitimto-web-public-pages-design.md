# egitimto.org Yeniden Yapılanması — Faz 1 / Bölüm B: Public Sayfalar — Tasarım Spesifikasyonu

**Tarih:** 2026-09-03
**Durum:** Onaylandı
**Ön koşul:** Faz 1 / Bölüm A (temel altyapı) tamamlandı — bkz. `docs/superpowers/plans/2026-09-02-egitimto-web-foundation.md`. Design tokenları, Supabase şeması/RLS, i18n (`localize`/`locale.ts`) ve RBAC yardımcı fonksiyonları, Auth girişi ve admin panel iskeleti zaten kurulu.

## 1. Amaç ve Kapsam

Ana spesifikasyonda (`2026-09-02-egitimto-web-rebuild-design.md`) tanımlanan bilgi mimarisine göre **public (herkese açık) sayfaların** tamamını inşa etmek. Admin panelde içerik yönetimi (CRUD) ekranları bu spesifikasyonun **dışında** — ayrı bir sonraki alt proje olarak ele alınacak (kullanıcı onayı: önce public sayfalar, sonra admin CRUD).

Bu aşamada CMS-beslemeli bölümler (Haberler, Etkinlikler, İşbirlikleri, Beyannameler, Faaliyet Raporları) veritabanından okuyacak şekilde kodlanır ama **seed verisi olmadan, boş state ile** başlar; gerçek içerik girişi admin CRUD alt projesi tamamlandığında yapılacak.

## 2. İçerik Kaynağı — Canlı Site Denetimi Bulguları

Canlı site (`egitimto.org`) WebFetch ile detaylıca tarandı. Ana spesifikasyondaki bazı varsayımlar gerçek içerikle örtüşmüyordu; bu spesifikasyon gerçek duruma göre günceller:

- **Alanlarımız:** Ana spec "mevcut 4 kartlı içerik" diyordu, ama canlı sitede **8 içerik kartı + 1 CTA bölümü** var. Bu spec 8 kartı esas alır (bkz. §5.6).
- **Tüzük:** Canlı sitede PDF **yok** — indirme butonu kırık (`href="#"`), sadece kısmi/eksik bir tüzük metni HTML olarak mevcut (Madde 1-7, bazıları eksik). Bu kısmi metin **taşınmayacak** (yanıltıcı olur); Tüzük PDF alanı gerçek dosya sağlanana kadar boş/devre dışı kalır.
- **Beyannameler / Faaliyet Raporları:** Canlı sitede bu bölüm **hiç yok**. Yeni, boş state ile başlar.
- **İşbirlikleri:** Canlı sitede bu sayfa/bölüm **hiç yok**. Yeni, boş state ile başlar.
- **Ekibimiz (Yönetim Kurulu):** Canlı sitede 5 kişi var, **fotoğrafsız**, sosyal medya/mail linkleri boş placeholder (`#`). Bu haliyle (fotosuz) seed edilecek — bkz. §5.2.
- **Haberler:** Canlı sitede 1 gerçek kayıt var ("İlk Bültenimiz Yayınlandı"), ama kullanıcı kararı: **seed edilmeyecek**, boş state ile başlanacak (tutarlılık için Etkinlikler ile aynı muamele).
- **Etkinlikler / Duyurular > Projeler:** Canlı sitedeki tüm kayıtlar demo/test içerik ("deneme etkinlik", "Etkinliğimiz", "deneme", "Projemiz") — taşınmayacak. Projeler zaten ana spec gereği Faz 1'de statik "Yakında".
- **Uygulamalarımız (canlı sitede "Mobile App"/BuddyUp):** Ana spec gereği Faz 1'de statik "Yakında" sayfası — canlı sitedeki tutarsız BuddyUp içeriği (açıklama ile özellik listesi uyuşmuyor) bu nedenle taşınmayacak.
- **Dil mekanizması:** Canlı site `?lang=en` query-param kullanıyor (path-prefix değil). Yeni sitede Bölüm A'da zaten kurulmuş **cookie tabanlı locale mekanizması** kullanılacak — bu, canlı sitenin URL şemasından farklı ama zaten onaylı bir karar (Bölüm A kapsamında karara bağlandı, burada değiştirilmiyor).
- **Çeviri hataları:** Canlı sitenin İngilizce içeriğinde 2 hata tespit edildi ve taşırken düzeltilecek:
  - KVKK onay metni "GDPR and Privacy Policy" → doğrusu "KVKK (Turkish Data Protection Law) and Privacy Policy" gibi bir ifade
  - Orhan AYVALLI'nın unvanı TR'de "Kurucu Üye", EN'de yanlışlıkla "Board Member" → doğrusu "Founding Member"

## 3. Route Yapısı

Düz URL şeması (canlı sitedeki mevcut path'lerle mümkün olduğunca uyumlu, iç içe önek yok):

```
/                            Ana Sayfa
/hakkimizda                  Tüzük + Amaç/İlkeler + Beyannameler + Faaliyet Raporları
/ekibimiz                    Yönetim Kurulu
/isbirlikleri                İşbirlikleri (boş state)
/haberler                    Haberler listesi (boş state)
/haberler/[slug]             Haber detayı
/etkinlikler                 Etkinlikler listesi (boş state)
/etkinlikler/[slug]          Etkinlik detayı
/projeler                    Statik "Yakında"
/uygulamalarimiz             Statik "Yakında"
/alanlarimiz                 Statik, 8 kart
/destek-ol                   Statik
/iletisim                    Statik + form (Server Action, Supabase'e yazar)
/yasal/tuzuk                 Statik metin
/yasal/kvkk                  Statik metin
/yasal/etik-ilkeler          Statik metin
/yasal/sss                   Statik metin
```

Header'da iki dropdown: **EğitimTO** (Hakkımızda, Ekibimiz, İşbirlikleri) ve **Duyurular** (Haberler, Etkinlikler, Projeler). Diğer üst seviye linkler düz: Uygulamalarımız, Alanlarımız, Destek Ol, İletişim.

## 4. Veri Modeli Değişiklikleri

Ana spec'teki şemaya (Bölüm A'da zaten oluşturuldu) ek migration gerekiyor:

**`about_content` tablosuna 4 yeni alan çifti eklenir** (canlı sitedeki 4 ayrı Hakkımızda bloğunu ayrı ayrı düzenlenebilir tutmak için — ana spec'in tek-alan varsayımından bilinçli sapma, kullanıcı onaylı):
- `kurulus_tr` / `kurulus_en` (Derneğin Kuruluşu)
- `amac_ilkeler_tr` / `amac_ilkeler_en` (zaten var — Amaç ve Misyon içeriği burada kalır)
- `vizyon_tr` / `vizyon_en`
- `degerler_tr` / `degerler_en`

**Yeni tablo: `contact_messages`** (İletişim formu için, ana spec'te yoktu, bu aşamada eklenen küçük bir kapsam genişlemesi):
| Alan | Tip |
|---|---|
| `id` | uuid, PK |
| `full_name` | text |
| `email` | text |
| `subject` | text (Genel Bilgi / Projeler / Eğitim Programları / Gönüllülük / İşbirliği / Diğer) |
| `message` | text |
| `created_at` | timestamptz |

RLS: `anon` rolü yalnızca `insert` yapabilir (kendi gönderdiği satırı bile okuyamaz); `select` yalnızca `admin`/`moderator` rolüne açık. Bu tablo, admin CRUD alt projesindeki "Gelen Mesajlar" ekranının veri kaynağı olacak (o ekranın kendisi bu spec'in kapsamında değil).

## 5. Sayfa Bazlı İçerik ve Veri Kaynağı

### 5.1 Ana Sayfa (`/`)
Tamamen hardcode (statik), canlı siteden birebir taşınır, ufak spec-onaylı değişikliklerle:
- Hero: başlık, açıklama, 2 CTA buton, istatistik kartları (500+ Öğrenci, 25+ Projeler, 15+ Şehir) — canlı siteden birebir
- "Neler Yapıyoruz?" — **3 kart** (Aylık Bülten kartı kaldırıldı, ana spec §5 kararı): Uygulamalarımız, Destek Ol, İletişim
- "Son Haberler" bölümü — boş state (Haberler seed edilmediği için "henüz haber yok, yakında burada" tarzı nazik bir mesaj)
- "Biz Kimiz?" — canlı siteden birebir
- Alanlarımız özeti + "Tüm Alanlar" linki
- "Siz de Bize Katılın!" CTA

### 5.2 Ekibimiz (`/ekibimiz`)
`team_categories` + `team_members` tablolarından okunur. Seed migration ile **5 gerçek kişi** eklenir (fotosuz, sosyal medya/mail alanları boş):
1. Erhan KOÇ — Yönetim Kurulu Başkanı
2. Alican DİŞLİTAŞ — Yönetim Kurulu Başkan Yardımcısı
3. Göksel KÖSE — Genel Sekreter
4. Nuri KARAGÖZOĞLU — Sayman
5. Orhan AYVALLI — Kurucu Üye (EN: **Founding Member** — çeviri düzeltmesi, bkz. §2)

Tek kategori: "Yönetim Kurulu" / "Board of Directors". Fotoğraf alanı boşken tutarlı bir placeholder avatar gösterir.

### 5.3 Hakkımızda (`/hakkimizda`)
`about_content` tablosundan okunur (bkz. §4 genişletilmiş şema): Kuruluş, Amaç ve Misyon, Vizyon, Değerlerimiz metinleri canlı siteden birebir + İngilizce karşılıkları `?lang=en` sürümünden alınır. Ardından:
- **Tüzük:** `tuzuk_pdf_url` boş → indirme butonu devre dışı/gizli (bkz. `PdfDownloadButton` bileşeni, §6)
- **Beyannameler / Faaliyet Raporları:** `documents` tablosundan okunur, boş state ile başlar

### 5.4 İşbirlikleri (`/isbirlikleri`)
`partnerships` tablosundan okunur, boş state ile başlar.

### 5.5 Duyurular: Haberler / Etkinlikler / Projeler
- `/haberler`, `/haberler/[slug]`: `news` tablosundan okunur, boş state ile başlar
- `/etkinlikler`, `/etkinlikler/[slug]`: `events` tablosundan okunur, boş state ile başlar
- `/projeler`: Tamamen statik "Yakında" sayfası, veritabanı yok (ana spec §6 kararı)

### 5.6 Alanlarımız (`/alanlarimiz`)
Tamamen hardcode, canlı siteden birebir **8 kart**:
1. Eğitim & Teknoloji
2. Oyun & Oyun Temelli Öğrenme
3. Dijitalleşme & Dijital Okuryazarlık
4. Medya Okuryazarlığı
5. Çevre & Sürdürülebilirlik
6. Gençlik & Gönüllülük
7. İnsan Hakları & Eşitlik
8. Sosyal İnovasyon & Girişimcilik

+ kapanış CTA bölümü ("İlgi Alanınıza Göre Bize Katılın!"). Her kartın tam açıklama metni implementasyon sırasında canlı siteden (TR + `?lang=en` EN) tekrar doğrulanarak alınır.

### 5.7 Uygulamalarımız (`/uygulamalarimiz`)
Tamamen statik "Yakında" sayfası (ana spec §6/§8 kararı — canlı sitedeki BuddyUp içeriği taşınmaz).

### 5.8 Destek Ol (`/destek-ol`)
Hardcode, canlı siteden birebir: Gönüllülük + Kurumsal İşbirliği (e-posta: `isbirligi@egitimto.org`) — IBAN/online ödeme yok (Faz 2 kapsamı).

### 5.9 İletişim (`/iletisim`)
Hardcode metin/bilgiler (adres, e-posta, çalışma saatleri, sosyal medya) canlı siteden birebir + form:
- Alanlar: Ad Soyad, E-posta, Konu (dropdown), Mesaj, KVKK onay checkbox
- Server Action ile `contact_messages` tablosuna `insert` (bkz. §4)
- Başarılı gönderimde kullanıcıya teşekkür mesajı gösterilir (sayfa içi, redirect yok)

### 5.10 Yasal Sayfalar (`/yasal/tuzuk`, `/yasal/kvkk`, `/yasal/etik-ilkeler`, `/yasal/sss`)
Canlı sitede tek sayfada birleşik olan içerik, Next.js'te **4 ayrı statik route**'a ayrılır:
- `/yasal/tuzuk`: Sadece "Tüzük PDF'i henüz eklenmedi" durumu (kısmi metin taşınmayacak, bkz. §2) — Hakkımızda'daki Tüzük bölümüyle tutarlı
- `/yasal/kvkk`, `/yasal/etik-ilkeler`, `/yasal/sss`: Canlı sitedeki tam metin birebir taşınır (TR + EN, KVKK'daki "GDPR" çeviri hatası düzeltilerek)

### 5.11 Footer (site geneli)
Ana spec §5'teki yapı: Resmi Kimlik metni, Yasal linkler (yukarıdaki 4 route), İletişim bilgileri (adres, e-posta, kütük no).

## 6. Ortak Bileşenler

- `Header` — EğitimTO ve Duyurular dropdown'ları, dil değiştirici (mevcut cookie-tabanlı locale mekanizmasını kullanır, bkz. Bölüm A `src/lib/i18n/`)
- `Footer` — site geneli
- `Card`, `SectionHeading` — genel sunum bileşenleri
- `EmptyState` — Haberler/Etkinlikler/İşbirlikleri/Beyannameler/Faaliyet Raporları boşken kullanılan tutarlı "henüz içerik eklenmedi" bileşeni
- `PdfDownloadButton` — URL `null`/boş ise devre dışı/gizli render eden ortak bileşen (Tüzük, Beyannameler, Faaliyet Raporları hepsi bunu kullanır)

## 7. Asset Taşıma

Tek seferlik bir script (`scripts/migrate-assets.ts`, implementasyon sonunda silinir) canlı siteden genel/statik görselleri (hero-image.jpg, about-1/2/3.jpg, logo1.png vb. — Ana Sayfa ve Hakkımızda'da kullanılan sabit görseller) indirip ilgili Supabase Storage bucket'larına yükler. Ekip fotoğrafı, işbirliği logosu, belge PDF'i bu aşamada **yüklenmez** çünkü ilgili bölümler boş state ile başlıyor (§2, §5.2-5.4).

## 8. i18n

Bölüm A'da kurulmuş `localize()` / `locale.ts` yardımcı fonksiyonları kullanılır (cookie tabanlı, URL segment routing yok). Hardcode statik sayfalarda TR/EN metin çiftleri komponent içinde `{tr, en}` objesi olarak tutulur; DB-backed içerikte `_tr`/`_en` kolonları okunur. Alanlarımız, Destek Ol, Yasal sayfalar gibi EN içerik gerektiren statik sayfalar için canlı sitenin `?lang=en` sürümü implementasyon sırasında referans alınır (gerekirse tekrar taze çekilir).

## 9. Test Stratejisi

Bölüm A ile tutarlı: bu bölümde çoğunlukla sunum bileşenleri var, saf iş mantığı yok. `npm run build` ile tüm route'ların derlendiği doğrulanır; `npm run dev` ile manuel gezinme testi yapılır (dropdown menüler, dil değiştirme, boş state'ler, iletişim formu submit + `contact_messages` tablosuna yazıldığının Supabase Dashboard'dan doğrulanması).

## 10. Kapsam Dışı (bir sonraki alt proje)

- Admin panelde içerik yönetimi (CRUD) ekranları: Haberler, Etkinlikler, Ekip, İşbirlikleri, Belgeler (Beyannameler/Faaliyet Raporları), Hakkımızda sabit içerik düzenleme, Gelen Mesajlar
- Gerçek Tüzük PDF'inin, işbirliği/haber/etkinlik içeriğinin girilmesi (admin CRUD geldiğinde manuel yapılacak)
- `egitimto.org` domain'inin Vercel'e taşınması (DNS) — bu alt proje sadece Vercel'in kendi domain'inde çalışır durumda olmayı hedefler
- Faz 2: iyzico bağış/ödeme entegrasyonu

## 11. Kullanıcı Onayı

Bu spesifikasyondaki tüm kararlar (route yapısı, canlı site denetimi bulguları ve bunlara verilen kararlar, veri modeli genişletmeleri, sayfa bazlı içerik kaynağı, çeviri düzeltmeleri, iletişim formu yaklaşımı) kullanıcı ile birlikte gözden geçirilmiş ve onaylanmıştır. Açık soru kalmamıştır.
