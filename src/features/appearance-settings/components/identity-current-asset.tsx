import { Activity } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  readableAssetSize,
  validateIdentityAsset,
} from "@/features/appearance-settings/model/identity-asset-validation";
import { cn } from "@/shared/lib/cn";

type IdentityAssetVariant = "logo" | "compact" | "favicon";
type IdentityAssetStatus = "Cargado" | "Pendiente";
type FileMeta = { name: string; type: string; size: number };

type IdentityCurrentAssetProps = {
  label: string;
  status?: IdentityAssetStatus;
  variant?: IdentityAssetVariant;
  dark?: boolean;
  accept?: string;
  onFileChange?: (file: File | null, previewUrl: string | null) => void;
};

function DefaultAssetPreview({ variant }: { variant: IdentityAssetVariant }) {
  if (variant === "logo") {
    return (
      <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--ui-primary)] px-3 text-[8px] font-bold text-white">
        <Activity className="h-3.5 w-3.5" aria-hidden="true" /> Ecosistema DGCP
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--ui-primary)] text-white">
        <Activity className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className="flex h-7 w-[150px] items-center gap-1.5 rounded bg-white px-2 text-[7px] font-semibold text-slate-600 shadow-sm">
      <Activity className="h-3 w-3 text-[var(--ui-primary)]" aria-hidden="true" /> Ecosistema
      Integral DGCP
    </span>
  );
}

function AssetPreview({
  previewUrl,
  label,
  variant,
}: {
  previewUrl: string | null;
  label: string;
  variant: IdentityAssetVariant;
}) {
  if (!previewUrl) {
    return <DefaultAssetPreview variant={variant} />;
  }

  return (
    <img
      src={previewUrl}
      alt={`Vista previa de ${label}`}
      className={cn("max-w-[86%] object-contain", variant === "compact" ? "max-h-8" : "max-h-10")}
    />
  );
}

function defaultAssetMetadata(variant: IdentityAssetVariant): string {
  if (variant === "logo") return "logo-ecosistema.svg · SVG · 240 × 60 px · 12 KB";
  if (variant === "compact") return "icon-ecosistema.svg · SVG · 32 × 32 px · 4 KB";
  return "favicon.svg · SVG · 16 × 16 px · 1 KB";
}

function assetMetadata(fileMeta: FileMeta | null, variant: IdentityAssetVariant): string {
  if (!fileMeta) return defaultAssetMetadata(variant);

  return `${fileMeta.name} · ${fileMeta.type} · ${readableAssetSize(fileMeta.size)}`;
}

export function IdentityCurrentAsset({
  label,
  status = "Cargado",
  variant = "logo",
  dark = false,
  accept = ".svg,.png,.webp,.ico",
  onFileChange,
}: IdentityCurrentAssetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const replaceFile = (file: File) => {
    const validationError = validateIdentityAsset(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    setFileMeta({ name: file.name, type: file.type || "imagen", size: file.size });
    setError(null);
    onFileChange?.(file, nextUrl);
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPreviewUrl(null);
    setFileMeta(null);
    setError(null);
    onFileChange?.(null, null);
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-[var(--ui-text-primary)]">{label}</span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[8px] font-bold",
            status === "Cargado" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600",
          )}
        >
          {status}
        </span>
      </div>

      <div
        className={cn(
          "grid min-h-[54px] place-items-center rounded-lg border border-[var(--ui-border)]",
          dark ? "bg-[#0f1a31]" : "bg-slate-50/70",
        )}
      >
        <AssetPreview previewUrl={previewUrl} label={label} variant={variant} />
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[8px] text-slate-400">
        <span>{assetMetadata(fileMeta, variant)}</span>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="h-auto min-h-0 px-0 py-0 text-[9px] text-[var(--ui-primary)] hover:bg-transparent"
        >
          Reemplazar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFile}
          className="h-auto min-h-0 px-0 py-0 text-[9px] text-red-500 hover:bg-transparent"
        >
          Eliminar
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        aria-label={`Reemplazar ${label}`}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) replaceFile(file);
          event.target.value = "";
        }}
      />

      {error ? (
        <p className="mt-1.5 rounded bg-red-50 px-2 py-1 text-[8px] font-medium text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
