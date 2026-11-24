"use client";

interface DakarSkyGradientProps {
  pm25: number;
  hour: number;
  children?: React.ReactNode;
  className?: string;
}

function getSkyGradient(pm25: number, hour: number): string {
  const isNight = hour >= 20 || hour < 6;
  const isDawn = hour >= 6 && hour <= 8;
  const isDusk = hour >= 18 && hour < 20;

  if (isNight) {
    return "linear-gradient(to bottom, #1A2535 0%, #2C3D52 100%)";
  }
  if (isDawn) {
    return "linear-gradient(to bottom, #D4826A 0%, #E8C49A 40%, #F6F1E7 100%)";
  }
  if (isDusk) {
    return "linear-gradient(to bottom, #C97A45 0%, #DEB88A 50%, #F0E8D8 100%)";
  }

  // Journée : couleur liée au niveau de pollution
  if (pm25 <= 15) {
    // Bon : bleu clair
    return "linear-gradient(to bottom, #B8D4E8 0%, #D8EAF4 50%, #F6F1E7 100%)";
  }
  if (pm25 <= 35) {
    // Moyen : ocre léger, voile de poussière
    return "linear-gradient(to bottom, #D4B87A 0%, #E5CFA0 50%, #F5EDD8 100%)";
  }
  if (pm25 <= 55) {
    // Mauvais : ocre chargé
    return "linear-gradient(to bottom, #C4904A 0%, #D9AB78 50%, #EDD8B0 100%)";
  }
  // Très mauvais : brume épaisse
  return "linear-gradient(to bottom, #A8723C 0%, #C49068 50%, #DDBF98 100%)";
}

export default function DakarSkyGradient({
  pm25,
  hour,
  children,
  className = "",
}: DakarSkyGradientProps) {
  const gradient = getSkyGradient(pm25, hour);
  const isNight = hour >= 20 || hour < 6;

  return (
    <div
      className={`relative overflow-hidden transition-all duration-1000 ${className}`}
      style={{ background: gradient }}
      data-night={isNight}
    >
      {children}
    </div>
  );
}
