"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg bg-white rounded-t-[24px] shadow-2xl p-5 pb-8 max-h-[85dvh] overflow-y-auto animate-in slide-in-from-bottom duration-250 border-t border-sand-line"
      >
        {/* Poignée de tirage */}
        <div className="w-12 h-1.5 bg-sand-line rounded-full mx-auto mb-4" />

        {/* En-tête */}
        <div className="flex items-center justify-between pb-3 border-b border-sand-line/60 mb-4">
          <h3 className="font-serif text-lg font-normal text-ink">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="touch-target w-9 h-9 rounded-full bg-sand-surface hover:bg-sand-line flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenu */}
        <div className="text-sm text-ink-muted leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
