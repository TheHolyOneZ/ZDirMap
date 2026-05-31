const UNITS = ["B", "KB", "MB", "GB", "TB", "PB"];

export function humanSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < UNITS.length - 1) {
    n /= 1024;
    i++;
  }
  const fixed = i === 0 ? "0" : n < 10 ? "1" : n < 100 ? "1" : "0";
  return `${n.toFixed(Number(fixed))} ${UNITS[i]}`;
}

export function relativeTime(epochSec: number | null | undefined): string {
  if (!epochSec) return "—";
  const now = Date.now() / 1000;
  const diff = now - epochSec;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}
