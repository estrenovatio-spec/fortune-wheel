import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Колесо фортуны | SG Capital",
  description:
    "Крутите колесо и получите подарок от финансового советника Алексея Шаргатова. SG Capital.",
  openGraph: {
    title: "Колесо фортуны | SG Capital",
    description: "Подарки от финансового советника — одно вращение в месяц.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.variable}>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
