export interface AppInfo {
  slug: string
  name_tr: string
  name_en: string
  short_description_tr: string
  short_description_en: string
  description_tr: string
  description_en: string
  features_tr: string
  features_en: string
  icon: string
  websiteUrl: string | null
  playStoreUrl: string | null
  appStoreUrl: string | null
}

export const APPS: AppInfo[] = [
  {
    slug: 'etoder-sanat',
    name_tr: 'ETODER SANAT',
    name_en: 'ETODER SANAT',
    short_description_tr:
      'Genç sanatçılar için dijital sanat platformu: portfolyonu oluştur, eserlerini koru, yarışmalara katıl.',
    short_description_en:
      "Turkey's digital art platform for young artists: build a portfolio, protect your work, and join competitions.",
    description_tr:
      "ETODER SANAT, genç sanatçıların profesyonel portfolyolar oluşturmasını, eserlerini koruma altına almasını ve yarışmalara katılmasını sağlayan Türkiye'nin dijital sanat platformudur.\n\nEğitim Teknoloji ve Oyun Derneği tarafından geliştirilen uygulama, 5070 sayılı Kanun ve KVKK'ya uyumlu şekilde çalışır.",
    description_en:
      "ETODER SANAT is Turkey's digital art platform, enabling young artists to build professional portfolios, protect their work, and participate in competitions.\n\nDeveloped by the Education, Technology and Gaming Association, the platform operates in compliance with Turkish Law No. 5070 and KVKK (personal data protection law).",
    features_tr:
      'Dijital Eser Koruma: Blockchain teknolojisi ve TÜBİTAK zaman damgası ile eserlerinizin özgünlüğü ve oluşturulma tarihi kalıcı olarak mühürlenir.\nAnı Atölyesi: Dijital eserlerinizi yıllık, takvim, bez çanta, matara, mousepad ve puzzle gibi fiziksel ürünlere dönüştürür.\n3D Sanal Galeriler: Sürükle-bırak ile kişisel sergi alanları oluşturun, misafir bağlantısıyla paylaşın, 360° gezinin.\nYarışmalar: Platform üzerinden ulusal sanat yarışmalarına katılın.\nÜcretsiz Blockchain Mühürleme: Sınırsız ve tamamen ücretsiz eser kaydı.',
    features_en:
      'Digital Artwork Protection: Blockchain technology and official TÜBİTAK timestamps permanently seal the authenticity and creation date of your work.\nMemory Workshop: Turns your digital creations into physical products such as yearbooks, calendars, tote bags, water bottles, mousepads and puzzles.\n3D Virtual Galleries: Create personal exhibition spaces with drag-and-drop, share via guest links, and navigate in 360°.\nCompetitions: Take part in national art competitions through the platform.\nFree Blockchain Sealing: Unlimited and completely free artwork registration.',
    icon: '/images/etodersanatlogo.webp',
    websiteUrl: 'https://art.egitimto.org',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=org.etoder.etoder_sanat&hl=tr',
    appStoreUrl: null,
  },
  {
    slug: 'buddyup',
    name_tr: 'BuddyUp',
    name_en: 'BuddyUp',
    short_description_tr:
      'Öğrencilerin okulda yaşadıkları zorbalık olaylarını güvenli ve anonim şekilde okul yönetimine bildirmesini sağlayan mobil uygulama.',
    short_description_en:
      'A mobile app that lets students safely and anonymously report bullying incidents at school to school administration.',
    description_tr:
      'BuddyUp, öğrencilerin okul ortamında yaşadıkları zorbalık olaylarını güvenli ve anonim bir şekilde okul yönetimine bildirmelerini sağlayan özel bir mobil uygulamadır.\n\nOrtaokul ve lise öğrencileri, okul yöneticileri ve öğretmenler için tasarlanan uygulama; Firebase güvenlik altyapısı ile KVKK ve GDPR uyumluluğu sayesinde kişisel verilerin korunmasını önceliklendirir. Uygulama kullanımı için okul yönetiminin onayı gereklidir; tüm öğrenci kayıtları okul yöneticileri tarafından onaylanır.',
    description_en:
      'BuddyUp is a dedicated mobile app that lets students safely and anonymously report bullying incidents at school to school administration.\n\nDesigned for middle and high school students, school administrators and teachers, the app prioritizes the protection of personal data through Firebase security infrastructure and compliance with Turkish KVKK and EU GDPR regulations. Using the app requires school administration approval; all student registrations are approved by school administrators.',
    features_tr:
      'Anonim Bildirim: Zorbalık olaylarını fotoğraf ve konum bilgisiyle birlikte tamamen anonim, hızlı ve güvenli şekilde okul yönetimine iletin.\nGüvenlik ve Gizlilik: Firebase altyapısı, güvenli kimlik doğrulama ve KVKK/GDPR uyumluluğuyla kişisel verileriniz korunur.\nYönetim Paneli: Okul yöneticileri raporları takip edebilir, öğrenci başvurularını onaylayabilir, istatistik ve analiz araçlarıyla toplu bildirim gönderebilir.\nÇoklu Dil Desteği: Türkçe ve İngilizce dil seçenekleriyle kullanılabilir.\nAndroid ve iOS Uyumluluğu: Push bildirim, güvenli veri şifreleme ve bulut tabanlı veri saklama ile her platformda çalışır.',
    features_en:
      'Anonymous Reporting: Report bullying incidents with photos and location details, completely anonymously, through a fast and secure process.\nSecurity and Privacy: Firebase infrastructure, secure authentication and KVKK/GDPR compliance keep your personal data protected.\nAdmin Panel: School administrators can track reports, approve student registrations, and send bulk notifications with statistics and analysis tools.\nMultilingual Support: Available in both Turkish and English.\nAndroid and iOS Compatibility: Works across platforms with push notifications, secure data encryption and cloud-based storage.',
    icon: '/images/buddyapplogo.png',
    websiteUrl: null,
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.company.buddyup',
    appStoreUrl: null,
  },
]
