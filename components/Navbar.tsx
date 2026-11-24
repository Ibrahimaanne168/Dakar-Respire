"use client";

import React, { useState, useEffect, useRef } from "react";
import { getAlertLevel } from "@/lib/config";
import StatusBadge from "./StatusBadge";

interface NavbarProps {
  currentPm25: number;
  isSynthetic: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPm25, isSynthetic }) => {
  const [activeSection, setActiveSection] = useState<string>("aujourdhui");
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const lastScrollY = useRef<number>(0);
  const navStripRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: "aujourdhui", label: "Aujourd'hui" },
    { id: "prevision", label: "Prévision" },
    { id: "sources", label: "Sources" },
    { id: "mesures", label: "Mesures" },
    { id: "donnees", label: "Données" },
    { id: "modele", label: "Modèle" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Masquer au défilement vers le bas (> 80px), réapparaître au défilement vers le haut
      if (currentScrollY > 80 && currentScrollY > lastScrollY.current + 8) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8 || currentScrollY <= 80) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;

      // Détection de section active (Scrollspy)
      const sections = navItems.map((item) => document.getElementById(item.id));
      const scrollPos = currentScrollY + 110;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          const currentId = navItems[i].id;
          setActiveSection(currentId);

          // Centrer automatiquement la puce active dans la barre défilable
          const activeBtn = document.getElementById(`nav-chip-${currentId}`);
          if (activeBtn && navStripRef.current) {
            const container = navStripRef.current;
            const scrollLeft =
              activeBtn.offsetLeft - container.offsetWidth / 2 + activeBtn.offsetWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: "smooth" });
          }
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentLevel = getAlertLevel(currentPm25);

  return (
    <div
      className={`sticky top-0 z-40 w-full transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* ── 1. En-tête compact de 52 px (Escamotable) ── */}
      <header className="h-[52px] bg-sand/95 backdrop-blur-md border-b border-sand-line/80 px-4 flex items-center justify-between">
        {/* Nom du site sobre */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-serif text-base font-normal tracking-tight text-ink flex items-center gap-2 touch-target"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
          <span>Dakar Respire</span>
        </button>

        {/* Indicateur condensé PM2.5 + niveau + statut */}
        <div className="flex items-center gap-2 text-xs tabular-nums">
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-base font-medium text-ink">
              {currentPm25.toFixed(1).replace(".", ",")}
            </span>
            <span className="text-[11px] text-ink-subtle">µg</span>
          </div>

          <span
            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
            style={{ backgroundColor: currentLevel.color }}
            title={currentLevel.label}
          />
          <span className="text-xs font-medium text-ink hidden xs:inline" style={{ color: currentLevel.color }}>
            {currentLevel.label}
          </span>

          <StatusBadge status={isSynthetic ? "Simulé" : "Mesuré"} size="sm" />
        </div>
      </header>

      {/* ── 2. Rangée de puces de navigation (défilable horizontalement au pouce) ── */}
      <nav
        ref={navStripRef}
        aria-label="Sections du site"
        className="bg-sand/90 backdrop-blur-sm border-b border-sand-line/60 px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 touch-action-pan-x"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              id={`nav-chip-${item.id}`}
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`touch-target h-9 px-3.5 rounded-pill text-xs whitespace-nowrap transition-all font-medium flex items-center shrink-0 ${
                isActive
                  ? "bg-ink text-white font-semibold shadow-xs"
                  : "bg-white/80 text-ink-muted border border-sand-line/70 hover:text-ink active:bg-sand-surface"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
export default Navbar;
