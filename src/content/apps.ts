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
]
