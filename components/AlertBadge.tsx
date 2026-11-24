import React from "react";
import { getAlertLevel } from "@/lib/config";

interface AlertBadgeProps {
  pm25: number;
  showIqa?: boolean;
  size?: "sm" | "md" | "lg";
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({
  pm25,
  size = "md",
}) => {
  const level = getAlertLevel(pm25);

  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base font-medium" : "text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 ${textSize} text-ink`}>
      <span
        className={`inline-block rounded-full ${dotSize} shrink-0`}
        style={{ backgroundColor: level.color }}
      />
      <span>{level.label}</span>
    </span>
  );
};

export default AlertBadge;
