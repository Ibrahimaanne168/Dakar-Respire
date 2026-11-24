import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Dakar Respire — Tableau de bord de la qualité de l'air à Dakar sur 24 h",
  description:
    "Tableau de bord scientifique continu : prévision horaire des particules fines PM2.5 sur la presqu'île du Cap-Vert par apprentissage automatique, météo et données satellitaires.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body className="min-h-screen bg-sand text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
