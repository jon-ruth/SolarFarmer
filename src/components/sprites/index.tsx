"use client";

import { cn } from "@/lib/utils";

interface SpriteProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

/**
 * Solar Panel Sprite
 * CSS-based pixel art that can be swapped for real images later
 */
export function SolarPanelSprite({
  className,
  size = "md",
  animated = false,
  level = 1,
  isConstructing = false,
}: SpriteProps & { level?: number; isConstructing?: boolean }) {
  const baseClass = cn(
    sizeClasses[size],
    "relative pixel-art",
    animated && !isConstructing && "animate-pulse-glow",
    isConstructing && "opacity-50",
    className
  );

  // Color intensity based on level
  const panelColor = level >= 3 ? "#1e40af" : level >= 2 ? "#2563eb" : "#3b82f6";
  const frameColor = level >= 3 ? "#71717a" : level >= 2 ? "#a1a1aa" : "#d4d4d8";

  return (
    <div className={baseClass}>
      <svg viewBox="0 0 16 16" className="w-full h-full">
        {/* Frame */}
        <rect x="1" y="2" width="14" height="12" fill={frameColor} />
        {/* Panel cells - 2x3 grid */}
        <rect x="2" y="3" width="5" height="3" fill={panelColor} />
        <rect x="9" y="3" width="5" height="3" fill={panelColor} />
        <rect x="2" y="7" width="5" height="3" fill={panelColor} />
        <rect x="9" y="7" width="5" height="3" fill={panelColor} />
        <rect x="2" y="11" width="5" height="2" fill={panelColor} />
        <rect x="9" y="11" width="5" height="2" fill={panelColor} />
        {/* Grid lines */}
        <rect x="7" y="3" width="2" height="10" fill={frameColor} />
        <rect x="2" y="6" width="12" height="1" fill={frameColor} />
        <rect x="2" y="10" width="12" height="1" fill={frameColor} />
        {/* Shine effect */}
        <rect x="3" y="4" width="2" height="1" fill="#93c5fd" opacity="0.5" />
        {/* Construction indicator */}
        {isConstructing && (
          <g className="animate-pulse">
            <rect x="6" y="6" width="4" height="4" fill="#fbbf24" />
            <rect x="7" y="7" width="2" height="2" fill="#f59e0b" />
          </g>
        )}
      </svg>
      {level > 1 && (
        <span className="absolute -top-1 -right-1 bg-solar-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {level}
        </span>
      )}
    </div>
  );
}

/**
 * Battery Sprite
 */
export function BatterySprite({
  className,
  size = "md",
  animated = false,
  chargePercent = 100,
  isConstructing = false,
}: SpriteProps & { chargePercent?: number; isConstructing?: boolean }) {
  const baseClass = cn(
    sizeClasses[size],
    "relative pixel-art",
    animated && "animate-float",
    isConstructing && "opacity-50",
    className
  );

  const chargeColor =
    chargePercent > 60 ? "#22c55e" : chargePercent > 30 ? "#eab308" : "#ef4444";
  const chargeHeight = Math.floor((chargePercent / 100) * 8);

  return (
    <div className={baseClass}>
      <svg viewBox="0 0 16 16" className="w-full h-full">
        {/* Battery terminal */}
        <rect x="6" y="1" width="4" height="2" fill="#71717a" />
        {/* Battery body */}
        <rect x="3" y="3" width="10" height="12" fill="#a1a1aa" />
        <rect x="4" y="4" width="8" height="10" fill="#27272a" />
        {/* Charge level */}
        <rect
          x="5"
          y={14 - chargeHeight}
          width="6"
          height={chargeHeight}
          fill={chargeColor}
        />
        {/* Charge segments */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x="4"
            y={5 + i * 2.5}
            width="8"
            height="0.5"
            fill="#18181b"
            opacity="0.3"
          />
        ))}
        {isConstructing && (
          <g className="animate-pulse">
            <rect x="6" y="7" width="4" height="4" fill="#fbbf24" />
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * Home Building Sprite
 */
export function HomeSprite({
  className,
  size = "md",
  isPowered = false,
  level = 1,
}: SpriteProps & { isPowered?: boolean; level?: number }) {
  const baseClass = cn(
    sizeClasses[size],
    "relative pixel-art",
    isPowered && "animate-pulse-glow",
    className
  );

  const roofColor = level >= 2 ? "#dc2626" : "#ef4444";
  const wallColor = level >= 2 ? "#d4a574" : "#fbbf24";

  return (
    <div className={baseClass}>
      <svg viewBox="0 0 16 16" className="w-full h-full">
        {/* Roof */}
        <polygon points="8,1 1,7 15,7" fill={roofColor} />
        <polygon points="8,2 2,7 14,7" fill="#b91c1c" />
        {/* Walls */}
        <rect x="2" y="7" width="12" height="8" fill={wallColor} />
        {/* Door */}
        <rect x="6" y="10" width="4" height="5" fill="#92400e" />
        <rect x="9" y="12" width="1" height="1" fill="#fbbf24" />
        {/* Window */}
        <rect x="3" y="8" width="2" height="2" fill={isPowered ? "#fef08a" : "#1e293b"} />
        <rect x="11" y="8" width="2" height="2" fill={isPowered ? "#fef08a" : "#1e293b"} />
        {/* Chimney */}
        <rect x="11" y="2" width="2" height="4" fill="#78716c" />
      </svg>
      {level > 1 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {level}
        </span>
      )}
    </div>
  );
}

/**
 * School Building Sprite
 */
export function SchoolSprite({
  className,
  size = "md",
  isPowered = false,
  level = 1,
}: SpriteProps & { isPowered?: boolean; level?: number }) {
  const baseClass = cn(
    sizeClasses[size],
    "relative pixel-art",
    isPowered && "animate-pulse-glow",
    className
  );

  return (
    <div className={baseClass}>
      <svg viewBox="0 0 16 16" className="w-full h-full">
        {/* Main building */}
        <rect x="1" y="6" width="14" height="9" fill="#dc2626" />
        {/* Bell tower */}
        <rect x="6" y="2" width="4" height="5" fill="#b91c1c" />
        <polygon points="8,0 5,3 11,3" fill="#991b1b" />
        {/* Bell */}
        <circle cx="8" cy="4" r="1" fill="#fbbf24" />
        {/* Windows - 3x2 grid */}
        {[0, 1, 2].map((col) =>
          [0, 1].map((row) => (
            <rect
              key={`${col}-${row}`}
              x={2 + col * 4.5}
              y={7 + row * 3}
              width="2"
              height="2"
              fill={isPowered ? "#fef08a" : "#1e293b"}
            />
          ))
        )}
        {/* Door */}
        <rect x="6" y="11" width="4" height="4" fill="#78716c" />
        {/* Flag */}
        <rect x="13" y="1" width="1" height="5" fill="#78716c" />
        <rect x="10" y="1" width="3" height="2" fill="#3b82f6" />
      </svg>
      {level > 1 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {level}
        </span>
      )}
    </div>
  );
}

