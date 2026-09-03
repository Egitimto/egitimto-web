import { getLocale } from "@/lib/i18n/locale";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <>
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </>
  );
}
