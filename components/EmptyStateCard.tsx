"use client";

import React from "react";
import StatusBadge from "./StatusBadge";

interface EmptyStateCardProps {
  title: string;
  expectedFile: string;
  responsible: string;
  description?: string;
  className?: string;
}

export default function EmptyStateCard({
  title,
  expectedFile,
  responsible,
  description,
  className = "",
}: EmptyStateCardProps) {
  return (
    <div
      className={`dash-card border-2 border-dashed border-sand-line/90 bg-white/70 flex flex-col justify-between p-6 ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-serif text-base text-ink font-normal">{title}</h4>
          <StatusBadge status="À venir" size="sm" />
        </div>
        {description && <p className="text-xs text-ink-muted leading-relaxed">{description}</p>}
      </div>

      <div className="mt-4 pt-3 border-t border-sand-line/50 text-xs text-ink-subtle flex items-center justify-between gap-2">
        <span>
          En attente : <strong className="font-mono text-ink text-[11px]">{expectedFile}</strong>
        </span>
        <span className="text-terracotta font-medium">{responsible}</span>
      </div>
    </div>
  );
}