/**
 * Hospital Building Sprite
 */
export function HospitalSprite({
  className,
  size = "md",
  isPowered = false,
  level = 1,
}: SpriteProps & { isPowered?: boolean; level?: number }) {
  const baseClass = cn(
    sizeClasses[size],
    "relative pixel-art",
    isPowered && "animate-pulse-glow",
    className
  );

  return (
    <div className={baseClass}>
      <svg viewBox="0 0 16 16" className="w-full h-full">
        {/* Main building */}
        <rect x="1" y="4" width="14" height="11" fill="#f5f5f5" />
        <rect x="2" y="5" width="12" height="9" fill="#e5e5e5" />
        {/* Red cross */}
        <rect x="6" y="1" width="4" height="4" fill="#ef4444" />
        <rect x="7" y="0" width="2" height="6" fill="#dc2626" />
        <rect x="5" y="2" width="6" height="2" fill="#dc2626" />
        {/* Windows */}
        {[0, 1, 2].map((col) => (
          <rect
            key={col}
            x={3 + col * 4}
            y={6}
            width="2"
            height="3"
            fill={isPowered ? "#fef08a" : "#1e293b"}
          />
        ))}
        {/* Emergency entrance */}
        <rect x="5" y="10" width="6" height="5" fill="#ef4444" />
        <rect x="7" y="11" width="2" height="4" fill="#fef08a" />
        {/* Ambulance bay indicator */}
        <rect x="1" y="14" width="3" height="1" fill="#3b82f6" />
        <rect x="12" y="14" width="3" height="1" fill="#3b82f6" />
      </svg>
      {level > 1 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {level}
        </span>
      )}
    </div>
  );
}

/**
 * Factory Building Sprite
 */
