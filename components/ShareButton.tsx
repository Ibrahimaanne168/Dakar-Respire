"use client";

import React, { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { getAlertLevel } from "@/lib/config";

interface ShareButtonProps {
  currentPm25: number;
  selectedHour: number;
  peakPm25: number;
  peakHour: number;
  isSynthetic: boolean;
}

export default function ShareButton({
  currentPm25,
  selectedHour,
  peakPm25,
  peakHour,
  isSynthetic,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const level = getAlertLevel(currentPm25);
  const syntheticNotice = isSynthetic ? " (données simulées)" : "";
  const shareText = `Dakar, ${selectedHour} h : PM2.5 ${currentPm25.toFixed(1).replace(".", ",")} µg/m³ (${level.label}). Pic attendu à ${peakHour} h : ${peakPm25.toFixed(1).replace(".", ",")} µg/m³${syntheticNotice}. Bulletin complet : ${typeof window !== "undefined" ? window.location.href : "https://dakar-respire.vercel.app"}`;

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Dakar Respire — Qualité de l'Air",
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch (e) {
        // L'utilisateur a annulé ou le partage a échoué, on bascule sur WhatsApp
      }
    }

    // Fallback WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    const win = window.open(whatsappUrl, "_blank");
    if (!win) {
      // Fallback copie presse-papier si popup bloquée
      navigator.clipboard?.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Partager le bulletin qualité de l'air"
      className="fixed bottom-5 right-5 z-40 touch-target w-12 h-12 rounded-full bg-ink text-white hover:bg-terracotta shadow-card active:scale-95 transition-all flex items-center justify-center border-2 border-white focus:outline-none focus:ring-2 focus:ring-terracotta"
    >
      {copied ? <Check className="w-5 h-5 text-level-bon" /> : <Share2 className="w-5 h-5" />}
    </button>
  );
}
