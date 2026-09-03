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