export function FactorySprite({
  className,
  size = "md",
  isPowered = false,
  level = 1,
}: SpriteProps & { isPowered?: boolean; level?: number }) {
  const baseClass = cn(
    sizeClasses[size],
    "relative pixel-art",
    isPowered && "animate-pulse-glow",
    className
  );

  return (
    <div className={baseClass}>
      <svg viewBox="0 0 16 16" className="w-full h-full">
        {/* Smokestacks */}
        <rect x="2" y="1" width="3" height="6" fill="#71717a" />
        <rect x="7" y="2" width="3" height="5" fill="#71717a" />
        {/* Smoke (when powered) */}
        {isPowered && (
          <g className="animate-float">
            <circle cx="3.5" cy="0" r="1" fill="#d4d4d8" opacity="0.6" />
            <circle cx="8.5" cy="1" r="1" fill="#d4d4d8" opacity="0.6" />
          </g>
        )}
        {/* Main building */}
        <rect x="1" y="7" width="14" height="8" fill="#52525b" />
        {/* Roof detail */}
        <polygon points="1,7 8,4 8,7" fill="#3f3f46" />
        <polygon points="8,7 8,4 15,7" fill="#3f3f46" />
        {/* Windows */}
        {[0, 1, 2, 3].map((col) => (
          <rect
            key={col}
            x={2 + col * 3.5}
            y={9}
            width="2"
            height="2"
            fill={isPowered ? "#fef08a" : "#1e293b"}
          />
        ))}
        {/* Large door */}
        <rect x="6" y="11" width="4" height="4" fill="#27272a" />
        <rect x="7" y="12" width="2" height="3" fill="#3f3f46" />
      </svg>
      {level > 1 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {level}
        </span>
      )}
    </div>
  );
}

/**
 * Worker Sprite
 */
export function WorkerSprite({
  className,
  size = "md",
  isWorking = false,
  level = 1,
}: SpriteProps & { isWorking?: boolean; level?: number }) {
  const baseClass = cn(
    sizeClasses[size],
    "relative pixel-art",
    isWorking && "animate-bounce",
    className
  );

  const helmetColor = level >= 3 ? "#eab308" : level >= 2 ? "#f97316" : "#fbbf24";

  return (
    <div className={baseClass}>
      <svg viewBox="0 0 16 16" className="w-full h-full">
        {/* Hard hat */}
        <ellipse cx="8" cy="4" rx="4" ry="2" fill={helmetColor} />
        <rect x="4" y="3" width="8" height="2" fill={helmetColor} />
        {/* Face */}
        <rect x="5" y="5" width="6" height="4" fill="#fcd9bd" />
        {/* Eyes */}
        <rect x="6" y="6" width="1" height="1" fill="#1e293b" />
        <rect x="9" y="6" width="1" height="1" fill="#1e293b" />
        {/* Body (vest) */}
        <rect x="4" y="9" width="8" height="5" fill="#f97316" />
        <rect x="7" y="9" width="2" height="5" fill="#ea580c" />
        {/* Arms */}
        <rect x="2" y="9" width="2" height="4" fill="#fcd9bd" />
        <rect x="12" y="9" width="2" height="4" fill="#fcd9bd" />
        {/* Tool (when working) */}
        {isWorking && (
          <g className="animate-pulse">
            <rect x="13" y="7" width="2" height="6" fill="#71717a" />
            <rect x="12" y="6" width="4" height="2" fill="#a1a1aa" />
          </g>
        )}
        {/* Legs */}
        <rect x="5" y="14" width="2" height="2" fill="#1e40af" />
        <rect x="9" y="14" width="2" height="2" fill="#1e40af" />
      </svg>
      {level > 1 && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {level}
        </span>
      )}
      {isWorking && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs">
          🔨
        </span>
      )}
    </div>
  );
}

/**
 * Sun Sprite (for decoration/branding)
 */
export function SunSprite({
  className,
  size = "md",
  animated = true,
}: SpriteProps) {
  const baseClass = cn(
    sizeClasses[size],
    "relative pixel-art",
    animated && "animate-pulse-glow",
    className
  );

  return (
    <div className={baseClass}>
      <svg viewBox="0 0 16 16" className="w-full h-full">
        {/* Sun rays */}
        <rect x="7" y="0" width="2" height="3" fill="#fbbf24" />
        <rect x="7" y="13" width="2" height="3" fill="#fbbf24" />
        <rect x="0" y="7" width="3" height="2" fill="#fbbf24" />
        <rect x="13" y="7" width="3" height="2" fill="#fbbf24" />
        {/* Diagonal rays */}
        <rect
          x="2"
          y="2"
          width="2"
          height="2"
          fill="#fbbf24"
          transform="rotate(45 3 3)"
        />
        <rect
          x="12"
          y="2"
          width="2"
          height="2"
          fill="#fbbf24"
          transform="rotate(45 13 3)"
        />
        <rect
          x="2"
          y="12"
          width="2"
          height="2"
          fill="#fbbf24"
          transform="rotate(45 3 13)"
        />
        <rect
          x="12"
          y="12"
          width="2"
          height="2"
          fill="#fbbf24"
          transform="rotate(45 13 13)"
        />
        {/* Sun body */}
        <circle cx="8" cy="8" r="4" fill="#fbbf24" />
        <circle cx="8" cy="8" r="3" fill="#f59e0b" />
        {/* Face */}
        <rect x="6" y="7" width="1" height="1" fill="#92400e" />
        <rect x="9" y="7" width="1" height="1" fill="#92400e" />
        <rect x="7" y="9" width="2" height="1" fill="#92400e" />
      </svg>
    </div>
  );
}
