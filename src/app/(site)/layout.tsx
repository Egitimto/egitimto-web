import { getLocale } from "@/lib/i18n/locale";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CONTACT_INFO } from "@/content/contact-info";

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Eğitim Teknoloji ve Oyun Derneği",
  alternateName: "ETODER",
  url: "https://www.egitimto.org",
  logo: "https://www.egitimto.org/images/kurumlogo.png",
  email: CONTACT_INFO.email,
  telephone: CONTACT_INFO.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Fahrettin Altay, 65/20. Sk. No:14A",
    addressLocality: "Karabağlar/İzmir",
    postalCode: "35140",
    addressCountry: "TR",
  },
  identifier: `Dernek Kütük No: ${CONTACT_INFO.registryNumber}`,
  sameAs: [CONTACT_INFO.socials.instagram],
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
      />
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </>
  );
}
