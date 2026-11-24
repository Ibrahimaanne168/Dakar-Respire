"use client";

import React, { useState, useEffect } from "react";
import { getAlertLevel } from "@/lib/config";
import StatusBadge from "./StatusBadge";
import { Upload, Menu, X, ArrowUp } from "lucide-react";

interface NavbarProps {
  currentPm25: number;
  isSynthetic: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPm25, isSynthetic }) => {
  const [activeSection, setActiveSection] = useState<string>("aujourdhui");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  const navItems = [
    { id: "aujourdhui", label: "Aujourd'hui" },
    { id: "prevision", label: "Prévision" },
    { id: "sources", label: "Sources de pollution" },
    { id: "mesures", label: "Mesures" },
    { id: "donnees", label: "Données" },
    { id: "modele", label: "Modèle" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = navItems.map((item) => document.getElementById(item.id));
      const scrollPos = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentLevel = getAlertLevel(currentPm25);

  return (
    <header className="sticky top-3 z-50 px-4 sm:px-6 w-full max-w-7xl mx-auto transition-all">
      <div
        className={`bg-white/90 backdrop-blur-md border border-sand-line/80 rounded-pill px-4 sm:px-6 h-14 flex items-center justify-between transition-shadow duration-300 ${
          scrolled ? "shadow-card" : "shadow-sm"
        }`}
      >
        {/* Logo sobre avec point terre cuite */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-serif text-lg tracking-tight text-ink flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
          <span>Dakar Respire</span>
        </button>

        {/* 6 Liens d'ancres avec indicateur d'ancre active (Capture 3 style) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs text-ink-muted">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-3 py-1.5 rounded-pill transition-all font-medium ${
                  isActive
                    ? "bg-sand-surface text-ink font-semibold border border-sand-line shadow-xs"
                    : "hover:text-ink hover:bg-sand-surface/60"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Section droite : PM2.5 direct + Statut + Bouton d'import CSV */}
        <div className="flex items-center gap-3">
          {/* Indicateur PM2.5 actuel */}
          <div className="hidden sm:flex items-center gap-2 text-xs tabular-nums border-r border-sand-line/60 pr-3">
            <span className="text-ink-subtle">PM2.5</span>
            <span className="font-serif text-sm font-medium text-ink">
              {currentPm25.toFixed(1).replace(".", ",")} µg
            </span>
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: currentLevel.color }}
              title={currentLevel.label}
            />
            <StatusBadge status={isSynthetic ? "Simulé" : "Mesuré"} size="sm" />
          </div>

          {/* Bouton noir pilule « Importer un CSV » */}
          <button
            onClick={() => scrollToSection("donnees")}
            className="bg-ink hover:bg-terracotta text-white px-3.5 py-1.5 rounded-pill text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importer un CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>

          {/* Bouton burger mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-ink-muted hover:text-ink"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu déroulant mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-white/95 backdrop-blur-md rounded-[18px] border border-sand-line p-4 shadow-card space-y-1.5 text-sm animate-in fade-in duration-150">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-full text-left px-3 py-2 rounded-[10px] text-xs transition-colors flex items-center justify-between ${
                activeSection === item.id
                  ? "bg-sand-surface font-semibold text-ink"
                  : "text-ink-muted hover:bg-sand-surface/60"
              }`}
            >
              <span>{item.label}</span>
              {activeSection === item.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
              )}
            </button>
          ))}

          <div className="pt-2 border-t border-sand-line/60 flex items-center justify-between text-xs text-ink-muted px-2">
            <span>PM2.5 direct : {currentPm25.toFixed(1)} µg/m³</span>
            <StatusBadge status={isSynthetic ? "Simulé" : "Mesuré"} size="sm" />
          </div>
        </div>
      )}
    </header>
  );
};
