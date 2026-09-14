import { normalizeHex } from "@/features/appearance-settings/model/appearance.utils";

function channelToLinear(channel: number): number {
  const normalized = channel / 255;

  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const normalized = normalizeHex(hex, "#000000").slice(1);

  /*
   * Se obtienen los canales de manera explícita para conservar el tipo
   * `number` bajo `noUncheckedIndexedAccess`. Un destructuring procedente
   * de `Array.map()` puede inferirse como `number | undefined`.
   */
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return (
    0.2126 * channelToLinear(red) + 0.7152 * channelToLinear(green) + 0.0722 * channelToLinear(blue)
  );
}

export function getContrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastLevel = "aa" | "large" | "fail";

export function getContrastLevel(foreground: string, background: string): ContrastLevel {
  const ratio = getContrastRatio(foreground, background);

  if (ratio >= 4.5) return "aa";
  if (ratio >= 3) return "large";

  return "fail";
}
