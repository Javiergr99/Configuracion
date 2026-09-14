import { ImagePlus, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  readableAssetSize,
  validateIdentityAsset,
} from "@/features/appearance-settings/model/identity-asset-validation";
import { cn } from "@/shared/lib/cn";

export function IdentityAssetUploader({
  label,
  description,
  accept = ".svg,.png,.webp",
  compact = false,
  onFileChange,
}: {
  label: string;
  description?: string;
  accept?: string;
  compact?: boolean;
  onFileChange?: (file: File | null, previewUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    onFileChange?.(null, null);
  };

  const processFile = (nextFile: File) => {
    const validationError = validateIdentityAsset(nextFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreview = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setPreviewUrl(nextPreview);
    setError(null);
    onFileChange?.(nextFile, nextPreview);
  };

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-[var(--ui-text-primary)]">{label}</span>
        {file ? (
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">
            Cargado
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="mb-2 text-[9px] leading-3.5 text-slate-400">{description}</p>
      ) : null}

      {file && previewUrl ? (
        <div className="rounded-lg border border-[var(--ui-border)] bg-slate-50/60 p-2.5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "grid shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--ui-border)] bg-white",
                compact ? "h-10 w-10" : "h-12 w-20",
              )}
            >
              <img
                src={previewUrl}
                alt="Vista previa del recurso"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold text-[var(--ui-text-primary)]">
                {file.name}
              </p>
              <p className="mt-0.5 text-[9px] text-slate-400">
                {file.type || "imagen"} · {readableAssetSize(file.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearPreview}
              aria-label={`Eliminar ${label}`}
              className="h-8 min-h-8 w-8 text-red-500 hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const nextFile = event.dataTransfer.files[0];
            if (nextFile) processFile(nextFile);
          }}
          className={cn(
            "focus-ring grid w-full place-items-center rounded-lg border border-dashed border-[var(--ui-border)] bg-slate-50/60 px-3 text-center transition hover:border-brand-300 hover:bg-brand-50/30",
            compact ? "min-h-[68px]" : "min-h-[88px]",
            dragging && "border-[var(--ui-primary)] bg-brand-50/50",
          )}
        >
          <span>
            {compact ? (
              <ImagePlus className="mx-auto h-4 w-4 text-slate-400" />
            ) : (
              <UploadCloud className="mx-auto h-4 w-4 text-slate-400" />
            )}
            <span className="mt-1.5 block text-[9px] text-slate-400">
              Arrastra un archivo o haz clic para subir
            </span>
            <span className="mt-0.5 block text-[8px] text-slate-400">
              SVG, PNG o WebP · Máx. 2 MB
            </span>
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        aria-label={`Subir ${label}`}
        className="sr-only"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          if (nextFile) processFile(nextFile);
          event.target.value = "";
        }}
      />

      {error ? (
        <div className="mt-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-[9px] font-medium text-red-500">
          {error}
        </div>
      ) : null}
    </div>
  );
}
