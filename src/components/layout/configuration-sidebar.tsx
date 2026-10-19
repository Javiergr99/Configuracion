import type { MouseEvent } from "react";
import { useMemo, useState } from "react";
import { ChevronDown, Dot } from "lucide-react";
import { NavLink, useLocation } from "react-router";

import {
  canAccessNavigationItem,
  getVisibleNavigationChildren,
  sidebarNavigation,
  type NavigationItem,
} from "@/shared/config/navigation";
import { cn } from "@/shared/lib/cn";

type ConfigurationSidebarProps = {
  permissions?: readonly string[];
  onNavigate?: () => void;
  variant?: "desktop" | "drawer";
};

const EMPTY_PERMISSIONS: readonly string[] = [];
const PRIMARY_ITEM_CLASS =
  "focus-ring flex min-h-10 w-full items-center overflow-hidden rounded-md text-[13px] leading-5 font-semibold text-[var(--ui-sidebar-text)] transition-colors hover:bg-black/10 hover:text-[var(--ui-sidebar-text)]";
const PRIMARY_ICON_CLASS = "h-[17px] w-[17px] shrink-0";
const PRIMARY_LABEL_CLASS = "font-sans text-[13px] font-semibold leading-5 tracking-normal";

function isPrimaryNavigation(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isGroupRouteActive(item: NavigationItem, pathname: string): boolean {
  return (item.children ?? []).some((child) =>
    child.to === "/app/usuarios"
      ? pathname === child.to || /^\/app\/usuarios\/[^/]+\/editar$/.test(pathname)
      : pathname === child.to || pathname.startsWith(`${child.to}/`),
  );
}

export function ConfigurationSidebar({
  permissions = EMPTY_PERMISSIONS,
  onNavigate,
  variant = "desktop",
}: ConfigurationSidebarProps) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());

  const visibleItems = useMemo(
    () => sidebarNavigation.filter((item) => canAccessNavigationItem(item, permissions)),
    [permissions],
  );

  function handleStandaloneNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPrimaryNavigation(event)) return;

    setOpenGroups((current) => (current.size ? new Set<string>() : current));
    onNavigate?.();
  }

  function handleGroupChildNavigation(event: MouseEvent<HTMLAnchorElement>, label: string) {
    if (!isPrimaryNavigation(event)) return;

    setOpenGroups((current) => {
      if (!current.has(label)) return current;

      const next = new Set(current);
      next.delete(label);
      return next;
    });
    onNavigate?.();
  }

  function toggleGroup(label: string) {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "overflow-x-hidden overflow-y-auto border-r border-black/10 bg-[var(--ui-sidebar)] px-2 py-3",
        variant === "drawer"
          ? "h-full w-full"
          : "fixed bottom-0 left-0 top-[var(--header-height)] z-30 hidden w-[var(--sidebar-current-width)] lg:block",
      )}
      aria-label="Navegación lateral de configuración"
    >
      <nav className="space-y-1" aria-label="Módulos de configuración">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          if (item.children?.length) {
            const children = getVisibleNavigationChildren(item, permissions);
            if (!children.length) return null;

            const active = isGroupRouteActive(item, location.pathname);
            const open = openGroups.has(item.label);

            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    PRIMARY_ITEM_CLASS,
                    variant === "drawer"
                      ? "justify-start gap-2.5 px-3"
                      : "justify-center px-2 md:justify-start md:gap-2.5 md:px-3",
                    active &&
                      "bg-[var(--ui-primary-soft)] text-[var(--ui-primary)] hover:bg-[var(--ui-primary-soft)] hover:text-[var(--ui-primary)]",
                  )}
                  aria-expanded={open}
                  title={item.label}
                >
                  <Icon className={PRIMARY_ICON_CLASS} strokeWidth={1.8} aria-hidden="true" />
                  <span
                    className={cn(
                      PRIMARY_LABEL_CLASS,
                      variant === "drawer"
                        ? "min-w-0 flex-1 truncate whitespace-nowrap text-left"
                        : "hidden min-w-0 flex-1 truncate whitespace-nowrap text-left md:block",
                    )}
                  >
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 transition-transform",
                      variant === "desktop" && "hidden md:block",
                      open && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>

                {open ? (
                  <div
                    className={cn(
                      "mt-1 space-y-1",
                      variant === "drawer"
                        ? "ml-6 border-l border-white/25 pl-2"
                        : "md:ml-6 md:border-l md:border-white/25 md:pl-2",
                    )}
                  >
                    {children.map((child) => {
                      const ChildIcon = child.icon ?? Dot;

                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end={child.to === "/app/usuarios"}
                          onClick={(event) => handleGroupChildNavigation(event, item.label)}
                          title={child.label}
                          className={({ isActive }) =>
                            cn(
                              "focus-ring flex min-h-9 items-center rounded-md px-2 text-[12px] font-medium text-[var(--ui-sidebar-text)] transition-colors hover:bg-black/10 hover:text-[var(--ui-sidebar-text)]",
                              variant === "drawer"
                                ? "justify-start gap-1.5"
                                : "justify-center md:justify-start md:gap-1.5",
                              isActive &&
                                "bg-[var(--ui-primary-soft)] font-semibold text-[var(--ui-primary)]",
                            )
                          }
                        >
                          <ChildIcon
                            className="h-4 w-4 shrink-0"
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                          <span
                            className={cn(
                              "min-w-0 truncate",
                              variant === "desktop" && "hidden md:block",
                            )}
                          >
                            {child.label}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

          if (!item.to) return null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              title={item.label}
              onClick={handleStandaloneNavigation}
              className={({ isActive }) =>
                cn(
                  PRIMARY_ITEM_CLASS,
                  variant === "drawer"
                    ? "justify-start gap-2.5 px-3"
                    : "justify-center px-2 md:justify-start md:gap-2.5 md:px-3",
                  isActive &&
                    "bg-[var(--ui-primary-soft)] text-[var(--ui-primary)] hover:bg-[var(--ui-primary-soft)] hover:text-[var(--ui-primary)]",
                )
              }
            >
              <Icon className={PRIMARY_ICON_CLASS} strokeWidth={1.8} aria-hidden="true" />
              <span
                className={cn(
                  PRIMARY_LABEL_CLASS,
                  variant === "drawer"
                    ? "min-w-0 flex-1 truncate whitespace-nowrap text-left"
                    : "hidden min-w-0 flex-1 truncate whitespace-nowrap text-left md:block",
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
