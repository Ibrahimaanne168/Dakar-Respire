"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wind, Activity, BarChart3, Database, ShieldAlert, BookOpen, Menu, X } from "lucide-react";
import { AlertBadge } from "./AlertBadge";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [latestPm25, setLatestPm25] = useState<number>(31.2);

  // Charger la dernière mesure si disponible
  useEffect(() => {
    fetch("/model/forecast.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.current_pm25) setLatestPm25(data.current_pm25);
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { href: "/", label: "Accueil", icon: Activity },
    { href: "/previsions", label: "Prévisions 24h", icon: Wind },
    { href: "/modeles", label: "Modèles IA", icon: BarChart3 },
    { href: "/donnees", label: "Données & Équipe", icon: Database },
    { href: "/alertes", label: "Alertes & Santé", icon: ShieldAlert },
    { href: "/methode", label: "Méthodologie", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Wind className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Dakar Respire
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  IA 24H
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Qualité de l'air • Presqu'île du Cap-Vert</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800/90 text-teal-400 border border-teal-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Status Pill & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-full py-1 px-3">
              <span className="text-xs text-slate-400">Actuel :</span>
              <span className="text-xs font-bold text-slate-200">{latestPm25} µg/m³</span>
              <AlertBadge pm25={latestPm25} size="sm" />
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/95 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition ${
                  isActive
                    ? "bg-teal-500/10 text-teal-300 border border-teal-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5 text-teal-400" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-sm">
            <span className="text-slate-400">Dernier relevé :</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">{latestPm25} µg/m³</span>
              <AlertBadge pm25={latestPm25} size="sm" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
