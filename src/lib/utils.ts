import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatSolar(amount: bigint): string {
  const num = Number(amount) / 1e18;
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + "K";
  }
  return num.toFixed(2);
}

export function formatEth(amount: bigint): string {
  const num = Number(amount) / 1e18;
  return num.toFixed(6);
}

export function formatTimeRemaining(endTime: Date): string {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) return "Complete";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getConstructionProgress(
  startTime: Date | null,
  endTime: Date | null
): number {
  if (!startTime || !endTime) return 0;

  const now = new Date();
  const total = endTime.getTime() - startTime.getTime();
  const elapsed = now.getTime() - startTime.getTime();

  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
