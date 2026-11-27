"use client";

import React from "react";
import { TEAM_MEMBERS } from "@/lib/config";
import StatusBadge from "@/components/StatusBadge";

export default function FooterSection() {
  return (
    <footer className="mt-16 pt-12 pb-16 border-t border-sand-line/70 text-xs text-ink-muted space-y-10">
      {/* ── Tableau de l'équipe (DOC-20261115-WA0029.pdf) ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="font-serif text-lg text-ink font-normal">
            L'équipe du projet Dakar Respire (6 membres)
          </h3>
          <span className="text-[11px] text-ink-subtle">
            Concours Mathématiques et Modélisation · Attribution officielle des tâches
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEAM_MEMBERS.map((m, i) => (
            <div
              key={i}
              className="p-3.5 bg-white rounded-[14px] border border-sand-line flex flex-col justify-between space-y-2 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink text-xs">{m.name}</span>
                  <StatusBadge
                    status={
                      m.status.includes("Reçu")
                        ? "Mesuré"
                        : m.status.includes("Opérationnel")
                        ? "Modèle"
                        : "Mesuré"
                    }
                    size="sm"
                  />
                </div>
                <p className="text-[11px] text-ink-muted mt-1 leading-snug">{m.role}</p>
              </div>

              <div className="pt-2 border-t border-sand-line/40 text-[10px] text-ink-subtle flex items-center justify-between">
                <span>Livrable :</span>
                <span className="font-mono text-ink-muted truncate max-w-[150px]">{m.fileTarget}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Licences et mentions de rigueur ── */}
      <div className="pt-6 border-t border-sand-line/60 flex flex-col sm:flex-row items-baseline justify-between gap-4 text-[11px] text-ink-subtle">
        <div className="space-y-1 max-w-xl">
          <p className="text-ink font-medium">
            Plateforme scientifique Dakar Respire · Déployée sous licence ouverte.
          </p>
          <p>
            Données au sol AirGradient Open Air sous licence CC BY 4.0 (OpenAQ & kaikai.dev). Données météo NASA POWER & satellites Copernicus CAMS / Sentinel-5P ouverts. Aucune donnée n'est revendue ni privatisée.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="font-serif text-xs text-ink block">Plateforme Dakar Respire</span>
          <span>Modélisation IA & Surveillance citoyenne de l'air</span>
        </div>
      </div>
    </footer>
  );
}
