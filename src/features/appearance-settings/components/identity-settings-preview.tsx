import { Activity, UserRound } from "lucide-react";
import { useState } from "react";

import { useIdentityAssetPreviewStore } from "@/features/appearance-settings/model/identity-assets.store";
import { useIdentityStore } from "@/features/appearance-settings/model/identity.store";
import { cn } from "@/shared/lib/cn";

const previewThemes = ["Claro", "Oscuro", "Color principal"] as const;
type PreviewTheme = (typeof previewThemes)[number];

export function IdentitySettingsPreview() {
  const identity = useIdentityStore((state) => state.draft);
  const primaryLogoPreview = useIdentityAssetPreviewStore((state) => state.previews.primaryLogo);
  const [theme, setTheme] = useState<PreviewTheme>("Claro");

  const isDark = theme === "Oscuro";
  const isPrimary = theme === "Color principal";
  const shellBackground = isDark ? "#0f172a" : isPrimary ? "var(--ui-primary)" : "var(--ui-canvas)";
  const surfaceBackground = isDark ? "#111827" : "var(--ui-surface)";
  const previewText = isDark || isPrimary ? "#ffffff" : "var(--ui-text-primary)";
  const secondaryText = isDark || isPrimary ? "#cbd5e1" : "var(--ui-text-secondary)";

  return (
    <div className="sticky top-0 rounded-[var(--ui-card-radius)] border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 shadow-[var(--ui-card-shadow)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-bold text-[var(--ui-text-primary)]">Vista previa</h2>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Tiempo real
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 rounded-md bg-slate-100 p-0.5">
        {previewThemes.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTheme(item)}
            className={cn(
              "focus-ring rounded-[5px] px-2 py-1.5 text-[10px] font-medium text-slate-500",
              theme === item && "bg-white font-semibold text-slate-700 shadow-sm",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div
        className="mt-3 overflow-hidden rounded-lg border border-[var(--ui-border)]"
        style={{ background: shellBackground }}
      >
        <div
          className="flex h-8 items-center justify-between border-b border-black/5 px-2.5"
          style={{ background: surfaceBackground }}
        >
          <div className="flex items-center gap-1.5">
            {primaryLogoPreview ? (
              <span className="grid h-4 w-7 place-items-center overflow-hidden rounded-[3px] bg-white/90 px-0.5">
                <img
                  src={primaryLogoPreview}
                  alt=""
                  className="max-h-3.5 max-w-full object-contain"
                />
              </span>
            ) : (
              <span className="grid h-4 w-4 place-items-center rounded-[3px] bg-[var(--ui-primary)] text-white">
                <Activity className="h-2.5 w-2.5" />
              </span>
            )}
            <span className="text-[7px] font-bold" style={{ color: previewText }}>
              {identity.systemName}
            </span>
            <span className="text-[5px] font-semibold text-[var(--ui-primary)]">
              {identity.versionText}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-100 text-[5px] font-bold text-brand-700">
              JD
            </span>
            <span className="text-[6px] font-semibold" style={{ color: previewText }}>
              Juan D.
            </span>
          </div>
        </div>

        <div className="grid min-h-[248px] grid-cols-[44px_1fr]">
          <aside className="bg-[var(--ui-sidebar)] p-2">
            <span className="mb-3 grid h-5 w-5 place-items-center rounded-[4px] bg-white text-[var(--ui-primary)]">
              <Activity className="h-3 w-3" />
            </span>
            <div className="space-y-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-1">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-sm",
                      item === 0 ? "bg-white" : "bg-[var(--ui-sidebar-text)] opacity-80",
                    )}
                  />
                  <span className="h-1 w-4 rounded bg-[var(--ui-sidebar-text)] opacity-70" />
                </div>
              ))}
            </div>
          </aside>

          <section className="p-3">
            <h3 className="text-[10px] font-bold" style={{ color: previewText }}>
              {identity.systemName}
            </h3>
            <p className="mt-0.5 text-[6px]" style={{ color: secondaryText }}>
              {identity.responsibleInstitution}
            </p>
            <div
              className="mt-3 inline-flex items-center gap-1.5 rounded border border-black/5 px-2 py-1"
              style={{ background: surfaceBackground }}
            >
              <Activity className="h-2.5 w-2.5 text-[var(--ui-primary)]" />
              <span className="text-[6px] font-semibold" style={{ color: previewText }}>
                {identity.systemName}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-[7px] font-bold"
                style={{
                  backgroundColor: identity.avatarBackground,
                  color: identity.avatarTextColor,
                }}
              >
                {identity.avatarMode === "initials" ? (
                  identity.avatarInitials
                ) : (
                  <UserRound className="h-3.5 w-3.5" />
                )}
              </span>
              <div>
                <p className="text-[7px] font-semibold" style={{ color: previewText }}>
                  Usuario institucional
                </p>
                <p className="text-[5px]" style={{ color: secondaryText }}>
                  Avatar predeterminado
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
