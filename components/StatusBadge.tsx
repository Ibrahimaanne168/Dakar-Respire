"use client";

import React from "react";
import { DataStatus } from "@/lib/dashboardData";

interface StatusBadgeProps {
  status: DataStatus | string;
  size?: "sm" | "md";
  className?: string;
}

export default function StatusBadge({ status, size = "sm", className = "" }: StatusBadgeProps) {
  let bg = "bg-sand-surface";
  let text = "text-ink-muted";
  let border = "border-sand-line";
  let dot = "#8E8B82";

  switch (status) {
    case "Mesuré":
      bg = "bg-[#EAF3ED]";
      text = "text-[#24613B]";
      border = "border-[#3F7D58]/30";
      dot = "#3F7D58";
      break;
    case "Modèle":
      bg = "bg-[#EBF3F3]";
      text = "text-[#173F42]";
      border = "border-[#1F5C5E]/30";
      dot = "#1F5C5E";
      break;
    case "Simulé":
      bg = "bg-[#FCF5E8]";
      text = "text-[#8C5E09]";
      border = "border-[#C99A1E]/30";
      dot = "#C99A1E";
      break;
    case "À venir":
      bg = "bg-[#F3F2EE]";
      text = "text-[#66645E]";
      border = "border-[#D6D2C4]";
      dot = "#8E8B82";
      break;
    case "Inutilisable":
      bg = "bg-[#FDF0EC]";
      text = "text-[#A8372C]";
      border = "border-[#A8372C]/30";
      dot = "#A8372C";
      break;
    default:
      break;
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium tabular-nums ${padding} ${bg} ${text} ${border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />
      <span>{status}</span>
    </span>
  );
}
