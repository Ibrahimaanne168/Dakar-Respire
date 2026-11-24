"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Retour en haut"
      className="fixed bottom-20 right-5 z-40 touch-target w-10 h-10 rounded-full bg-sand-surface border border-sand-line text-ink-muted hover:text-ink shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center focus:outline-none"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
