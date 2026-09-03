import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { getLocale } from "@/lib/i18n/locale";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
