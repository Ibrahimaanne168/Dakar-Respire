"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAlertLevel } from "@/lib/config";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [latestPm25, setLatestPm25] = useState<number>(28.5);

  useEffect(() => {
    // Vérifier d'abord si une prévision locale personnalisée existe
    const custom = localStorage.getItem("dakarrespire:v1:custom_prediction");
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        if (parsed.current_pm25) {
          setLatestPm25(parsed.current_pm25);
          return;
        }
      } catch (e) {}
    }

    fetch("/model/forecast.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.current_pm25) setLatestPm25(data.current_pm25);
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/previsions", label: "Prévisions" },
    { href: "/modeles", label: "Modèle" },
    { href: "/donnees", label: "Données" },
    { href: "/alertes", label: "Alertes" },
    { href: "/methode", label: "Méthode" },
  ];

  const currentLevel = getAlertLevel(latestPm25);

  return (
    <header className="hairline-b bg-sand-surface/95 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Titre sobre */}
        <Link
          href="/"
          className="font-serif text-lg tracking-tight text-ink hover:text-terracotta transition-colors"
        >
          Dakar Respire
        </Link>

        {/* 5 Liens en texte simple sans icône */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-ink-muted">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-ink ${
                  isActive ? "text-ink font-medium" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Indicateur discret à droite */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-ink-muted tabular-nums">
          <span>PM2.5</span>
          <span className="font-medium text-ink">{latestPm25.toFixed(1).replace(".", ",")} µg/m³</span>
          <span className="text-sand-line">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: currentLevel.color }}
            />
            <span className="text-ink">{currentLevel.label}</span>
          </span>
        </div>

        {/* Bouton mobile discret */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-xs text-ink-muted hover:text-ink p-1.5"
          aria-label="Menu"
        >
          {mobileMenuOpen ? "Fermer" : "Menu"}
        </button>
      </div>

      {/* Menu mobile dépliant sobre */}
      {mobileMenuOpen && (
        <div className="md:hidden hairline-t bg-sand-surface px-4 py-3 space-y-2 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-ink-muted hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 hairline-t text-xs text-ink-muted flex items-center gap-2">
            <span>PM2.5 : {latestPm25.toFixed(1).replace(".", ",")} µg/m³</span>
            <span>·</span>
            <span style={{ color: currentLevel.color }}>{currentLevel.label}</span>
          </div>
        </div>
      )}
    </header>
  );
};
