"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  className,
  showLabel = false,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("relative", className)}>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs text-gray-500">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}
