import React from "react";
import { getAlertLevel } from "@/lib/config";

interface AlertBadgeProps {
  pm25: number;
  showIqa?: boolean;
  size?: "sm" | "md" | "lg";
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({
  pm25,
  showIqa = false,
  size = "md",
}) => {
  const level = getAlertLevel(pm25);

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs font-medium",
    md: "px-3 py-1 text-sm font-semibold",
    lg: "px-4 py-1.5 text-base font-bold",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border shadow-sm transition-all ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${level.color}18`,
        borderColor: `${level.color}60`,
        color: level.color,
      }}
    >
      <span
        className="inline-block rounded-full animate-pulse"
        style={{
          width: size === "sm" ? 6 : size === "md" ? 8 : 10,
          height: size === "sm" ? 6 : size === "md" ? 8 : 10,
          backgroundColor: level.color,
          boxShadow: `0 0 8px ${level.color}`,
        }}
      />
      <span>{level.label}</span>
      {showIqa && (
        <span className="text-xs opacity-80 border-l border-current pl-1.5 ml-0.5">
          IQA {level.iqaRange}
        </span>
      )}
    </span>
  );
};
