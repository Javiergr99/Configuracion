export const IDENTITY_ASSET_MAX_BYTES = 2 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/svg+xml",
  "image/png",
  "image/webp",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

const allowedExtensions = new Set(["svg", "png", "webp", "ico"]);

export function validateIdentityAsset(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!allowedMimeTypes.has(file.type) && !allowedExtensions.has(extension)) {
    return "Formato no compatible. Utiliza SVG, PNG, WebP o ICO.";
  }
  if (file.size > IDENTITY_ASSET_MAX_BYTES) {
    return "El archivo excede el tamaño máximo permitido (2 MB).";
  }
  return null;
}

export function readableAssetSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
