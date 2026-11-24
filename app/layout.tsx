import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dakar Respire — Prévision de la qualité de l'air à Dakar sur 24 h",
  description:
    "Bulletin horaire et prévision des particules fines (PM2.5) sur la presqu'île du Cap-Vert par apprentissage statistique, météo et données satellitaires.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-sand text-ink antialiased">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {children}
        </main>
        <footer className="hairline-t bg-sand-surface py-8 text-xs text-ink-muted">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-baseline justify-between gap-4">
            <div>
              <span className="font-serif text-sm text-ink font-medium">Dakar Respire</span>
              <p className="mt-1 text-ink-subtle">
                Prévision horaire des particules fines PM2.5 sur la presqu'île du Cap-Vert · Concours Mathématiques et Modélisation.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-ink-muted">
              <Link href="/" className="hover:text-ink transition-colors">
                Accueil
              </Link>
              <Link href="/previsions" className="hover:text-ink transition-colors">
                Prévision
              </Link>
              <Link href="/preuve" className="hover:text-ink transition-colors">
                Preuve
              </Link>
              <Link href="/comprendre" className="hover:text-ink transition-colors">
                Comprendre
              </Link>
              <Link href="/donnees" className="hover:text-ink transition-colors">
                Données
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
