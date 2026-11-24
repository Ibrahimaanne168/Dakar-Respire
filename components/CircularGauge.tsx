"use client";

import React from "react";

interface CircularGaugeProps {
  value: number;
  min?: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
  thresholds?: { value: number; color: string }[];
  size?: number;
  subtext?: string;
  className?: string;
}

export default function CircularGauge({
  value,
  min = 0,
  max,
  label,
  unit,
  color = "#B5532A",
  thresholds,
  size = 140,
  subtext,
  className = "",
}: CircularGaugeProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Arc de jauge : 240 degrés (ouvert en bas)
  const arcDegrees = 240;
  const arcLength = (circumference * arcDegrees) / 360;
  const strokeDashoffsetTotal = circumference - arcLength;

  const clampedVal = Math.min(Math.max(value, min), max);
  const ratio = (clampedVal - min) / (max - min);
  const fillLength = arcLength * ratio;
  const strokeDashoffset = circumference - fillLength;

  // Couleur dynamique si seuils définis
  let activeColor = color;
  if (thresholds && thresholds.length > 0) {
    const sorted = [...thresholds].sort((a, b) => b.value - a.value);
    const match = sorted.find((t) => value >= t.value);
    if (match) activeColor = match.color;
    else activeColor = thresholds[0].color;
  }

  // Rotation pour centrer l'ouverture vers le bas
  const rotateDeg = 150;

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform"
          style={{ transform: `rotate(${rotateDeg}deg)` }}
        >
          {/* Rail d'arrière-plan */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EFE8DA"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Arc de valeur */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${fillLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Valeur centrale */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
          <span className="font-serif text-2xl font-normal text-ink tabular-nums leading-none">
            {value.toFixed(1).replace(".", ",")}
          </span>
          <span className="text-[11px] text-ink-subtle mt-0.5 tabular-nums">{unit}</span>
        </div>
      </div>

      <div className="mt-1">
        <p className="text-xs font-medium text-ink">{label}</p>
        {subtext && <p className="text-[11px] text-ink-subtle mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}
