"use client";

import React from "react";
import StatusBadge from "./StatusBadge";
import { DataStatus } from "@/lib/dashboardData";

interface DataMetadataProps {
  unit?: string;
  source: string;
  period?: string;
  status: DataStatus | string;
  className?: string;
}

export default function DataMetadata({
  unit,
  source,
  period,
  status,
  className = "",
}: DataMetadataProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2 border-t border-sand-line/60 text-[11px] text-ink-subtle ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {unit && (
          <span className="tabular-nums">
            Unité : <strong className="font-medium text-ink-muted">{unit}</strong>
          </span>
        )}
        {unit && source && <span className="text-sand-line">·</span>}
        <span className="truncate max-w-[220px]" title={source}>
          Source : <span className="text-ink-muted">{source}</span>
        </span>
        {period && (
          <>
            <span className="text-sand-line">·</span>
            <span className="text-ink-subtle">{period}</span>
          </>
        )}
      </div>

      <StatusBadge status={status} size="sm" />
    </div>
  );
}
