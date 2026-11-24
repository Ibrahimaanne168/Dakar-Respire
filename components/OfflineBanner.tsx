"use client";

import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [lastSavedHour, setLastSavedHour] = useState("14 h");

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      const now = new Date();
      setLastSavedHour(`${now.getHours()} h ${now.getMinutes().toString().padStart(2, "0")}`);
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-[#1B1F23] text-white text-xs py-1.5 px-4 flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="w-3.5 h-3.5 text-ochre" />
      <span>
        Mode hors ligne : dernière prévision sauvegardée ({lastSavedHour})
      </span>
    </div>
  );
}
