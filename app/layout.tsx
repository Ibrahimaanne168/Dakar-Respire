import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { WarningBanner } from "@/components/WarningBanner";
import Link from "next/link";
import { Shield, Sparkles, Code2, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Dakar Respire — Prévision des PM2.5 à Dakar sur 24 h par Intelligence Artificielle",
  description:
    "Plateforme d'anticipation de la qualité de l'air à Dakar sur un horizon de 24 heures basée sur l'apprentissage automatique, les réanalyses météorologiques et les observations satellitaires Copernicus CAMS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-teal-500 selection:text-slate-950">
        <Navbar />
        <WarningBanner />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-10 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-sm">
                    DR
                  </div>
                  <span className="font-extrabold text-slate-100 text-lg">Dakar Respire</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    Concours Mathématiques & Modélisation
                  </span>
                </div>
                <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                  Système prédictif open-source d'anticipation des pics de pollution aux particules fines (PM2.5) sur la presqu'île du Cap-Vert à 24 heures d'échéance.
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  Responsable Modèle IA & Interface Web : <strong>Ibrahima Anne</strong>
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Équipe & Contributions
                </h4>
                <ul className="text-xs space-y-1.5 text-slate-400">
                  <li>• <strong>Alioune Badara Sarr :</strong> PM2.5 & Poussières</li>
                  <li>• <strong>El Hadji I. Diop Sow :</strong> Données Météo NASA</li>
                  <li>• <strong>Lamine Cissé :</strong> Données Satellites CAMS</li>
                  <li>• <strong>Mously Sow :</strong> Séries Réelles CGQA</li>
                  <li>• <strong>Papa Ibrahima Samb :</strong> Consolidation & Nettoyage</li>
                  <li>• <strong>Sayon Sidibé :</strong> Revue Scientifique & Seuils</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Navigation Rapide
                </h4>
                <ul className="text-xs space-y-2">
                  <li>
                    <Link href="/previsions" className="hover:text-teal-400 transition">
                      Prévisions 24h & Visualiseur 3D
                    </Link>
                  </li>
                  <li>
                    <Link href="/modeles" className="hover:text-teal-400 transition">
                      Comparaison des Algorithmes
                    </Link>
                  </li>
                  <li>
                    <Link href="/donnees" className="hover:text-teal-400 transition">
                      Injecteur CSV Papa Samb
                    </Link>
                  </li>
                  <li>
                    <Link href="/alertes" className="hover:text-teal-400 transition">
                      Seuils CGQA & Recommandations
                    </Link>
                  </li>
                  <li>
                    <Link href="/methode" className="hover:text-teal-400 transition">
                      Cadre Scientifique & Limites
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
              <p>© 2026 Dakar Respire — Modélisation Mathématique & Apprentissage Automatique.</p>
              <p className="flex items-center gap-1">
                Conçu pour la santé publique de la Presqu'île du Cap-Vert
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
